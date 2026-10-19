# SMK-dee

[![License: GPL-3.0-only](https://img.shields.io/badge/license-GPL--3.0--only-blue.svg)](LICENSE)
[![Release](https://img.shields.io/badge/release-v1.4.2--smk--dee--final-orange.svg)](https://github.com/djStrombo/SMK-dee/releases)
[![Hardware](https://img.shields.io/badge/hardware-M--VAVE%20SMK--37%20(Pro%20%26%20Elite)-cyan.svg)](https://github.com/djStrombo/SMK-dee)

**SMK-dee** is a full dual-core polyphonic synthesizer and dynamic MIDI controller firmware ported to the **M-VAVE SMK-37 (Pro & Elite)**. 

Based on the [Melodee](https://github.com/keremimo/melodee) multi-engine synthesizer for the M-VAVE FM-1 created by **keremimo** ([@keremimo](https://github.com/keremimo)).

---

## Hardware Control Map

![SMK-dee Hardware Control Map](docs/assets/smk37_hardware_guide.png)

---

## Overview & Key Additions (SMK-dee vs FM-1 Melodee)

While the original Melodee was designed for the compact FM-1 desktop unit, **SMK-dee** adapts and expands the entire engine to take full advantage of the **M-VAVE SMK-37 Pro & Elite** keyboard hardware:

| Feature | FM-1 (Melodee Original) | SMK-37 (SMK-dee Port) |
| :--- | :--- | :--- |
| **Form Factor** | Mini groovebox / desktop | 37-Key Keyboard Synthesizer & Controller |
| **Keyboard** | 16 mini keys / buttons | **37 full-travel velocity-sensitive keys** |
| **Pads** | Shared key matrix | **16 velocity RGB pads** (Dual bank: 32 pads) |
| **Rotary Encoders** | 4 context knobs | **8 physical continuous rotary encoders** (Dual bank: 16 knobs) |
| **Faders** | None | **4 physical sliders / faders** (Dual bank: 8 levels) via `SMK_FADMUX` ADC |
| **Physical Buttons** | FM-1 button matrix | **18 dedicated SMK-37 buttons** mapped to engine workflows |
| **Operation Modes** | Synthesizer Only | **Dual Mode:** Synthesizer Engine $\leftrightarrow$ Standalone MIDI Controller |
| **Mode Switching** | N/A | **Hold `PATCH` (850ms)** or `PATCH + PARA`, or SysEx `0x03` |
| **MIDI Re-mapping** | Static firmware tables | **Dynamic On-The-Fly RAM Re-mapping** via USB-MIDI SysEx (Zero reflash) |
| **Web Studio** | FM-1 Web Editor | **SMK-dee Studio & Lab:** In-browser Flasher, Button Mapper & MIDI CC Remapper |
| **Theme / OLED** | Stock FM-1 palette | Custom OLED boot title (**SMK-dee**) & darkened Track 1 orange in BLACK theme |

---

## Dual-Mode Architecture

SMK-dee transforms the SMK-37 into a hybrid performance instrument with two distinct modes:

### 1. Synthesizer Engine Mode
- **Dual-Core Processing:** Full 128-voice polyphonic multi-engine synthesizer powered by the JieLi AC695x/AC696x dual-core SoC.
- **Sound Engines:**
  - **FM6:** 6-operator DX7-style frequency modulation synthesis with native feedback.
  - **Prophet 53:** Analog-style dual-oscillator subtractive poly-synth.
  - **CZ-1:** Casio phase-distortion synthesis with resonant waveforms.
  - **SID 6581:** Commodore 64 soundchip emulation with arpeggio tables and digi-drums.
  - **Drum 909:** Dedicated analog drum models (Kick, Snare, Toms, Hats, Claps).
  - **Physical Modeling:** String, bell, and Karplus-Strong acoustic resonators.
- **8-Track Sequencer:** 8 independent multi-timbral synth tracks with pattern chaining, live punch-in FX, parameter automation, and musical scale quantizer.
- **Master Effects:** Stereo Chorus, Delay with tone dampening, Hall Reverb, and Analog Distortion.

### 2. Standalone MIDI Controller Mode
- Holding the physical **`PATCH`** button for **850ms** (or pressing `PATCH + PARA` for 600ms, or toggling via the Web Studio) seamlessly toggles between Synth Mode and MIDI Controller Mode.
- When active, the OLED screen displays:
  ```text
  K1 P10
  ```
  *(Indicating Keyboard on Channel 1, Drum Pads on Channel 10).*
- **Knobs (K1 – K16):** Send customizable continuous CC messages (default CC 20–35).
- **Faders (F1 – F8):** Send customizable CC messages across Bank 1 & 2 (default CC 70–77).
- **RGB Pads (01 – 32):** Send velocity-sensitive Note or CC messages (default CC 36–67).

---

## On-The-Fly Dynamic MIDI Controller Remapping (RAM SysEx)

Unlike standard firmware where changing MIDI channels or CC numbers requires re-compiling or re-flashing the firmware binary, **SMK-dee** features a dynamic RAM table and an extended SysEx protocol:

```text
SysEx Header: F0 7D 53 4D 4B <CMD> ... F7
  - CMD 0x01: Query Active Mapping (returns 104 bytes with all buttons, encoders, faders, 4 channels, and 56 CCs)
  - CMD 0x02: Inject Live Mapping (updates channels & CCs in RAM instantly without reboot)
  - CMD 0x03: Remote Mode Toggle (0 = Synth Mode, 1 = MIDI Controller Mode, 2 = Toggle)
```

With **SMK-dee Studio**, you can adjust any CC or channel, click **`Apply On-the-Fly (RAM)`**, and the keyboard updates instantly without interrupting your session.

---

## Default Hardware Controls Reference

### Navigation & Octave Cluster (Left Buttons under OLED)
| Button Label | SMK-dee Function | Description |
| :--- | :--- | :--- |
| **KNOB BANK** | `LFO` | Opens LFO editor page (Shape, Rate, Depth, Target) |
| **PAD BANK** | `ENV` | Envelope generator page & Tap Tempo |
| **`<` (LEFT)** | `PREV / <` | Previous sound, preset, pattern step, or undo navigation |
| **`>` (RIGHT)** | `NEXT / >` | Next sound, preset, pattern step, or redo navigation |
| **`OCTAVE -`** | `OCT- / UNDO` | Shift keyboard octave down / Pattern bar down / Undo |
| **`OCTAVE +`** | `OCT+ / REDO` | Shift keyboard octave up / Pattern bar up / Redo |

### Function & Performance Cluster (Right Buttons under Faders)
| Button Label | SMK-dee Function | Description |
| :--- | :--- | :--- |
| **ARP** | `ARP` | Toggle multi-pitch arpeggiator & style patterns |
| **NOTE REPEAT** | `REPEAT` | Note repeat & ratcheting roll (1/4 to 1/32T) |
| **SCALE** | `SCALE` | Musical scale quantizer (Major, Minor, Dorian, Pentatonic...) |
| **CHORD** | `CHORD` | Polyphonic chord voicing generator |
| **GLOBE** | `GLOBAL` | Global settings, project tempo, MIDI clock, and track mutes |
| **BT** | `RESERVED` | Wireless Bluetooth MIDI pairing & status |
| **PATCH** | `HOME / MIX` | **Home Page & Sound Mixer.** ★ **Hold 850ms: Toggle MIDI Mode** |
| **PARA** | `EDIT` | Sound parameter synthesis page (Osc, Filter, Env, Mod) |
| **FX** | `MASTER FX` | Master effects rack (Delay, Reverb, Chorus, Drive) |
| **SEQ** | `SEQUENCER` | Pattern step-grid editor (16 / 32 steps) |
| **SEQ PLAY** | `PLAY / STOP` | Play or stop pattern sequencer playback |
| **SEQ REC** | `REC / CLEAR` | Realtime / step recording & pattern clear |

### Rotary Encoders (K1 – K8)
- **K1 – K4:** Context screen parameter knobs 1 to 4 (controls parameters displayed on OLED).
- **K5:** Master project tempo (60 – 240 BPM).
- **K6:** Active synth track / pad selector (Tracks 1 – 8).
- **K7:** Sound preset and waveform browser.
- **K8:** Hardware master volume output level.

### Hardware Faders (F1 – F4)
- **F1 – F4:** Individual track sound volume levels:
  - **Bank 1:** Synth Tracks 1 – 4 Levels
  - **Bank 2:** Synth Tracks 5 – 8 Levels

---

## Installation & Flashing

### Requirements
- M-VAVE SMK-37 (Pro or Elite).
- USB-C cable connected to a computer.
- A modern Chromium-based browser (Chrome, Edge, Opera, Brave) supporting WebUSB and WebMIDI.

### Method 1: Web Flasher (Recommended)
1. Open **SMK-dee Studio** at:
   ```text
   http://localhost:8080/SMK-dee/
   ```
2. In section **01 // FIRMWARE SELECTION**, choose your hardware model (`SMK-37 Elite` or `SMK-37 Pro`).
3. Connect your keyboard via USB and click **Connect Keyboard**.
4. In section **03 // FIRMWARE FLASHER**, click **Flash Keyboard Now**.
5. The keyboard will enter OTA update mode and reboot automatically with SMK-dee running!

### Method 2: Command Line OTA Flasher
If you prefer flashing via terminal:
```bash
python3 tools/fm1_install.py firmware/smk-dee-elite.fwsc
```

---

## Returning to Factory Firmware

Returning to stock M-VAVE firmware is 100% non-destructive and supported directly:
1. In **SMK-dee Studio**, select **Factory Restore (V016)** in Section 01.
2. Click **Flash Keyboard Now**.
3. Or flash `firmware/SMK-37_Elite_016.fwsc` / `firmware/SMK-37_Pro_016.fwsc` via terminal.

---

## Building from Source

To compile the firmware locally from source:

### Prerequisites
- JL GCC toolchain (`pi32v2-none-elf` or AC695x/AC696x cross-compiler) or Docker.
- Python 3.10+

### Build Command
```bash
./build.sh
```

Or trigger the automated GitHub Actions workflow (`.github/workflows/build.yml`), which builds both `smk-dee-elite.fwsc` and `smk-dee-pro.fwsc` artifacts with verified JLFS checksums automatically.

---

## Credits & License

- **Melodee Sound Engine & Architecture:** Created by **keremimo** ([@keremimo](https://github.com/keremimo)) for the M-VAVE FM-1.
- **Original Felucca Base:** Created by Leo Kuroshita ([@kurogedelic](https://github.com/kurogedelic)), [Hügelton Instruments](https://hugelton.com).
- **SMK-dee Port, SMK-37 Hardware Adaptation, Dynamic SysEx RAM Remapper & Web Studio:** Ported and developed by **djStrombo** ([@djStrombo](https://github.com/djStrombo)).

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0-only)**. See [LICENSE](LICENSE) for details.
