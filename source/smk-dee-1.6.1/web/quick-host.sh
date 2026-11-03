#!/usr/bin/env bash
# Serve a local copy of the site. Run from any directory.
# VERSION defaults to the firmware version in tools/fm1_recover.py.
# SITE_DIR is replaced only when it is already a Melodee site, and never when it
# is the repo, your home directory, or a parent of either.
set -euo pipefail

INVOKE="$(pwd)"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PYTHON="${PYTHON:-python3}"
VERSION="${VERSION:-$("$PYTHON" "$ROOT/tools/fm1_recover.py" --version | awk '{print $NF}')}"
SITE_DIR="${SITE_DIR:-/tmp/melodee-site}"
HOST_PORT="${HOST_PORT:-8000}"

if [ -z "$SITE_DIR" ] || [ -z "$VERSION" ]; then
  echo "SITE_DIR and VERSION must be non-empty" >&2
  exit 1
fi
case "$SITE_DIR" in
  /*) ;;
  *) SITE_DIR="$INVOKE/$SITE_DIR" ;;
esac

resolve_site() {
  "$PYTHON" - "$1" "$2" <<'PY'
import os, sys
raw, root = sys.argv[1], os.path.realpath(sys.argv[2])
home = os.path.realpath(os.path.expanduser("~"))

def die(msg):
    print(msg, file=sys.stderr)
    raise SystemExit(1)

if os.path.islink(raw):
    die(f"refusing to remove {raw}: it is a symlink")
site = os.path.realpath(raw)
if (not site or site in ("/", home, root)
        or root.startswith(site + os.sep) or site.startswith(root + os.sep)):
    die(f"refusing to remove {site or raw}")
if os.path.lexists(site):
    if not os.path.isdir(site):
        die(f"refusing to remove {site}: not a directory")
    installer = os.path.join(site, "webapp", "installer")
    firmware = os.path.join(site, "firmware")
    if not (os.path.isdir(installer) and os.path.isdir(firmware)):
        die(f"refusing to remove {site}: not a Melodee site directory")
print(site)
PY
}

if ! SITE_DIR="$(resolve_site "$SITE_DIR" "$ROOT")"; then
  exit 1
fi
if [ -d "$SITE_DIR" ]; then
  rm -rf "$SITE_DIR"
fi

# Screenshots are generated, not committed. Paths are rooted at the repo.
if ! "$PYTHON" "$ROOT/tools/manual_shots.py" --require; then
  echo "manual screenshots are missing; generating them"
  if ! "$PYTHON" "$ROOT/tools/manual_shots.py" --sources; then
    UI=renders "$ROOT/tests/run_tests.sh"
  fi
  "$PYTHON" "$ROOT/tools/manual_shots.py"
fi

"$PYTHON" "$ROOT/web/make_site.py" \
  "build/release-${VERSION}/melodee-${VERSION}.fwsc" \
  "$VERSION" "$SITE_DIR"

"$PYTHON" -m http.server "$HOST_PORT" --directory "$SITE_DIR"
