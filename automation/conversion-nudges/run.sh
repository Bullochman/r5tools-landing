#!/usr/bin/env bash
# Cron wrapper for trigger_engine.py — sources .env for SMTP + secrets.
set -euo pipefail
cd "$(dirname "$0")"
set -a
[ -f .env ] && . .env
set +a
exec python3 trigger_engine.py "$@"
