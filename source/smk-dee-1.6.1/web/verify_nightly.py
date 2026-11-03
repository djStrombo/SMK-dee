#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Kerem Kilic (Ellic Studio)
"""Verify deployed nightly provenance and package hashes against the local build."""
import hashlib
import json
import sys
import time
import urllib.request
from pathlib import Path


def verify(site, build):
    build = Path(build)
    commit = (build / "nightly-commit.txt").read_text().strip()
    last_error = None
    for attempt in range(12):
        try:
            base = site.rstrip("/") + "/firmware/"
            def fetch(name):
                with urllib.request.urlopen(base + name + "?commit=" + commit, timeout=30) as response:
                    return response.read()
            metadata = json.loads(fetch("nightly.json"))
            if metadata["commit"] != commit:
                raise ValueError("deployed nightly source commit differs")
            if set(metadata["pkg"]) != {"dual"}:
                raise ValueError("deployed nightly must offer dual-core firmware only")
            name = "melodee-nightly.fwsc"
            if hashlib.sha256(fetch(name)).digest() != hashlib.sha256((build / name).read_bytes()).digest():
                raise ValueError(name + ": deployed checksum differs")
            print("Live nightly source and package checksum verified: " + commit)
            return
        except (OSError, ValueError, KeyError) as error:
            last_error = error
            if attempt < 11:
                time.sleep(10)
    raise SystemExit("Live nightly verification failed: " + str(last_error))


if __name__ == "__main__":
    verify(*sys.argv[1:])
