/**
 * ab-hero-switcher.js
 *
 * A/B/C hero switcher for r5tools.io landing page.
 *
 * How it works:
 *   1. If URL has ?variant=a|b|c, assign that variant (share links honored).
 *   2. Else if the `lws_variant` cookie exists, keep the returning-visitor
 *      variant so return visits are consistent (session continuity beats
 *      random re-roll on every page-load).
 *   3. Else randomly assign a|b|c with equal weight (33/33/33) and set the
 *      cookie for 60 days.
 *
 *   Then fetch the corresponding /marketing/hero-variant-{X}.html, extract
 *   the <div class="hero" ...> block, and replace the live .hero on the
 *   page with it. Re-runs the i18n dictionary if the site's translator
 *   is present (window.__lwsApplyI18n if defined, otherwise falls back
 *   to a light data-i18n scan).
 *
 *   Fires LWSTrack.event('ab_hero_assigned', 'landing', {variant, source})
 *   using the site's existing lws-track.js analytics client. Also fires
 *   'ab_hero_cta_click' when either primary or secondary CTA is clicked.
 *
 * How to install on index.html:
 *   Add ONE line before </body>:
 *     <script src="/marketing/ab-hero-switcher.js" defer></script>
 *   That's it. The script self-boots after DOMContentLoaded.
 *
 * How to disable (e.g. for the control group):
 *   Add ?variant=control to any URL. Live hero stays untouched. Analytics
 *   still fires with variant='control' so the control cohort is measurable
 *   against the test cohorts.
 *
 * Variant identifiers:
 *   'a' = problem-first    (hero-variant-a.html)
 *   'b' = specific-number  (hero-variant-b.html)
 *   'c' = social-proof     (hero-variant-c.html)
 *   'control' = do nothing (leave the live hero in index.html untouched)
 */
(function () {
  'use strict';

  var COOKIE_NAME = 'lws_variant';
  var COOKIE_DAYS = 60;
  var VARIANTS = ['a', 'b', 'c'];
  var CONTROL = 'control';

  // ----- Cookie helpers ---------------------------------------------------
  function getCookie(name) {
    try {
      var parts = document.cookie.split(';');
      for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].trim().split('=');
        if (kv[0] === name) return decodeURIComponent(kv[1] || '');
      }
    } catch (e) { /* swallow */ }
    return '';
  }

  function setCookie(name, value, days) {
    try {
      var d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      var attrs = [
        name + '=' + encodeURIComponent(value),
        'expires=' + d.toUTCString(),
        'path=/',
        'SameSite=Lax',
      ];
      // Only set Secure if we're on https — allows local dev on http://localhost.
      if (location.protocol === 'https:') attrs.push('Secure');
      document.cookie = attrs.join('; ');
    } catch (e) { /* swallow */ }
  }

  // ----- URL param helper -------------------------------------------------
  function getUrlVariant() {
    try {
      var p = new URLSearchParams(location.search);
      var v = (p.get('variant') || '').toLowerCase().trim();
      if (v === CONTROL) return CONTROL;
      if (VARIANTS.indexOf(v) !== -1) return v;
    } catch (e) { /* swallow */ }
    return '';
  }

  // ----- Assignment logic -------------------------------------------------
  function assignVariant() {
    // 1. Explicit URL param wins.
    var urlV = getUrlVariant();
    if (urlV) {
      // Persist the URL-forced variant so the visitor sees the same one on
      // page navigations within the site — but only if it's a test variant.
      // 'control' is not persisted; it's a one-shot debug/comparison mode.
      if (urlV !== CONTROL) setCookie(COOKIE_NAME, urlV, COOKIE_DAYS);
      return { variant: urlV, source: 'url' };
    }
    // 2. Returning-visitor cookie.
    var cookieV = getCookie(COOKIE_NAME);
    if (VARIANTS.indexOf(cookieV) !== -1) {
      return { variant: cookieV, source: 'cookie' };
    }
    // 3. Random assignment.
    var rand = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    setCookie(COOKIE_NAME, rand, COOKIE_DAYS);
    return { variant: rand, source: 'random' };
  }

  // ----- Analytics helper -------------------------------------------------
  function track(eventName, meta) {
    try {
      if (window.LWSTrack && typeof window.LWSTrack.event === 'function') {
        window.LWSTrack.event(eventName, 'landing', meta || {});
        return;
      }
      // Fallback: also try dataLayer if GA/GTM is present, so we're covered.
      if (window.dataLayer && typeof window.dataLayer.push === 'function') {
        window.dataLayer.push(Object.assign({ event: eventName }, meta || {}));
      }
    } catch (e) { /* swallow */ }
  }

  // ----- i18n re-apply hook ----------------------------------------------
  // Site's own i18n runs on load and walks the DOM. When we swap the hero,
  // the new data-i18n keys need to be translated too. Try the site's own
  // apply function first, then a minimal fallback.
  function reapplyI18n() {
    try {
      if (typeof window.__lwsApplyI18n === 'function') {
        window.__lwsApplyI18n();
        return;
      }
      // Fallback: if a global `applyLang` / `translate` function exists, call it.
      if (typeof window.applyLang === 'function') { window.applyLang(); return; }
      if (typeof window.translate === 'function') { window.translate(); return; }
      // As a last resort, dispatch an event the site can hook into.
      document.dispatchEvent(new CustomEvent('lws:i18n-refresh'));
    } catch (e) { /* swallow */ }
  }

  // ----- CTA click tracking (added to swapped hero) ----------------------
  function wireCtaTracking(container, variant) {
    if (!container) return;
    var ctas = container.querySelectorAll('[data-track-cta]');
    for (var i = 0; i < ctas.length; i++) {
      (function (el) {
        el.addEventListener('click', function () {
          track('ab_hero_cta_click', {
            variant: variant,
            cta: el.getAttribute('data-track-cta') || '',
            href: el.getAttribute('href') || '',
          });
        }, { passive: true });
      })(ctas[i]);
    }
  }

  // ----- Swap the hero DOM node ------------------------------------------
  function swapHero(variant) {
    var url = '/marketing/hero-variant-' + variant + '.html';
    return fetch(url, { cache: 'default' })
      .then(function (r) {
        if (!r.ok) throw new Error('hero fetch failed ' + r.status);
        return r.text();
      })
      .then(function (html) {
        // Parse the fetched HTML and pull out the .hero div.
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var newHero = doc.querySelector('.hero[data-hero-variant]');
        if (!newHero) throw new Error('no .hero[data-hero-variant] in variant html');

        var liveHero = document.querySelector('.hero');
        if (!liveHero) throw new Error('no .hero on live page to swap');

        liveHero.parentNode.replaceChild(newHero, liveHero);
        reapplyI18n();
        wireCtaTracking(newHero, variant);
        return newHero;
      });
  }

  // ----- Boot -------------------------------------------------------------
  function boot() {
    var assignment = assignVariant();

    // Always fire the assignment event, even for control, so we can measure
    // control-vs-test cleanly downstream.
    track('ab_hero_assigned', {
      variant: assignment.variant,
      source: assignment.source,
      lang: (document.documentElement.lang || 'en').toLowerCase(),
    });

    // Expose for debugging in devtools: window.__lwsVariant
    try { window.__lwsVariant = assignment; } catch (e) { /* swallow */ }

    if (assignment.variant === CONTROL) {
      // Leave the live hero untouched. Still wire CTA tracking on the
      // existing hero so control-cohort click-through-rate is comparable.
      var liveHero = document.querySelector('.hero');
      wireCtaTracking(liveHero, 'control');
      return;
    }

    swapHero(assignment.variant).catch(function (err) {
      // On failure, leave the live hero. Log so we notice.
      try { console.warn('[ab-hero-switcher] swap failed:', err); } catch (e) {}
      track('ab_hero_swap_failed', {
        variant: assignment.variant,
        error: String(err && err.message || err),
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
