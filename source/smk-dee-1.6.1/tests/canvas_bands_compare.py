#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Kerem Kilic (Ellic Studio)
"""Require band replay to match this run's whole-canvas pixel oracle."""
import sys
from pathlib import Path

actual, reference = map(Path, sys.argv[1:])
images = sorted(reference.rglob("*.ppm"))
if not images:
    raise SystemExit("Canvas oracle produced no images")
bad = []
for image in images:
    name = image.relative_to(reference)
    candidate = actual / name
    if not candidate.is_file() or candidate.read_bytes() != image.read_bytes():
        bad.append(str(name))
if bad:
    raise SystemExit("Canvas band pixels differ: " + ", ".join(bad))
print(f"Canvas bands: {len(images)} images exactly match the whole-canvas oracle")
