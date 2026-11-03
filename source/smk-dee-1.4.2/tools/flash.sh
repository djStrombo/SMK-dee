#!/bin/sh
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Kerem Kilic (Ellic Studio)
# Build Melodee and flash it to the connected FM-1 in one step (the dev identity FM-1_900; others are asked first).
#   tools/flash.sh                    build, then flash build/melodee.fwsc
#   tools/flash.sh --no-build         flash build/melodee.fwsc as it is
#   tools/flash.sh PACKAGE.fwsc       flash that package (no build)
#   tools/flash.sh --info             the connected FM-1's identity
#   --port NAME                       MIDI port (part of its name), passed to tools/fm1_install.py
#   MELODEE_VENV                      Python with Pillow, mido, python-rtmidi, fontTools (default: ~/.cache/melodee-venv,
#                                     made with uv when missing)
set -e
cd "$(dirname "$0")/.."
VENV="${MELODEE_VENV:-$HOME/.cache/melodee-venv}"
PY="$VENV/bin/python"
PKG=build/melodee.fwsc
BUILD=1 INFO=0 PORT=

while [ $# -gt 0 ]; do
    case "$1" in
        -n|--no-build) BUILD=0 ;;
        --info) INFO=1 BUILD=0 ;;
        --port) [ $# -ge 2 ] || { echo "flash.sh: --port needs a name"; exit 2; }; PORT="$2"; shift ;;
        -h|--help) sed -n '4,11s/^# \{0,1\}//p' "$0"; exit 0 ;;
        -*) echo "flash.sh: unknown option $1 (--help)"; exit 2 ;;
        *) PKG="$1" BUILD=0 ;;
    esac
    shift
done

# the Python (the build's fonts and the install's MIDI): made once, kept outside /tmp
if ! "$PY" -c 'import PIL, mido, rtmidi, fontTools' 2>/dev/null; then
    echo "== Python environment: $VENV"
    if command -v uv >/dev/null 2>&1; then
        [ -x "$PY" ] || uv venv -q --python 3.13 "$VENV"
        uv pip install -q --python "$PY" Pillow mido python-rtmidi fonttools
    else
        [ -x "$PY" ] || python3 -m venv "$VENV"
        "$PY" -m pip install -q Pillow mido python-rtmidi fonttools
    fi
fi

if [ $INFO = 1 ]; then
    exec "$PY" tools/fm1_install.py --info ${PORT:+--port "$PORT"}
fi

if [ $BUILD = 1 ]; then
    echo "== build"
    PYTHON="$PY" ./build.sh
fi
[ -f "$PKG" ] || { echo "flash.sh: no package $PKG (build first)"; exit 2; }

# what goes on the device: the package's identity, the commit it was built from
IDENT=$("$PY" -c 'import sys; sys.path.insert(0, "tools"); import fm1_install as f
print(f.product_of(open(sys.argv[1], "rb").read()))' "$PKG")
REV="$(git rev-parse --abbrev-ref HEAD) $(git rev-parse --short HEAD)"
git diff --quiet HEAD -- firmware || REV="$REV + uncommitted firmware changes"
if [ $BUILD = 0 ] && [ "$PKG" = build/melodee.fwsc ] && [ -n "$(find firmware -type f -newer "$PKG" | head -1)" ]; then
    echo "flash.sh: note: firmware/ changed since $PKG was built (flash without --no-build to rebuild)"
fi
echo "== flash $PKG: identity $IDENT, $REV"
if [ "$IDENT" != FM-1_900 ]; then
    [ -t 0 ] || { echo "flash.sh: identity $IDENT is not the dev identity FM-1_900; refusing without a terminal"; exit 2; }
    printf 'Identity %s is not the dev identity FM-1_900. Flash anyway? [y/N] ' "$IDENT"
    read -r a
    case "$a" in y|Y|yes) ;; *) echo "flash.sh: cancelled"; exit 1 ;; esac
fi
exec "$PY" tools/fm1_install.py "$PKG" --yes ${PORT:+--port "$PORT"}
