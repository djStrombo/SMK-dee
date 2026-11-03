#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Kerem Kilic (Ellic Studio)
"""Generate README SVGs from the real host UI renders, without mock screen art.

Usage: python tools/gen_readme_media.py build/ui_new
The host renderer and tests/ui_render.py must have produced NIGHT/*.png first.
"""
import argparse
import base64
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def image(path, x, y, width, height):
    data = base64.b64encode(path.read_bytes()).decode()
    return f'<image x="{x}" y="{y}" width="{width}" height="{height}" href="data:image/png;base64,{data}"/>'


def text(x, y, value, size=16, color="#ddd", anchor="start"):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" text-anchor="{anchor}">{escape(value)}</text>'


def rect(x, y, width, height, fill="#24262b", radius=12):
    return f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="{radius}" fill="{fill}"/>'


def svg(width, height, title, content):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" '
            f'role="img" aria-labelledby="title"><title id="title">{escape(title)}</title>'
            f'<g font-family="Arial, sans-serif">{rect(0,0,width,height,"#121419",16)}{"".join(content)}</g></svg>\n')


def generate(renders):
    shots = Path(renders) / "NIGHT"
    media = ROOT / "docs/media"
    hero = [text(28, 48, "MELODEE", 30, "#fff"), text(28, 80, "Synthesizer · sequencer · effects", 17, "#a8b2c0")]
    for i, (name, label) in enumerate((("ref_stage_held", "HOME / selected track"), ("ref_song", "SONG / arrangement"),
                                     ("ref_motion", "MOTION / automation"), ("fx_chorus", "FX / chorus"))):
        x = 28 + 258 * i
        hero += [image(shots / f"{name}.png", x, 106, 240, 240), text(x, 378, label, 15)]
    hero.append(text(28, 412, "Screens rendered from the current firmware drawing code", 13, "#a8b2c0"))
    (media / "melodee-screens.svg").write_text(svg(1070, 440, "Current Melodee firmware screens", hero))

    panel = [text(36, 48, "FM-1 controls in Melodee", 27, "#fff"),
             text(36, 78, "Printed panel labels above; Melodee actions below. Layout is schematic.", 15, "#a8b2c0"),
             rect(36, 106, 1048, 410, "#30333a", 24), image(shots / "ref_stage_held.png", 318, 156, 240, 240)]
    for x, y, label, action in ((122,166,"MASTER","Volume"), (232,166,"SELECT","Pages / HOME assignment"),
                              (122,326,"PRESETS","Sounds"), (232,326,"ALGORITHM","Track")):
        panel += [f'<circle cx="{x}" cy="{y}" r="24" fill="#111318" stroke="#8c97a6" stroke-width="2"/>',
                  f'<path d="M{x},{y-20} v12" stroke="#f5ad67" stroke-width="3"/>',
                  text(x, y+45, label, 12, "#fff", "middle")]
        if label == "SELECT":
            panel += [text(x,y+65,"Pages / HOME",12,"#bdc6d3","middle"),text(x,y+81,"assignment",12,"#bdc6d3","middle")]
        else:
            panel.append(text(x,y+65,action,12,"#bdc6d3","middle"))
    for i in range(4):
        x = 652 + 112 * i
        panel += [f'<circle cx="{x}" cy="164" r="24" fill="#111318" stroke="#8c97a6" stroke-width="2"/>',
                  text(x,207,f"KNOB {i+1}",12,"#fff","middle")]
    panel.append(text(820,229,"The page’s four controls",13,"#bdc6d3","middle"))
    for row, buttons in enumerate(((("FX","Inserts"),("SCL","Scale / chord"),("ENV","Envelope"),("LFO","LFO / mod"),("EDIT","Engine"),("GLO","Mix / global")),
                                   (("HOME","Home / chord"),("SAVE","Save / load"),("ARP","Arpeggiator"),("SEQ","Sequencer"),("PLAY","Play / stop"),("REC","Record")))):
        for col, (label, action) in enumerate(buttons):
            x, y = 600 + col * 78, 252 + row * 82
            panel += [rect(x,y,66,32,"#16191f",7),text(x+33,y+21,label,12,"#fff","middle"),
                      text(x+33,y+52,action,10,"#bdc6d3","middle")]
    for i, label in enumerate(("OCT− / back", "OCT+ / actions")):
        x = 66 + i * 112
        panel += [rect(x,406,104,27,"#16191f",6),text(x+52,425,label,12,"#fff","middle")]
    for i in range(16):
        x = 67 + 61*i
        panel.append(rect(x,451,59,43,"#e6e8eb",3))
        if i % 7 in (0,1,2,4,5) and i < 15:
            panel.append(rect(x+42,451,32,27,"#14161b",3))
    panel.append(text(56,546,"Hold shortcuts",18,"#fff"))
    for i, lines in enumerate((("HOME → settings", "SAVE → undo; OCT+ → redo"), ("GLO / SCL / EDIT → quick layers", "SEQ → PATTERNS; SELECT → SONG"),
                               ("OCT+ → page actions", "HOME again → chord view"))):
        x = 56 + i*348
        panel += [rect(x,563,330,74),text(x+14,588,lines[0],14),text(x+14,614,lines[1],14,"#bdc6d3")]
    (media / "melodee-controls.svg").write_text(svg(1120,660,"Current Melodee hardware controls and shortcuts",panel))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("renders")
    generate(parser.parse_args().renders)
