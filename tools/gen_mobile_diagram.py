import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

W = 1020
H = 3400

bg_color = (13, 16, 23)
card_bg = (21, 26, 38)
card_border = (48, 56, 74)
card_header = (28, 34, 50)
accent_cyan = (0, 210, 255)
accent_green = (0, 230, 118)
accent_purple = (187, 134, 252)
accent_orange = (255, 112, 67)
accent_amber = (255, 183, 77)
text_main = (245, 247, 250)
text_dim = (160, 172, 190)
text_gold = (255, 215, 64)

font_path = os.path.join(REPO_ROOT, "assets/fonts/InterTight[wght].ttf")
font_rubik = os.path.join(REPO_ROOT, "assets/fonts/Rubik[wght].ttf")
kb_img_path = os.path.join(REPO_ROOT, "assets/smk_top_clean.png")

# Extra-clean legible typography
f_title = ImageFont.truetype(font_rubik, 44)
f_sub = ImageFont.truetype(font_path, 22)
f_card_title = ImageFont.truetype(font_rubik, 27)
f_btn_name = ImageFont.truetype(font_rubik, 22)
f_btn_action = ImageFont.truetype(font_rubik, 22)
f_btn_desc = ImageFont.truetype(font_path, 19)
f_note = ImageFont.truetype(font_path, 17)
f_shortcut_title = ImageFont.truetype(font_rubik, 22)
f_shortcut_body = ImageFont.truetype(font_rubik, 25)
f_badge = ImageFont.truetype(font_rubik, 18)

img = Image.new("RGBA", (W, H), bg_color)
draw = ImageDraw.Draw(img)

# 1. Background grid
grid_color = (22, 27, 38)
for x in range(0, W, 46):
    draw.line([(x, 0), (x, H)], fill=grid_color, width=1)
for y in range(0, H, 46):
    draw.line([(0, y), (W, y)], fill=grid_color, width=1)

# 2. Main Title Banner
draw.text((35, 32), "SMK-dee // HARDWARE CONTROL GUIDE", font=f_title, fill=text_main)
draw.text((35, 82), "Physical Control Map & Shortcuts for M-VAVE SMK-37 (Pro & Elite)", font=f_sub, fill=text_dim)

# 3. Keyboard Graphic
kb_crop = Image.open(kb_img_path).convert("L")
kb_inv = ImageOps.invert(kb_crop)
kb_rgba = Image.new("RGBA", kb_inv.size, (0, 0, 0, 0))
for px_x in range(kb_inv.width):
    for px_y in range(kb_inv.height):
        val = kb_inv.getpixel((px_x, px_y))
        if val > 20:
            kb_rgba.putpixel((px_x, px_y), (int(val*0.92), int(val*0.96), val, val))

target_kb_w = W - 70 # 950px
scale = float(target_kb_w) / kb_rgba.width
new_w = target_kb_w
new_h = int(kb_rgba.height * scale)
kb_scaled = kb_rgba.resize((new_w, new_h), Image.Resampling.LANCZOS)

kb_x = 35
kb_y = 135

glow = Image.new("RGBA", (new_w + 24, new_h + 24), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.rounded_rectangle([4, 4, new_w + 20, new_h + 20], radius=18, fill=(18, 22, 32, 240), outline=(50, 60, 85, 200), width=2)
img.paste(glow, (kb_x - 12, kb_y - 12), glow)
img.paste(kb_scaled, (kb_x, kb_y), kb_scaled)

def highlight_zone(rx0, ry0, rx1, ry1, color):
    zx0 = kb_x + int(rx0 * scale)
    zy0 = kb_y + int(ry0 * scale)
    zx1 = kb_x + int(rx1 * scale)
    zy1 = kb_y + int(ry1 * scale)
    overlay = Image.new("RGBA", (zx1 - zx0, zy1 - zy0), (0, 0, 0, 0))
    o_draw = ImageDraw.Draw(overlay)
    o_draw.rounded_rectangle([0, 0, zx1 - zx0 - 1, zy1 - zy0 - 1], radius=8, fill=(*color[:3], 45), outline=(*color[:3], 230), width=2)
    img.paste(overlay, (zx0, zy0), overlay)

# Zones matching physical SMK-37 layout
highlight_zone(136, 12, 416, 42, accent_cyan)     # Knobs (8x)
highlight_zone(136, 44, 416, 100, accent_green)   # Pads (16x)
highlight_zone(420, 12, 560, 68, accent_purple)   # Faders (4x)
highlight_zone(420, 70, 560, 100, accent_orange)  # Right function buttons (12x)
highlight_zone(74, 62, 126, 101, accent_amber)    # Nav & Octave buttons (6x: KNOB/FADER BANK, <, >, OCT-/+)

# 4. BIG MODE SWITCH SHORTCUT BANNER
cur_y = kb_y + new_h + 24
draw.rounded_rectangle([35, cur_y, W - 35, cur_y + 86], radius=16, fill=(52, 24, 16), outline=accent_orange, width=3)
draw.ellipse([55, cur_y + 24, 77, cur_y + 46], fill=accent_orange)
draw.text((92, cur_y + 12), "MIDI CONTROL MODE SHORTCUT", font=f_shortcut_title, fill=text_gold)
draw.text((92, cur_y + 44), "HOLD [ PATCH + PARA ] FOR 600ms", font=f_shortcut_body, fill=text_main)
draw.text((615, cur_y + 45), "◀—▶ Toggles MIDI Control Mode", font=f_btn_desc, fill=accent_cyan)

cur_y += 110

def wrap_text(text, font, max_width, prefix=""):
    words = text.split(' ')
    lines = []
    cur = []
    for wd in words:
        test = ' '.join(cur + [wd])
        pfx = prefix if len(lines) == 0 else '   '
        if font.getlength(pfx + test) <= max_width:
            cur.append(wd)
        else:
            if cur:
                lines.append(' '.join(cur))
                cur = [wd]
            else:
                lines.append(wd)
                cur = []
    if cur:
        lines.append(' '.join(cur))
    return lines

# 5. HELPER FUNCTION TO DRAW HIGH-READABILITY FULL-WIDTH CARDS
def draw_card(y, title, icon_color, items, footer_notes=None):
    x = 35
    w = W - 70 # 950px
    max_content_w = w - 40 # 910px
    base_item_h = 46
    
    # Pre-calculate heights for all items in case of description wrapping
    prepared_items = []
    items_total_h = 0
    for btn, act, desc in items:
        bw = int(draw.textlength(btn, font=f_btn_name)) + 22
        aw = int(draw.textlength(act, font=f_btn_action)) + 22
        desc_start_x = x + 36 + bw + aw
        max_desc_w = (x + w - 30) - desc_start_x
        d_lines = wrap_text(desc, f_btn_desc, max_desc_w, prefix="—  ")
        row_h = base_item_h + (len(d_lines) - 1) * 24
        prepared_items.append((btn, act, d_lines, bw, aw, desc_start_x, row_h))
        items_total_h += row_h

    note_lines = []
    if footer_notes:
        if isinstance(footer_notes, str):
            footer_notes = [footer_notes]
        for fn in footer_notes:
            note_lines.extend(wrap_text(fn, f_note, max_content_w))
        footer_h = len(note_lines) * 26 + 18
    else:
        footer_h = 16

    card_h = 64 + items_total_h + footer_h
    
    draw.rounded_rectangle([x, y, x + w, y + card_h], radius=16, fill=card_bg, outline=card_border, width=2)
    # Header
    draw.rounded_rectangle([x, y, x + w, y + 54], radius=16, fill=card_header, outline=card_border, width=2)
    draw.rectangle([x, y + 38, x + w, y + 54], fill=card_header)
    draw.ellipse([x + 22, y + 19, x + 38, y + 35], fill=icon_color)
    draw.text((x + 50, y + 14), title, font=f_card_title, fill=text_main)
    
    row_y = y + 68
    for btn, act, d_lines, bw, aw, desc_start_x, row_h in prepared_items:
        # Button pill
        draw.rounded_rectangle([x + 18, row_y, x + 18 + bw, row_y + 34], radius=8, fill=(38, 45, 62), outline=(80, 94, 125), width=1)
        draw.text((x + 29, row_y + 4), btn, font=f_btn_name, fill=text_main)
        
        # Action pill
        bg_act = (64, 28, 20) if icon_color == accent_orange else (16, 56, 74) if icon_color == accent_cyan else (52, 28, 70) if icon_color == accent_purple else (58, 44, 16)
        draw.rounded_rectangle([x + 24 + bw, row_y, x + 24 + bw + aw, row_y + 34], radius=8, fill=bg_act, outline=icon_color, width=1)
        draw.text((x + 35 + bw, row_y + 4), act, font=f_btn_action, fill=icon_color)
        
        # Description (with safe wrapping support)
        for idx, dl in enumerate(d_lines):
            line_y = row_y + 5 + idx * 24
            prefix = "—  " if idx == 0 else "   "
            draw.text((desc_start_x, line_y), f"{prefix}{dl}", font=f_btn_desc, fill=text_dim)
        row_y += row_h
        
    if note_lines:
        draw.line([(x + 18, row_y + 4), (x + w - 18, row_y + 4)], fill=card_border, width=1)
        fn_y = row_y + 12
        for nl in note_lines:
            draw.text((x + 18, fn_y), nl, font=f_note, fill=text_gold)
            fn_y += 26
        
    return y + card_h + 20

# CARD 1: NAVIGATION & OCTAVE (6 Buttons)
items_nav = [
    ("KNOB BANK", "LFO", "LFO Shape, Rate & Depth (Hold: Momentary LFO)"),
    ("FADER BANK", "ENV", "Envelope Editor & Master Filter page"),
    ("< (LEFT)", "PRESETS", "Direct shortcut to Presets Browser page"),
    ("> (RIGHT)", "SAVE", "Direct shortcut to Save / Project page"),
    ("OCTAVE -", "OCT- / BACK", "Octave Down (-3..+3) • In Dialogs: Cancel / Back"),
    ("OCTAVE +", "OCT+ / OK", "Octave Up (-3..+3) • In Dialogs: Confirm / OK (Hold: Menu)"),
]
notes_nav = [
    "★ UNDO / REDO: Hold PARA + press OCT- for Undo  •  Hold PARA + press OCT+ for Redo",
    "★ MIDI Banks: KNOB BANK toggles Knobs 1-8/9-16 • FADER BANK toggles Faders 1-4/5-8",
    "★ Pad Bank: In MIDI mode, hold KNOB BANK + FADER BANK together to toggle Pads 1-16/17-32",
]
cur_y = draw_card(cur_y, "NAVIGATION & OCTAVE BUTTONS (6X)", accent_amber, items_nav, notes_nav)

# CARD 2: ROTARY ENCODERS K1 - K8
items_knobs = [
    ("K1 – K4", "PARAM 1..4", "Active Context Parameters on OLED"),
    ("K5", "TEMPO", "Project BPM Clock (60 - 240 BPM)"),
    ("K6", "PRESET", "Browse & Change Sound Presets"),
    ("K7", "TRACK", "Select Active Synth Track (Tracks 1 – 4)"),
    ("K8", "MASTER", "Hardware Master Volume Output Level"),
]
cur_y = draw_card(cur_y, "ROTARY ENCODERS (K1 – K8)", accent_cyan, items_knobs, "★ In MIDI Mode: Transmits CC 20..35 across Bank 1 & 2 on Ch 1")

# CARD 3: 13 FUNCTION & PERFORMANCE BUTTONS (INCLUDING PATCH + PARA COMBO)
items_funcs = [
    ("ARP", "ARPEGGIATOR", "Toggle Arpeggiator & style patterns"),
    ("NOTE REPEAT", "ARP TOGGLE", "Toggle Arpeggiator on/off for active track"),
    ("SCALE", "SCALE QUANTIZER", "Scale Quantizer (Major, Minor, Dorian...)"),
    ("CHORD", "CHORD TOGGLE", "Toggle Chord mode on/off for active track"),
    ("GLOBE", "SETTINGS / MUTES", "Project Settings, Clock sync & Track mutes"),
    ("BT", "TAP TEMPO", "Tap 4 times to set BPM (LED pulses at tempo)"),
    ("PATCH", "HOME / MIX", "Home Page & Sound Mixer"),
    ("PARA", "SOUND EDIT", "Sound parameter synthesis page"),
    ("PATCH + PARA", "MIDI CONTROL", "HOLD 600ms: Toggle MIDI Control Mode"),
    ("FX", "MASTER FX", "Delay, Reverb, Chorus & Drive rack"),
    ("SEQ", "SEQUENCER", "Pattern Step-Grid editor (16/32 steps)"),
    ("SEQ PLAY", "PLAY / STOP", "Transport Playback (Active in MIDI mode too!)"),
    ("SEQ REC", "RECORD / CLEAR", "Realtime & Step recording / Pattern clear"),
]
notes_funcs = [
    "★ MIDI CONTROL: Hold [ PATCH + PARA ] for 600ms to enter Standalone MIDI Mode (OLED: K1 P10)",
    "★ UNDO / REDO: While holding PARA, press OCT- for Undo or OCT+ for Redo",
]
cur_y = draw_card(cur_y, "FUNCTION & PERFORMANCE BUTTONS (WITH MIDI COMBO)", accent_orange, items_funcs, notes_funcs)

# CARD 4: 4 FADERS
items_faders = [
    ("F1 – F4", "TRACK VOLUMES", "Direct Volume Levels for Synth Tracks 1, 2, 3 and 4"),
    ("FADERS IN MIDI", "CC 70 – CC 77", "In MIDI Mode: Bank A (F1-4) & Bank B (F5-8) send 8 CCs"),
]
cur_y = draw_card(cur_y, "4X HARDWARE FADERS (F1 – F4)", accent_purple, items_faders)

# CARD 5: MIDI CHANNELS SHORTCUTS
items_midi = [
    ("GLOBE + Key 1..16", "CH 1 – 16", "Sets MIDI Channel for Keyboard, Knobs & Faders"),
    ("GLOBE + BT + Key 1..16", "PAD CH 1 – 16", "Sets independent MIDI Channel for Drum Pads"),
]
cur_y = draw_card(cur_y, "QUICK MIDI CHANNELS SHORTCUTS", accent_green, items_midi, "★ Web Studio Live SysEx: Remap any CC & Channel in RAM with ZERO reboot!")

# Crop image cleanly
img_cropped = img.crop((0, 0, W, cur_y + 16))
output_path = os.path.join(REPO_ROOT, "docs/assets/smk37_hardware_guide.png")
img_cropped.save(output_path, "PNG")
print(f"Saved {output_path}: {img_cropped.size}")
