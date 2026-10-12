/* SPDX-License-Identifier: GPL-3.0-only */
/* Generated automatically by SMK-37 Control Remapper */
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

/* ZP-12 Logical Actions */
#define ACT_NONE    0xFF
#define ACT_OCTDN   0   /* B_OCTDN: Cursor < / Bar- / Bank A+B / Undo */
#define ACT_OCTUP   1   /* B_OCTUP: Cursor > / Bar+ / Bank C+D / Redo */
#define ACT_FX      2   /* B_FX: FX / Punch-in */
#define ACT_SEL     3   /* B_SEL: Select / Shift (Knob Bank) */
#define ACT_ENV     4   /* B_ENV: Envelope / Tap Tempo */
#define ACT_LFO     5   /* B_LFO: LFO / Step Erase */
#define ACT_EDIT    6   /* B_EDIT: Edit Sound */
#define ACT_GLO     7   /* B_GLO: Global / Mutes */
#define ACT_HOME    8   /* B_HOME: Home / Mix */
#define ACT_SAVE    9   /* B_SAVE: Save */
#define ACT_ARP     10  /* B_ARP: Multi-pitch Chromatic (ARP) */
#define ACT_SEQ     11  /* B_SEQ: Sequencer / Step Grid */
#define ACT_PLAY    12  /* B_PLAY: Play / Pause */
#define ACT_REC     13  /* B_REC: Record / Clear */
#define ACT_PREV    14  /* Nav Previous Page / Step Bar */
#define ACT_NEXT    15  /* Nav Next Page / Step Bar */
#define ACT_FBANK   16  /* Fader Bank Toggle (Sounds 1-4 / 5-8) */
#define ACT_SCALE   17  /* Scale Quantize Mode Toggle */
#define ACT_REPEAT  18  /* Note Repeat / Roll (1/16 Beat Roll) */
#define ACT_CHORD   19  /* Chord Mode Cycle */
#define ACT_KBD_OCTDN 20  /* Keyboard Octave Down (-3..+3) */
#define ACT_KBD_OCTUP 21  /* Keyboard Octave Up (-3..+3) */

/* Physical button (0..17) to logical action mapping */
static const uint8_t SMK_BTN_MAP[18] = {
    ACT_LFO      /* 0: KNOB BANK (ERASE in ZP-12, Knob Bank in MIDI) */,
    ACT_FBANK    /* 1: FADER BANK */,
    ACT_OCTDN    /* 2: < (LEFT) */,
    ACT_OCTUP    /* 3: > (RIGHT) */,
    ACT_KBD_OCTDN /* 4: OCTAVE- */,
    ACT_KBD_OCTUP /* 5: OCTAVE+ */,
    ACT_ARP      /* 6: ARP */,
    ACT_REPEAT   /* 7: NOTE REPEAT */,
    ACT_SCALE    /* 8: SCALE */,
    ACT_CHORD    /* 9: CHORD */,
    ACT_GLO      /* 10: GLOBE */,
    ACT_ENV      /* 11: BT (Tap Tempo) */,
    ACT_HOME     /* 12: PATCH */,
    ACT_EDIT     /* 13: PARA */,
    ACT_FX       /* 14: FX */,
    ACT_SEQ      /* 15: SEQ */,
    ACT_PLAY     /* 16: SEQ PLAY */,
    ACT_REC      /* 17: SEQ REC */,
};

/* ZP-12 Logical Encoder Actions */
#define ENC_ACT_NONE   0xFF
#define ENC_ACT_KNOB1  0   /* Screen Knob 1 */
#define ENC_ACT_KNOB2  1   /* Screen Knob 2 */
#define ENC_ACT_KNOB3  2   /* Screen Knob 3 */
#define ENC_ACT_KNOB4  3   /* Screen Knob 4 */
#define ENC_ACT_TEMPO  4   /* Tempo / BPM */
#define ENC_ACT_PADSEL 5   /* Pad / Algorithm Select */
#define ENC_ACT_SAMPLE 6   /* Preset / Sample Select */
#define ENC_ACT_MASTER 7   /* Master Volume */

/* Physical encoders K1..K8 (indices 0..7) mapping */
static const uint8_t SMK_ENC_MAP[8] = {
    ENC_ACT_KNOB1  /* K1 */,
    ENC_ACT_KNOB2  /* K2 */,
    ENC_ACT_KNOB3  /* K3 */,
    ENC_ACT_KNOB4  /* K4 */,
    ENC_ACT_TEMPO  /* K5 */,
    ENC_ACT_PADSEL /* K6 */,
    ENC_ACT_SAMPLE /* K7 */,
    ENC_ACT_MASTER /* K8 */,
};

/* ZP-12 Logical Fader Actions */
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

/* Physical faders F1..F4 (indices 0..3) mapping */
static const uint8_t SMK_FAD_MAP[4] = {
    FAD_ACT_DEFAULT  /* F1 */,
    FAD_ACT_DEFAULT  /* F2 */,
    FAD_ACT_DEFAULT  /* F3 */,
    FAD_ACT_DEFAULT  /* F4 */,
};

/* Function prototypes */
int32_t smk_quantize_note(int32_t note_offset);
