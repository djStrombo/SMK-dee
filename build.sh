#!/bin/sh
# Helper script to build SMK-dee v1.6.1 from repository root
set -e
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR/source/smk-dee-1.6.1"
exec ./build.sh --board smk37 "$@"
