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

/* Physical button (0..17), encoder (0..7), and fader (0..3) mapping arrays in RAM */
extern uint8_t smk_btn_map[18];
extern uint8_t smk_enc_map[8];
extern uint8_t smk_fad_map[4];

#define SMK_BTN_MAP smk_btn_map
#define SMK_ENC_MAP smk_enc_map
#define SMK_FAD_MAP smk_fad_map

/* Function prototypes */
int32_t smk_quantize_note(int32_t note_offset);
