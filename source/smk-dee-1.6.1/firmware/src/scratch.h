/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Kerem Kilic (Ellic Studio)
 * Portions Copyright (C) 2026 Andre Rezemini (SLOOP ram branch) */
/* Adapted from SLOOP PR #111, commit d024b410eeaba7d1f96888028517a8175ee09b4e:
 * https://github.com/isod89/sloop-fm1/pull/111
 * Main-loop work only: storage fills/consumes st inside each call; the HOME
 * and Stage scopes refill snap before drawing; OTA consumes dec inside each
 * ota_take caller. No member survives its call or reaches an ISR, core 1, or
 * LCD DMA. Drawing never calls storage or OTA, and neither calls a scope.
 * OTA staging and update parameters stay separate in project wire scratch:
 * staging needs decoded replies, and progress drawing needs the canvas. */
#ifndef MELODEE_MAIN_SCRATCH_H
#define MELODEE_MAIN_SCRATCH_H
#include <stdint.h>
static union {
    uint8_t st[256];
#ifndef MELODEE_LOADER
    int16_t snap[512];
    uint8_t transfer[256]; /* decoded/read backup chunk, consumed before reply send */
#endif
    uint8_t dec[640];
} main_scratch __attribute__((aligned(4)));
#endif
