#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Kerem Kilic (Ellic Studio)
"""Publish nightly firmware and an optional nightly manual; preserve the stable editor and manual."""
import argparse
from pathlib import Path
from make_site import main, release_packages, require_manual, publish_manual


def publish(out, dual, version, commit, built_at, manual=None):
    if manual is not None:
        manual = Path(manual)
        require_manual(manual)
    release, packages = release_packages(out)
    main(packages["dual"], release, out,
         nightly={"pkg": {"dual": dual}, "version": version,
                  "commit": commit, "builtAt": built_at}, installer_only=True)
    if manual is not None:
        root = Path(out) / "webapp/manual"
        publish_manual(manual, root / "nightly", version)
        if not (root / "index.html").exists():
            (root / "index.html").write_text(
                '<!doctype html><html lang="en"><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width, initial-scale=1">'
                '<title>Melodee manuals</title><h1>Melodee manuals</h1>'
                '<p>The stable guide will be published with a stable release.</p>'
                '<p><a href="nightly/">Read the nightly firmware manual</a></p>'
                '<p><a href="../installer/">Installer</a> · <a href="../editor/">Patch Editor</a></p>'
                '</html>\n', encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("out")
    parser.add_argument("--dual", required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--commit", required=True)
    parser.add_argument("--built-at", required=True)
    parser.add_argument("--manual", type=Path, help="publish this guide under webapp/manual/nightly/")
    args = parser.parse_args()
    publish(args.out, args.dual, args.version, args.commit, args.built_at, args.manual)
