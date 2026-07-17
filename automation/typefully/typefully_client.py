"""
Typefully API client.

Minimal REST wrapper around the public Typefully API (docs:
https://support.typefully.com/en/articles/8718287-typefully-api).

Design notes
------------
- Auth is a single header, `X-API-KEY`.  Typefully rotates keys under
  Settings -> Integrations -> API in the web app.
- Threads are created by joining tweets with the sentinel `\n\n\n\n`
  ("four newlines").  That is the officially documented separator and is
  the reason a "thread" is a *single* draft resource on Typefully's side.
- Media on the public API is currently limited to attach-by-URL (public
  Twitter/X requires accessible URLs).  As a fallback for local files
  we support uploading via the private `/upload/` multipart endpoint if
  it is reachable; if it returns 404 (Typefully has removed it in your
  workspace) we degrade gracefully and skip the media instead of dying.
- Rate-limit / 5xx handling: exponential backoff with jitter, capped
  at 5 retries.  On 429 we honour `Retry-After` if present.
- All datetimes must be tz-aware; we serialise to RFC3339 in UTC.

The client is intentionally small — every method returns raw JSON so
the calling script can log/persist whatever it wants.
"""

from __future__ import annotations

import json
import logging
import os
import random
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

log = logging.getLogger("typefully")

API_BASE = "https://api.typefully.com/v1"
THREAD_SEPARATOR = "\n\n\n\n"  # Typefully's official thread delimiter
MAX_TWEET_CHARS = 280
DEFAULT_TIMEOUT = 30
MAX_RETRIES = 5


class TypefullyError(RuntimeError):
    """Raised for non-retryable Typefully API failures."""


class TweetTooLongError(TypefullyError):
    """Raised when a tweet exceeds MAX_TWEET_CHARS."""


@dataclass
class DraftResult:
    """Thin wrapper around Typefully's draft creation response."""
    id: str | int
    share_url: str | None
    scheduled_date: str | None
    raw: dict[str, Any]


def _to_rfc3339_utc(dt: datetime | None) -> str | None:
    """Serialise a datetime as RFC3339 UTC. Requires tz-aware input."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        raise ValueError("schedule_at must be timezone-aware")
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def validate_tweet_length(text: str) -> int:
    """Return the tweet char count.  Raise if it exceeds Twitter's limit.

    Note: Twitter counts URLs as 23 chars regardless of actual length via
    t.co wrapping.  We don't replicate that here — this is a hard cap for
    safety, so a tweet with a long URL that would render OK on Twitter may
    still be flagged.  Better to be strict than lose a post to truncation.
    """
    n = len(text)
    if n > MAX_TWEET_CHARS:
        raise TweetTooLongError(
            f"Tweet is {n} chars (max {MAX_TWEET_CHARS}): {text[:80]!r}..."
        )
    return n


class TypefullyClient:
    """Small stateful client around the Typefully v1 API."""

    def __init__(self, api_key: str | None = None, *, session: requests.Session | None = None):
        self.api_key = api_key or os.environ.get("TYPEFULLY_API_KEY")
        if not self.api_key:
            raise TypefullyError(
                "TYPEFULLY_API_KEY is not set (pass api_key= or export the env var)."
            )
        self.session = session or requests.Session()
        self.session.headers.update({
            "X-API-KEY": f"Bearer {self.api_key}",
            "User-Agent": "r5tools-typefully-client/1.0",
        })

    # ------------------------------------------------------------------
    # Low-level HTTP with retry
    # ------------------------------------------------------------------
    def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: dict | None = None,
        files: dict | None = None,
        data: dict | None = None,
        params: dict | None = None,
    ) -> Any:
        url = f"{API_BASE}{path}"
        last_exc: Exception | None = None
        for attempt in range(MAX_RETRIES):
            try:
                # Don't send Content-Type: application/json when uploading
                # multipart; requests sets the right boundary header itself.
                headers = None
                if files is None and json_body is not None:
                    headers = {"Content-Type": "application/json"}
                resp = self.session.request(
                    method,
                    url,
                    json=json_body,
                    files=files,
                    data=data,
                    params=params,
                    headers=headers,
                    timeout=DEFAULT_TIMEOUT,
                )
            except requests.RequestException as exc:
                last_exc = exc
                backoff = min(2 ** attempt + random.random(), 30)
                log.warning("Network error on %s %s (attempt %d): %s — sleeping %.1fs",
                            method, path, attempt + 1, exc, backoff)
                time.sleep(backoff)
                continue

            # Success
            if 200 <= resp.status_code < 300:
                if not resp.content:
                    return {}
                try:
                    return resp.json()
                except ValueError:
                    return {"raw": resp.text}

            # 429 rate limit — honour Retry-After if present
            if resp.status_code == 429:
                retry_after = resp.headers.get("Retry-After")
                try:
                    delay = float(retry_after) if retry_after else (2 ** attempt) + random.random()
                except ValueError:
                    delay = (2 ** attempt) + random.random()
                log.warning("429 rate-limited on %s %s — sleeping %.1fs (attempt %d/%d)",
                            method, path, delay, attempt + 1, MAX_RETRIES)
                time.sleep(min(delay, 60))
                continue

            # 5xx — retry with backoff
            if 500 <= resp.status_code < 600:
                backoff = min(2 ** attempt + random.random(), 30)
                log.warning("5xx on %s %s (%d): %s — retrying in %.1fs",
                            method, path, resp.status_code, resp.text[:200], backoff)
                time.sleep(backoff)
                continue

            # 4xx other than 429 — non-retryable
            raise TypefullyError(
                f"{method} {path} failed with {resp.status_code}: {resp.text[:500]}"
            )

        raise TypefullyError(
            f"{method} {path} exhausted {MAX_RETRIES} retries. Last error: {last_exc!r}"
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def create_thread(
        self,
        tweets: list[dict],
        schedule_at: datetime | None = None,
        *,
        auto_retweet_enabled: bool = False,
        auto_plug_enabled: bool = False,
        threadify: bool = False,
    ) -> DraftResult:
        """Create a scheduled thread draft.

        Each item in `tweets` is a dict with at least `text`, optionally
        `media` (list of str — local file paths OR public URLs).  Media
        URLs are attached inline in Typefully via <media-url> markers
        appended to the tweet body per Typefully convention; if the value
        is a local file path we try to upload it first.
        """
        if not tweets:
            raise ValueError("create_thread requires at least one tweet")

        # Validate lengths up front — refuse to POST a busted thread
        for i, t in enumerate(tweets):
            validate_tweet_length(t["text"])
            log.debug("tweet %d: %d chars OK", i + 1, len(t["text"]))

        # Convert media references to URLs (upload local files first)
        rendered_tweets: list[str] = []
        for i, t in enumerate(tweets):
            body = t["text"]
            media_paths = t.get("media") or []
            media_urls = self._materialize_media(media_paths, tweet_index=i)
            if media_urls:
                # Typefully appends media via a trailing block on the tweet body.
                # Per API docs, use the `content` field with URLs inlined at the
                # end of each tweet segment.
                body = body + "\n" + "\n".join(media_urls)
            rendered_tweets.append(body)

        content = THREAD_SEPARATOR.join(rendered_tweets)

        payload: dict[str, Any] = {
            "content": content,
            "threadify": threadify,
            "auto_retweet_enabled": auto_retweet_enabled,
            "auto_plug_enabled": auto_plug_enabled,
        }
        if schedule_at is not None:
            payload["schedule-date"] = _to_rfc3339_utc(schedule_at)

        log.info("Creating thread draft with %d tweets (schedule=%s)",
                 len(tweets), payload.get("schedule-date", "none"))
        raw = self._request("POST", "/drafts/", json_body=payload)
        return self._parse_draft(raw)

    def create_single(
        self,
        text: str,
        media: list[str] | None = None,
        schedule_at: datetime | None = None,
        *,
        auto_retweet_enabled: bool = False,
        auto_plug_enabled: bool = False,
    ) -> DraftResult:
        """Create a single (non-thread) scheduled draft."""
        validate_tweet_length(text)
        media_urls = self._materialize_media(media or [], tweet_index=0)
        body = text
        if media_urls:
            body = text + "\n" + "\n".join(media_urls)

        payload: dict[str, Any] = {
            "content": body,
            "auto_retweet_enabled": auto_retweet_enabled,
            "auto_plug_enabled": auto_plug_enabled,
        }
        if schedule_at is not None:
            payload["schedule-date"] = _to_rfc3339_utc(schedule_at)

        log.info("Creating single draft (%d chars, schedule=%s)",
                 len(text), payload.get("schedule-date", "none"))
        raw = self._request("POST", "/drafts/", json_body=payload)
        return self._parse_draft(raw)

    def list_scheduled(self) -> list[dict]:
        """Return currently scheduled drafts.

        The public API exposes `/drafts/recently-scheduled/` for this.
        If your workspace only supports `/drafts/` filtered by state we
        transparently fall back.
        """
        try:
            data = self._request("GET", "/drafts/recently-scheduled/")
        except TypefullyError:
            log.debug("recently-scheduled endpoint unavailable, falling back to /drafts/")
            data = self._request("GET", "/drafts/", params={"state": "scheduled"})

        # Normalise: some responses come back as a bare list, others wrap
        # in {"results": [...]} or {"drafts": [...]}
        if isinstance(data, list):
            return data
        for key in ("results", "drafts", "data"):
            if isinstance(data, dict) and key in data and isinstance(data[key], list):
                return data[key]
        return []

    def list_recently_published(self) -> list[dict]:
        data = self._request("GET", "/drafts/recently-published/")
        if isinstance(data, list):
            return data
        for key in ("results", "drafts", "data"):
            if isinstance(data, dict) and key in data and isinstance(data[key], list):
                return data[key]
        return []

    def cancel_scheduled(self, draft_id: str | int) -> dict:
        """Cancel/delete a scheduled draft.

        Typefully's cancel is `DELETE /drafts/{id}/` per the docs; some
        older accounts saw a `PATCH` that clears the schedule.  We try
        DELETE first and fall back to PATCH.
        """
        try:
            return self._request("DELETE", f"/drafts/{draft_id}/") or {}
        except TypefullyError as exc:
            log.warning("DELETE failed for draft %s (%s), trying PATCH clear", draft_id, exc)
            return self._request(
                "PATCH", f"/drafts/{draft_id}/", json_body={"schedule-date": None}
            ) or {}

    # ------------------------------------------------------------------
    # Media helpers
    # ------------------------------------------------------------------
    def _materialize_media(self, refs: list[str], *, tweet_index: int) -> list[str]:
        """Turn media refs (paths or URLs) into URLs Typefully accepts."""
        out: list[str] = []
        for ref in refs:
            if not ref:
                continue
            if ref.startswith(("http://", "https://")):
                out.append(ref)
                continue

            p = Path(ref)
            if not p.exists():
                log.warning("Media file missing (tweet %d): %s — skipping", tweet_index + 1, ref)
                continue

            url = self._upload_media(p)
            if url:
                out.append(url)
            else:
                log.warning(
                    "Could not upload %s to Typefully — you'll need to attach it manually "
                    "in the Typefully composer for tweet %d.",
                    p.name, tweet_index + 1,
                )
        return out

    def _upload_media(self, path: Path) -> str | None:
        """Try to upload a local media file. Returns a URL or None.

        The Typefully public API does not officially document a
        multipart upload endpoint; some accounts have `/upload/` or
        `/media/upload/`.  We probe both and skip if neither works.
        """
        candidates = ["/upload/", "/media/upload/", "/drafts/upload/"]
        for candidate in candidates:
            try:
                with path.open("rb") as fh:
                    files = {"file": (path.name, fh, _guess_mime(path))}
                    resp = self._request("POST", candidate, files=files)
                if isinstance(resp, dict):
                    for key in ("url", "media_url", "public_url"):
                        if key in resp and isinstance(resp[key], str):
                            log.info("Uploaded %s via %s -> %s", path.name, candidate, resp[key])
                            return resp[key]
                log.debug("Upload response from %s had no url field: %s", candidate, resp)
            except TypefullyError as exc:
                log.debug("Upload endpoint %s not usable: %s", candidate, exc)
                continue
        return None

    # ------------------------------------------------------------------
    # Parsing helpers
    # ------------------------------------------------------------------
    def _parse_draft(self, raw: Any) -> DraftResult:
        """Turn a create-draft response into a DraftResult.

        Typefully's response shape has drifted a couple of times.  We
        pull id / share_url / schedule_date defensively.
        """
        if not isinstance(raw, dict):
            raise TypefullyError(f"Unexpected draft response: {raw!r}")

        draft_id = raw.get("id") or raw.get("draft_id") or raw.get("uuid")
        if draft_id is None:
            # Some responses nest under "draft"
            nested = raw.get("draft") if isinstance(raw.get("draft"), dict) else None
            if nested:
                draft_id = nested.get("id") or nested.get("uuid")
                share_url = nested.get("share_url") or nested.get("url")
                scheduled = nested.get("schedule_date") or nested.get("scheduled_at")
                return DraftResult(id=draft_id, share_url=share_url,
                                    scheduled_date=scheduled, raw=raw)
            raise TypefullyError(f"Draft response missing id: {raw!r}")

        share_url = raw.get("share_url") or raw.get("url")
        scheduled = raw.get("schedule_date") or raw.get("scheduled_at")
        return DraftResult(
            id=draft_id,
            share_url=share_url,
            scheduled_date=scheduled,
            raw=raw,
        )


def _guess_mime(path: Path) -> str:
    """Return an X-friendly mime type for common media extensions."""
    ext = path.suffix.lower()
    return {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
    }.get(ext, "application/octet-stream")


# ----------------------------------------------------------------------
# Convenience helpers callable from other scripts
# ----------------------------------------------------------------------

def load_env_client() -> TypefullyClient:
    """Construct a client from `TYPEFULLY_API_KEY`, or die with a hint."""
    key = os.environ.get("TYPEFULLY_API_KEY")
    if not key:
        raise TypefullyError(
            "TYPEFULLY_API_KEY not set.\n"
            "  1. Get a key from https://typefully.com/settings/integrations\n"
            "  2. export TYPEFULLY_API_KEY=tf_...\n"
            "  3. Rerun."
        )
    return TypefullyClient(api_key=key)


if __name__ == "__main__":
    # Smoke test: print scheduled drafts if the env var is set.
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    try:
        client = load_env_client()
        drafts = client.list_scheduled()
        print(f"{len(drafts)} scheduled drafts")
        for d in drafts[:5]:
            print("-", json.dumps(d)[:200])
    except TypefullyError as exc:
        print(f"error: {exc}")
