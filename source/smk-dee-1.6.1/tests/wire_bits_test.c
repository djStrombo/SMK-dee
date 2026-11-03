/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Kerem Kilic (Ellic Studio) */
#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "../firmware/src/wire_bits.h"

/* Independent 64-bit arithmetic checks the on-disk byte order, unaligned
 * fields, truncation and surrounding bits, rather than just a round trip. */
int main(void)
{
    const uint32_t values[] = {0, 1, 0x7f, 0x12345678, 0x80000000, 0xffffffff};
    const uint64_t backgrounds[] = {0, UINT64_C(0x9362a518c47bd0ef)};
    for (uint32_t offset = 0; offset < 24u; offset++)
        for (uint32_t width = 0; width <= 32u; width++)
            for (uint32_t k = 0; k < sizeof values / sizeof *values; k++)
                for (uint32_t bg = 0; bg < sizeof backgrounds / sizeof *backgrounds; bg++) {
                    uint8_t raw[10];
                    memset(raw, 0xa5, sizeof raw);
                    for (uint32_t i = 0; i < 8u; i++) raw[i+1u] = (uint8_t)(backgrounds[bg] >> (8u*i));
                    uint64_t mask = (UINT64_C(1) << width) - 1u;
                    uint64_t expected = backgrounds[bg] | (((uint64_t)values[k] & mask) << offset);
                    uint32_t pos = offset;
                    wire_bits_put(raw+1, &pos, values[k], width);
                    assert(pos == offset + width && raw[0] == 0xa5 && raw[9] == 0xa5);
                    for (uint32_t i = 0; i < 8u; i++) assert(raw[i+1u] == (uint8_t)(expected >> (8u*i)));
                    pos = offset;
                    assert(wire_bits_get(raw+1, &pos, width) == (uint32_t)((expected >> offset) & mask));
                    assert(pos == offset + width);
                }
    puts("Wire fields: widths 0..32, unaligned bytes, fixed little-endian layout, OR writes and canaries: OK");
    return 0;
}
