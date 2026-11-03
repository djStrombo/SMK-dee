#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Relyt29 (@relyt29), Signals Intelligence Sound (https://sigintsound.com/)
"""Copy the manual's NIGHT UI renders into web/manual/.

Renders come from tests/ui_render.c -> tests/ui_render.py, under build/ui_new/NIGHT.
The figure names are the <img src> values in web/manual/index.html (web/make_site.py
manual_figures). A full site publish copies that folder to webapp/manual/.

The PNGs are generated, not committed. The stable publish writes them before
publishing the site. web/quick-host.sh writes them when the manual is missing figures.
Nightlies publish a separate guide at webapp/manual/nightly/. Nightly and
release-candidate publishes leave the stable manual in place.

  tools/manual_shots.py            # build/ui_new/NIGHT → web/manual/
  tools/manual_shots.py --require  # exit 0 when every figure is already present
  tools/manual_shots.py --sources  # exit 0 when every source render exists
  tools/manual_shots.py --check    # list missing / stale, write nothing

Only NIGHT is used (the manual's palette). Add a screenshot by embedding
<img src="name.png"> in web/manual/index.html.
"""
import argparse
import filecmp
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "web"))
from make_site import manual_figures  # noqa: E402

SRC = ROOT / "build" / "ui_new" / "NIGHT"
MANUAL = ROOT / "web" / "manual"


def figure_names(manual=None):
    """PNG names embedded in the manual, in page order"""
    return manual_figures(Path(manual) if manual is not None else MANUAL)


def sources_present():
    """exit 0 when every embedded figure's NIGHT render is already on disk"""
    names = figure_names()
    if not SRC.is_dir():
        print(f"manual_shots: {SRC.relative_to(ROOT)} is missing", file=sys.stderr)
        sys.exit(1)
    missing = [name for name in names if not (SRC / name).is_file()]
    if missing:
        print(f"manual_shots: {len(missing)} source render(s) missing from {SRC.relative_to(ROOT)}:",
              file=sys.stderr)
        for name in missing:
            print(f"  {name}", file=sys.stderr)
        sys.exit(1)
    print(f"manual_shots: {len(names)} source renders present")


def require_present():
    """exit 0 when web/manual/ already contains every embedded figure"""
    names = figure_names()
    missing = [name for name in names if not (MANUAL / name).is_file()]
    if missing:
        print(f"manual_shots: {len(missing)} screenshot(s) missing:", file=sys.stderr)
        for name in missing:
            print(f"  web/manual/{name}", file=sys.stderr)
        sys.exit(1)
    print(f"manual_shots: {len(names)} figures present")


def sync_dir(check):
    """copy embedded NIGHT renders into web/manual/; with check, report stale files and write nothing"""
    names = figure_names()
    MANUAL.mkdir(parents=True, exist_ok=True)
    missing, copied, same = [], [], 0
    for name in names:
        src = SRC / name
        if not src.is_file():
            missing.append(name)
            continue
        out = MANUAL / name
        if out.is_file() and filecmp.cmp(src, out, shallow=False):
            same += 1
            continue
        if not check:
            shutil.copy(src, out)
        copied.append(name)
    known = set(names)
    extra = sorted(p.name for p in MANUAL.glob("*.png") if p.name not in known)
    if missing:
        print(f"missing from {SRC}: {', '.join(missing)}", file=sys.stderr)
    if extra:
        print(f"not in the manual (left in place): {', '.join(extra)}", file=sys.stderr)
    verb = "stale" if check else "copied"
    print(f"manual_shots: {MANUAL.relative_to(ROOT)}: {len(names)} figures, {same} up to date, "
          f"{len(copied)} {verb}, {len(missing)} missing")
    return bool(missing or (check and copied))


def main():
    """copy NIGHT UI renders into the manual, or only check that they are present"""
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report only; write nothing")
    ap.add_argument("--require", action="store_true",
                    help="exit 0 when every figure is already in web/manual/; write nothing")
    ap.add_argument("--sources", action="store_true",
                    help="exit 0 when every embedded render exists under build/ui_new/NIGHT")
    a = ap.parse_args()
    if sum((a.require, a.check, a.sources)) > 1:
        sys.exit("pass only one of --require, --sources, or --check")
    if a.sources:
        sources_present()
        return
    if a.require:
        require_present()
        return
    if not SRC.is_dir():
        sys.exit(f"{SRC} is missing: run the UI renders first "
                 "(tests/run_tests.sh, or UI=renders tests/run_tests.sh)")
    if sync_dir(a.check):
        sys.exit(1)


if __name__ == "__main__":
    main()
