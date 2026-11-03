# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Kerem Kilic (Ellic Studio)
"""Pinned, unmodified FM-1 m-bootloader v1.2 release assets (MIT)."""
import hashlib
from pathlib import Path

VERSION = "1.2"
SOURCE = "https://github.com/jvitkauskas/m-bootloader/releases/tag/v1.2"
COMMIT = "22e2559906f9fc4e077f2d6aee20bf332300439e"
DIRECTORY = Path(__file__).resolve().parent / "m-bootloader"
HASHES = {
    "fm1-uboot.fwsc": "0e89141f52d1f2d62198d4f69147a2c15c8360806e64d48002990a6fdab6d6dd",
    "fm1-uboot.boot": "9e5ec0e39dc55c167f8e289cfdac612d7d340b5f46100e1be2540ef4d6ec2f13",
    "LICENSE": "6657fd9d14b94d7dbecc5a08d17453890a38d57f20916c3812d062073c3b28b5",
}


def checked_files(directory=DIRECTORY):
    files = {name: (directory / name).read_bytes() for name in HASHES}
    for name, data in files.items():
        if hashlib.sha256(data).hexdigest() != HASHES[name]:
            raise ValueError(f"m-bootloader v{VERSION}: {name} checksum mismatch")
    return files


def metadata():
    checked_files()
    return {"version": VERSION, "pkg": "../../firmware/m-bootloader-1.2.fwsc",
            "sha256": HASHES["fm1-uboot.fwsc"], "license": "MIT", "source": SOURCE, "commit": COMMIT}
