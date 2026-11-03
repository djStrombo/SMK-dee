#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Kerem Kilic (Ellic Studio)
"""Inspect the linked FM-1 ELF's actual SRAM reservations, optionally compare.

No cross-toolchain or third-party Python modules required. Section totals
include alignment via the linker boundaries; symbol sizes identify individual
objects but are not added together (aliases can overlap). Cache RAM is optional
hardware-tested storage and is never added to the guaranteed SRAM arena.
"""
import argparse
import json
import struct
from pathlib import Path

RAM_SECTIONS = {".data", ".bss", ".pool", ".noinit", ".audio_scratch",
                ".cpu1_stacks", ".dsp_tables"}


def audit(path):
    data = Path(path).read_bytes()
    if data[:6] != b"\x7fELF\x01\x01":
        raise ValueError("expected the FM-1's little-endian ELF32 image")
    shoff = struct.unpack_from("<I", data, 32)[0]
    entsize, count, names_index = struct.unpack_from("<HHH", data, 46)
    headers = [struct.unpack_from("<10I", data, shoff + i * entsize) for i in range(count)]

    def blob(header):
        return data[header[4]:header[4] + header[5]]

    def string(table, offset):
        return table[offset:table.index(0, offset)].decode("utf-8")

    section_names = blob(headers[names_index])
    names = [string(section_names, h[0]) for h in headers]
    sections = {name: dict(address=h[3], size=h[5])
                for name, h in zip(names, headers) if h[2] & 2}
    symbols, objects = {}, []
    for header in headers:
        if header[1] != 2:  # SHT_SYMTAB
            continue
        strings = blob(headers[header[6]])
        for at in range(header[4], header[4] + header[5], header[9]):
            name, address, size, info, _, section = struct.unpack_from("<IIIBBH", data, at)
            name = string(strings, name)
            symbols[name] = address
            if size and info & 15 == 1 and section < len(names) and names[section] in RAM_SECTIONS:
                objects.append(dict(name=name, address=address, size=size, section=names[section]))

    def extent(start, end):
        return symbols[end] - symbols[start]

    metrics = dict(
        data_used=extent("_data_start", "_bss_end"),
        pool_fixed=extent("_pool_start", "_pool_end"),
        resident_audio_code=extent("_audio_start", "_audio_end"),
        main_arena=extent("_resource_start", "_resource_end"),
        minimum_arena=symbols["_resource_minimum"],
        low_tail=extent("_resource_low_start", "_resource_low_end"),
        data_tail=extent("_resource_data_start", "_resource_data_end"),
        retained_tail=extent("_resource_retained_start", "_resource_retained_end"),
        optional_cache=extent("_resource_cache_start", "_resource_cache_end"),
    )
    metrics["total_sram_resources"] = sum(metrics[k] for k in ("main_arena", "low_tail", "data_tail", "retained_tail"))
    return dict(elf=str(path), metrics=metrics, sections=sections,
                objects=sorted(objects, key=lambda obj: (-obj["size"], obj["name"])))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("elf", type=Path)
    parser.add_argument("--compare", type=Path, help="baseline ELF")
    parser.add_argument("--json", type=Path, help="save report, including baseline when compared")
    parser.add_argument("--top", type=int, default=25)
    args = parser.parse_args()
    current = audit(args.elf)
    baseline = audit(args.compare) if args.compare else None
    print("Linked SRAM bytes (optional cache excluded from guaranteed resources)")
    for name, value in current["metrics"].items():
        before = baseline["metrics"][name] if baseline else None
        print(f"{name:24} {before:9,d} -> {value:9,d} ({value-before:+,d})" if baseline
              else f"{name:24} {value:9,d}")
    print("\nLargest fixed objects")
    for obj in current["objects"][:args.top]:
        print(f"{obj['size']:9,d}  {obj['section']:16} {obj['name']}")
    if baseline:
        old = {obj["name"]: obj for obj in baseline["objects"]}
        new = {obj["name"]: obj for obj in current["objects"]}
        print("\nChanged object sizes/placements")
        for name in sorted(old.keys() | new.keys()):
            a, b = old.get(name), new.get(name)
            if name.startswith(".L_") or (a and b and a["size"] == b["size"] and a["section"] == b["section"]):
                continue
            before, after = a["size"] if a else 0, b["size"] if b else 0
            print(f"{name:28} {before:7,d} -> {after:7,d} ({after-before:+,d})  "
                  f"{a['section'] if a else '-'} -> {b['section'] if b else '-'}")
    if args.json:
        report = dict(current=current, baseline=baseline) if baseline else current
        args.json.write_text(json.dumps(report, indent=2) + "\n")


if __name__ == "__main__":
    main()
