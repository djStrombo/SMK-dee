/* SPDX-License-Identifier: GPL-3.0-only */
/* Generated automatically by SMK-37 Control Remapper */
/* Target: SMK-37 ELITE | Engine: MELODEE */
#pragma once
#include <stdint.h>

/* SMK-37 Physical Button Indices (hardware scan matrix):
 * 0: KNOB BANK
 * 1: FADER BANK
 * 2: < (LEFT)
 * 3: > (RIGHT)
 * 4: OCTAVE-
 * 5: OCTAVE+
 * 6: ARP
 * 7: NOTE REPEAT
 * 8: SCALE
 * 9: CHORD
 * 10: GLOBE
 * 11: BT
 * 12: PATCH
 * 13: PARA
 * 14: FX
 * 15: SEQ
 * 16: SEQ PLAY
 * 17: SEQ REC
 */

/* ZP-12 & Felucca / Melodee Logical Actions */
#define ACT_NONE       0xFF
#define ACT_OCTDN      0   /* B_OCTDN: Cursor < / Bar- / Bank A+B / Undo */
#define ACT_OCTUP      1   /* B_OCTUP: Cursor > / Bar+ / Bank C+D / Redo */
#define ACT_FX         2   /* B_FX: FX / Punch-in */
#define ACT_SCALE      3   /* B_SCL: Scale / Quantize page (FM-1 label SCL) */
#define ACT_ENV        4   /* B_ENV: Envelope / Tap Tempo */
#define ACT_LFO        5   /* B_LFO: LFO Parameters */
#define ACT_EDIT       6   /* B_EDIT: Edit Sound / PARA */
#define ACT_GLO        7   /* B_GLO: Global / Mutes / GLOBE */
#define ACT_HOME       8   /* B_HOME: Home / Mix / PATCH */
#define ACT_SAVE       9   /* B_SAVE: Save (Fader Bank) */
#define ACT_ARP        10  /* B_ARP: Multi-pitch Chromatic / ARP */
#define ACT_SEQ        11  /* B_SEQ: Sequencer / Step Grid */
#define ACT_PLAY       12  /* B_PLAY: Play / Pause */
#define ACT_REC        13  /* B_REC: Record / Clear */
#define ACT_PREV       14  /* Nav Previous Page / Step Bar */
#define ACT_NEXT       15  /* Nav Next Page / Step Bar */
#define ACT_FBANK      16  /* Fader Bank Toggle */
#define ACT_SEL        17  /* Knob Bank / Select */
#define ACT_REPEAT     18  /* Note Repeat / Roll */
#define ACT_CHORD      19  /* Chord Mode Cycle */
#define ACT_KBD_OCTDN  20  /* Keyboard Octave Down (-3..+3) */
#define ACT_KBD_OCTUP  21  /* Keyboard Octave Up (-3..+3) */

/* Physical Encoders K1..K8 */
#define ENC_ACT_NONE     0xFF
#define ENC_ACT_KNOB1    0   /* Screen Knob 1 */
#define ENC_ACT_KNOB2    1   /* Screen Knob 2 */
#define ENC_ACT_KNOB3    2   /* Screen Knob 3 */
#define ENC_ACT_KNOB4    3   /* Screen Knob 4 */
#define ENC_ACT_TEMPO    4   /* Tempo / BPM */
#define ENC_ACT_PADSEL   5   /* Pad / Track Select */
#define ENC_ACT_SAMPLE   6   /* Sample / Preset Select */
#define ENC_ACT_MASTER   7   /* Master Volume Pot */

/* Physical Faders F1..F4 */
#define FAD_ACT_DEFAULT   0   /* Sound Level (Bank 1: Ch 1-4, Bank 2: Ch 5-8) */
#define FAD_ACT_CH1       1   /* Sound 1 Volume */
#define FAD_ACT_CH2       2   /* Sound 2 Volume */
#define FAD_ACT_CH3       3   /* Sound 3 Volume */
#define FAD_ACT_CH4       4   /* Sound 4 Volume */
#define FAD_ACT_CH5       5   /* Sound 5 Volume */
#define FAD_ACT_CH6       6   /* Sound 6 Volume */
#define FAD_ACT_CH7       7   /* Sound 7 Volume */
#define FAD_ACT_CH8       8   /* Sound 8 Volume */
#define FAD_ACT_MASTER    9   /* Master Volume */
#define FAD_ACT_KNOB1     10  /* Screen Knob 1 */
#define FAD_ACT_KNOB2     11  /* Screen Knob 2 */
#define FAD_ACT_KNOB3     12  /* Screen Knob 3 */
#define FAD_ACT_KNOB4     13  /* Screen Knob 4 */
#define FAD_ACT_CUTOFF    14  /* Filter Cutoff */
#define FAD_ACT_RESO      15  /* Filter Resonance */
#define FAD_ACT_TEMPO     16  /* Tempo / BPM */

/* Physical button (0..17), encoder (0..7), and fader (0..3) mapping arrays in RAM */
extern uint8_t smk_btn_map[18];
extern uint8_t smk_enc_map[8];
extern uint8_t smk_fad_map[4];

/* Dynamic MIDI Controller Mode channels and CC tables in RAM */
extern uint8_t smk_midi_ch;
extern uint8_t smk_midi_knob_ch;
extern uint8_t smk_midi_fad_ch;
extern uint8_t smk_midi_pad_ch;
extern uint8_t smk_midi_knob_cc[16];
extern uint8_t smk_midi_fad_cc[8];
extern uint8_t smk_midi_pad_cc[32];

#define SMK_BTN_MAP smk_btn_map
#define SMK_ENC_MAP smk_enc_map
#define SMK_FAD_MAP smk_fad_map

/* Function prototypes */
int32_t smk_quantize_note(int32_t note_offset);

