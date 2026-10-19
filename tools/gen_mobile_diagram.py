import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

W = 920
H = 2800

bg_color = (13, 16, 23)        # #0d1017 deep dark slate
card_bg = (22, 27, 38)         # #161b26
card_header = (30, 37, 52)     # #1e2534
card_border = (52, 63, 86)     # #343f56
accent_orange = (254, 109, 34) # #fe6d22
accent_cyan = (0, 210, 255)    # #00d2ff
accent_green = (16, 185, 129)  # #10b981
accent_purple = (168, 85, 247) # #a855f7
accent_amber = (245, 158, 11)  # #f59e0b
text_main = (255, 255, 255)    # pure white
text_dim = (170, 185, 210)     # high-contrast bright slate
text_gold = (253, 224, 71)     # bright amber

font_path = "/Users/Strombo/Documents/Antigravity Projects/SMK37/Firmwares Ports/melodee-smk37/assets/fonts/InterTight[wght].ttf"
font_rubik = "/Users/Strombo/Documents/Antigravity Projects/SMK37/Firmwares Ports/melodee-smk37/assets/fonts/Rubik[wght].ttf"

# EXTRA-LARGE FONTS FOR MAXIMUM MOBILE READABILITY
f_title = ImageFont.truetype(font_rubik, 44)
f_sub = ImageFont.truetype(font_path, 22)
f_card_title = ImageFont.truetype(font_rubik, 28)
f_btn_name = ImageFont.truetype(font_rubik, 23)
f_btn_action = ImageFont.truetype(font_rubik, 23)
f_btn_desc = ImageFont.truetype(font_path, 22)
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

# 2. Top Header
draw.text((35, 30), "SMK-dee", font=f_title, fill=accent_orange)
draw.text((230, 32), "//", font=f_title, fill=(80, 90, 110))
draw.text((268, 32), "CONTROL MAP", font=f_title, fill=text_main)
draw.text((35, 84), "M-VAVE SMK-37 (Pro & Elite) • Hardware Guide", font=f_sub, fill=text_dim)

def draw_badge(x, y, text, color, bg=(30, 36, 50)):
    w = int(draw.textlength(text, font=f_badge)) + 26
    draw.rounded_rectangle([x, y, x + w, y + 36], radius=18, fill=bg, outline=color, width=2)
    draw.text((x + 13, y + 6), text, font=f_badge, fill=color)
    return x + w

bx = W - 325
bx = draw_badge(bx, 35, "SYNTH", accent_orange) + 14
draw_badge(bx, 35, "MIDI", accent_cyan)

# 3. Keyboard Graphic (Spanning 850px width)
kb_crop = Image.open("/tmp/smk_top_clean.png").convert("L")
kb_inv = ImageOps.invert(kb_crop)
kb_rgba = Image.new("RGBA", kb_inv.size, (0, 0, 0, 0))
for px_x in range(kb_inv.width):
    for px_y in range(kb_inv.height):
        val = kb_inv.getpixel((px_x, px_y))
        if val > 20:
            kb_rgba.putpixel((px_x, px_y), (int(val*0.92), int(val*0.96), val, val))

scale = 850.0 / kb_rgba.width
new_w = int(kb_rgba.width * scale)
new_h = int(kb_rgba.height * scale)
kb_scaled = kb_rgba.resize((new_w, new_h), Image.Resampling.LANCZOS)

kb_x = (W - new_w) // 2
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
    overlay = Image.new("RGBA", (zx1 - zx0, zy1 - zy0), (*color[:3], 45))
    o_draw = ImageDraw.Draw(overlay)
    o_draw.rectangle([0, 0, zx1 - zx0 - 1, zy1 - zy0 - 1], outline=(*color[:3], 220), width=2)
    img.paste(overlay, (zx0, zy0), overlay)

highlight_zone(140, 18, 400, 40, accent_cyan)     # Knobs
highlight_zone(418, 14, 552, 68, accent_purple)   # Faders
highlight_zone(74, 62, 122, 98, accent_amber)     # Nav buttons
highlight_zone(416, 72, 554, 98, accent_orange)   # Right buttons
highlight_zone(140, 42, 400, 98, accent_green)    # Pads

# 4. BIG MODE SWITCH SHORTCUT BANNER
cur_y = kb_y + new_h + 24
draw.rounded_rectangle([35, cur_y, W - 35, cur_y + 90], radius=16, fill=(52, 24, 16), outline=accent_orange, width=3)
draw.ellipse([55, cur_y + 26, 77, cur_y + 48], fill=accent_orange)
draw.text((92, cur_y + 14), "MODE SWITCH SHORTCUT", font=f_shortcut_title, fill=text_gold)
draw.text((92, cur_y + 46), "HOLD [ PATCH + PARA ] FOR 600ms", font=f_shortcut_body, fill=text_main)
draw.text((545, cur_y + 47), "<-> Synth / MIDI Mode (K1 P10)", font=f_btn_desc, fill=accent_cyan)

cur_y += 114

# 5. HELPER FUNCTION TO DRAW HIGH-READABILITY FULL-WIDTH CARDS
def draw_card(y, title, icon_color, items, footer_note=None):
    x = 35
    w = W - 70
    item_h = 48
    card_h = 66 + len(items) * item_h + (50 if footer_note else 18)
    
    draw.rounded_rectangle([x, y, x + w, y + card_h], radius=16, fill=card_bg, outline=card_border, width=2)
    # Header
    draw.rounded_rectangle([x, y, x + w, y + 58], radius=16, fill=card_header, outline=card_border, width=2)
    draw.rectangle([x, y + 40, x + w, y + 58], fill=card_header)
    draw.ellipse([x + 22, y + 21, x + 38, y + 37], fill=icon_color)
    draw.text((x + 50, y + 15), title, font=f_card_title, fill=text_main)
    
    row_y = y + 74
    for btn, act, desc in items:
        # Button pill
        bw = int(draw.textlength(btn, font=f_btn_name)) + 24
        draw.rounded_rectangle([x + 18, row_y, x + 18 + bw, row_y + 36], radius=8, fill=(38, 45, 62), outline=(80, 94, 125), width=1)
        draw.text((x + 30, row_y + 4), btn, font=f_btn_name, fill=text_main)
        
        # Action pill
        aw = int(draw.textlength(act, font=f_btn_action)) + 24
        bg_act = (64, 28, 20) if icon_color == accent_orange else (16, 56, 74) if icon_color == accent_cyan else (52, 28, 70) if icon_color == accent_purple else (58, 44, 16)
        draw.rounded_rectangle([x + 26 + bw, row_y, x + 26 + bw + aw, row_y + 36], radius=8, fill=bg_act, outline=icon_color, width=1)
        draw.text((x + 38 + bw, row_y + 4), act, font=f_btn_action, fill=icon_color)
        
        # Description
        draw.text((x + 38 + bw + aw, row_y + 4), f"—  {desc}", font=f_btn_desc, fill=text_dim)
        row_y += item_h
        
    if footer_note:
        draw.line([(x + 18, row_y + 4), (x + w - 18, row_y + 4)], fill=card_border, width=1)
        draw.text((x + 18, row_y + 13), footer_note, font=f_btn_desc, fill=text_gold)
        
    return y + card_h + 22

# CARD 1: NAVIGATION & OCTAVE (6 Buttons)
items_nav = [
    ("KNOB BANK", "LFO", "LFO Shape, Rate & Depth"),
    ("PAD BANK", "ENV", "Envelope Editor & Tap Tempo"),
    ("< (LEFT)", "PREV", "Previous Preset / Step / Browse"),
    ("> (RIGHT)", "SAVE", "Save Project / Next Step"),
    ("OCTAVE -", "OCT- / UNDO", "Octave Down / Bar - / Undo take"),
    ("OCTAVE +", "OCT+ / REDO", "Octave Up / Bar + / Redo take"),
]
cur_y = draw_card(cur_y, "NAVIGATION & OCTAVE BUTTONS (6X)", accent_amber, items_nav)

# CARD 2: ROTARY ENCODERS K1 - K8
items_knobs = [
    ("K1 – K4", "PARAM 1..4", "Active Context Parameters on OLED"),
    ("K5", "TEMPO", "Project BPM Clock (60 - 240 BPM)"),
    ("K6", "TRACK", "Select Active Synth Track (1 - 8)"),
    ("K7", "PRESET", "Browse Sound Presets & Waves"),
    ("K8", "MASTER", "Hardware Master Volume Output Level"),
]
cur_y = draw_card(cur_y, "ROTARY ENCODERS (K1 – K8)", accent_cyan, items_knobs, "★ In MIDI Mode: Transmits CC 20..35 across Bank 1 & 2 on Ch 1")

# CARD 3: 12 FUNCTION & PERFORMANCE BUTTONS
items_funcs = [
    ("ARP", "ARPEGGIATOR", "Toggle Arpeggiator & style patterns"),
    ("NOTE REPEAT", "REPEAT / ROLL", "Note Repeat roll (Toggle ARP on/off)"),
    ("SCALE", "SCALE QUANTIZER", "Scale Quantizer (Major, Minor, Dorian...)"),
    ("CHORD", "CHORD MODE", "Polyphonic Chord voicing (Toggle on/off)"),
    ("GLOBE", "SETTINGS / MUTES", "Project Settings, Clock sync & Track mutes"),
    ("BT", "TAP TEMPO", "Tap 4 times to set BPM (LED pulses at tempo)"),
    ("PATCH", "HOME / MIX", "Home Page & Sound Mixer"),
    ("PARA", "SOUND EDIT", "Sound parameter synthesis page"),
    ("FX", "MASTER FX", "Delay, Reverb, Chorus & Drive rack"),
    ("SEQ", "SEQUENCER", "Pattern Step-Grid editor (16/32 steps)"),
    ("SEQ PLAY", "PLAY / STOP", "Transport Playback (Active in MIDI mode!)"),
    ("SEQ REC", "RECORD / CLEAR", "Realtime & Step recording / Pattern clear"),
]
cur_y = draw_card(cur_y, "12X FUNCTION & PERFORMANCE BUTTONS", accent_orange, items_funcs)

# CARD 4: 4 FADERS
items_faders = [
    ("F1 – F4", "TRACK VOLUMES", "Individual Track Levels (Bank 1: 1-4 | Bank 2: 5-8)"),
    ("FADERS IN MIDI", "CC 70 – CC 77", "Faders transmit customizable CCs in MIDI Mode"),
]
cur_y = draw_card(cur_y, "4X HARDWARE FADERS (F1 – F4)", accent_purple, items_faders)

# CARD 5: MIDI CHANNELS SHORTCUTS
items_midi = [
    ("GLOBE + Key 1..16", "CH 1 – 16", "Sets MIDI Channel for Keyboard, Knobs & Faders"),
    ("GLOBE + BT + Key 1..16", "PAD CH 1 – 16", "Sets independent MIDI Channel for Drum Pads"),
]
cur_y = draw_card(cur_y, "QUICK MIDI CHANNELS SHORTCUTS", accent_green, items_midi, "★ Web Studio Live SysEx: Remap any CC & Channel in RAM with ZERO reboot!")

# Crop image cleanly
img_cropped = img.crop((0, 0, W, cur_y + 15))
img_cropped.save("/tmp/smk37_hardware_guide_mobile.png", "PNG")
print(f"Saved /tmp/smk37_hardware_guide_mobile.png: {img_cropped.size}")
