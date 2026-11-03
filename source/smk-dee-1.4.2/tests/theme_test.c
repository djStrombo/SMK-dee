/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Kerem Kilic (Ellic Studio) */
/* The palettes and the real canvas/text renderer (src/gfx.c): NIGHT DAY CONTRAST with each track's colour as THEME,
 * the test-only GRAY stays gray in every token and blend, every palette's text contrast, the alpha blend, the ramp
 * cache (palette and track), the fonts' metrics (Rubik) and the ellipsis.
 * Optional: a palette sheet (PPM). */
#include <stdint.h>
#include <stdio.h>
#include <assert.h>
#include <math.h>
#include <string.h>
#define __attribute__(x)
static void lcd_sync(void) {}
static void lcd_fill(uint32_t x, uint32_t y, uint32_t w, uint32_t h, uint16_t c) { (void)x; (void)y; (void)w; (void)h; (void)c; }
static void lcd_blit(uint32_t x, uint32_t y, uint32_t w, uint32_t h, const uint16_t *p)
{ (void)x; (void)y; (void)w; (void)h; (void)p; }
#define UI_TEST_PALETTE 1
#include "../firmware/src/gfx.c"
static uint32_t ty_pixel(void) { return 0; }            /* (ui.c: Settings > FONT; Rubik here) */

#define SHEET_W 960u
#define SHEET_H (((UI_PAL_ENTRIES + 3u) / 4u) * 124u)   /* (every palette, GRAY too) */
static uint16_t sheet[SHEET_W * SHEET_H];
static unsigned channel(uint16_t c, unsigned n)
{ return n == 0 ? c >> 11 : n == 1 ? (c >> 5) & 63 : c & 31; }
static int gray(uint16_t c) { return channel(c, 0) == channel(c, 2) && channel(c, 1) == channel(c, 0) * 2u; }
static double luminance(uint16_t color)
{
    const double weight[] = {0.2126, 0.7152, 0.0722};
    double result = 0;
    for (unsigned c = 0; c < 3; c++) {
        double v = channel(color, c) / (c == 1 ? 63.0 : 31.0);
        result += weight[c] * (v <= 0.04045 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4));
    }
    return result;
}
static double contrast(uint16_t fg, uint16_t bg)
{
    double a = luminance(fg), b = luminance(bg);
    return a > b ? (a + 0.05) / (b + 0.05) : (b + 0.05) / (a + 0.05);
}

int main(int argc, char **argv)
{
    static const aag_t pg[1] = {{0, 48, 0, 0, 3, 1}};   /* one glyph 'A': 3 px, alpha 0, 8, 15 */
    static const uint8_t pd[] = {0x08, 0xf0};
    const aafont_t probe = {1, 1, 'A', 'A', 0, 0, pg, pd, 0, 0, 0};
    double worst = 100;
    assert(NPALETTES == 8u && !strcmp(UI_PALETTES[0].name, "NIGHT") && !strcmp(UI_PALETTES[1].name, "DAY") &&
           !strcmp(UI_PALETTES[2].name, "CONTRAST") && !strcmp(UI_PALETTES[3].name, "SUNSET") &&
           !strcmp(UI_PALETTES[4].name, "OCEAN") && !strcmp(UI_PALETTES[5].name, "NEON") &&
           !strcmp(UI_PALETTES[6].name, "CANDY") && !strcmp(UI_PALETTES[7].name, "LO-FI") &&
           !strcmp(UI_PALETTES[UI_GRAY_INDEX].name, "GRAY"));
    for (unsigned pt = 0; pt < UI_PAL_ENTRIES * 4u; pt++) {
        unsigned p = pt / 4u, t = pt % 4u;
        uint16_t *tok = &ux.bg;
        palette_set(p);
        ux.trk = 0xFF;
        palette_track(t);                                      /* THEME: track t's colour */
        assert(T_THEME == UI_PALETTES[p].trk[t] && T_TRK(t) == T_THEME);
        if (p == UI_GRAY_INDEX)
            for (unsigned i = 0; i < 14; i++) assert(gray(tok[i]));      /* every token, derived ones too (RAISE, KEY the last) */
        /* text and the things read on the screen; the generator checks the same (tools/gen_ui_palettes.py) */
        struct { uint16_t fg, bg; double min; } c[] = {
            {T_TEXT, T_BG, 12.0}, {T_TEXT, T_SURF, 9.0}, {T_MID, T_BG, 5.0}, {T_MID, T_SURF, 4.0},
            {T_THEME, T_BG, 4.5}, {T_THEME, T_SURF, 4.5}, {T_ACCENT, T_BG, 4.5}, {T_ACCENT, T_SURF, 4.5},
            {T_INK, T_SEL, 4.5}, {T_INK, T_THEME, 4.5}, {T_DIM, T_BG, 2.2}, {T_LINE, T_BG, 1.25}, {T_REC, T_BG, 3.0},
            {T_INK, T_KEY, 4.5}, {T_KEY, T_BG, 3.0}, {T_KEY, T_SURF, 2.5}, {T_INK, T_DIM, 1.8}, {T_INK, T_ACCENT, 4.5},
            {T_KNOB(0), T_BG, 4.5}, {T_KNOB(1), T_BG, 4.5}, {T_KNOB(2), T_BG, 4.5}, {T_KNOB(3), T_BG, 4.5},
            {T_KNOB(0), T_SURF, 4.5}, {T_KNOB(1), T_SURF, 4.5}, {T_KNOB(2), T_SURF, 4.5}, {T_KNOB(3), T_SURF, 4.5}};
        assert(T_KNOB(0) == T_THEME);                          /* (knob 1's colour: the track's own) */
        double min = 100;
        for (unsigned i = 0; i < sizeof c / sizeof c[0]; i++) {
            double r = contrast(c[i].fg, c[i].bg);
            if (r < c[i].min) printf("%s T%u: pairing %u contrast %.2f < %.2f\n", UI_PALETTES[p].name, t + 1, i, r, c[i].min);
            assert(r >= c[i].min);
            if (r / c[i].min < min) min = r / c[i].min;
        }
        if (min < worst) worst = min;
        printf("%-8s T%u text %.1f:1, labels %.1f:1, track %.1f:1, selection %.1f:1\n", UI_PALETTES[p].name, t + 1,
               contrast(T_TEXT, T_BG), contrast(T_MID, T_BG), contrast(T_THEME, T_BG), contrast(T_INK, T_SEL));
        assert((p == 1u || p == 6u) == ux.light);              /* DAY and CANDY are the light ones */
        assert(T_REC == (p == UI_GRAY_INDEX ? T_ACCENT : ux.light ? UI_REC_LIGHT : UI_REC_DARK));
        /* the blend: transparent, solid and an edge between the two, on two backgrounds */
        for (unsigned b = 0; b < 2; b++) {
            uint16_t under = b ? T_SEL : T_BG, ink = b ? T_INK : T_THEME;
            cv_begin(3, 1, under);
            cv_text_on(0, 0, &probe, "A", ink, under);
            assert(swap16(cv_px[0]) == under && swap16(cv_px[2]) == ink);
            for (unsigned k = 0; k < 3; k++) {
                unsigned a = channel(under, k), z = channel(ink, k), m = channel(swap16(cv_px[1]), k);
                assert(m >= (a < z ? a : z) && m <= (a > z ? a : z));   /* no halo */
            }
            if (p == UI_GRAY_INDEX) assert(gray(swap16(cv_px[1])));
        }
        {   /* the COLOR row's value, as ui_menu.c menu_words writes it ("CONTRAST" -> "Contrast") */
            char w[16];
            unsigned k;
            snprintf(w, sizeof w, "%s", UI_PALETTES[p].name);
            for (k = 1; w[k]; k++) if (w[k] >= 'A' && w[k] <= 'Z') w[k] = (char)(w[k] + 32);
            assert(text_w(&AF_TX, w) <= 120);
        }
        cv_begin(240, 124, T_BG);
        cv_text(4, 0, &AF_TX, UI_PALETTES[p].name, T_TEXT);      /* (the large type's roles) */
        for (unsigned k = 0; k < 5; k++) cv_rect(150 + k * 16, 6, 12, 12, tok[k]);
        cv_text(4, 26, &AF_LB, "LABEL", T_MID);
        cv_text(70, 24, &AF_TX, "VALUE 127", T_THEME);
        cv_text(180, 24, &AF_TX, "HOT", T_ACCENT);
        cv_text(4, 46, &AF_LB, "INACTIVE", T_DIM);
        cv_rect(84, 46, 150, 20, T_SEL);
        cv_text_on(90, 47, &AF_LB, "SELECTED ROW", T_INK, T_SEL);
        cv_rect(4, 70, 232, 1, T_LINE);
        cv_rect(4, 76, 120, 3, T_LINE);
        cv_rect(4, 76, 70, 3, T_SEL);
        cv_rect(74, 74, 1, 7, T_THEME);
        cv_text(136, 70, &AF_LB, "REC", T_REC);
        cv_text(4, 84, &AF_VL, "124", T_THEME);
        cv_text(80, 82, &AF_LB, "Mixed case text", T_TEXT);
        cv_key_hint(80, 100, KC_OCTUP, "LOAD", 1, T_BG);          /* keycaps: available, unavailable */
        cv_key_hint(160, 100, KC_OCTDN, "BACK", 0, T_BG);
        for (unsigned y = 0; y < 124; y++)
            for (unsigned x = 0; x < 240; x++) {
                uint16_t v = swap16(cv_px[y * 240 + x]);
                if (p == UI_GRAY_INDEX) assert(gray(v));          /* every blended pixel of GRAY */
                if (!t) sheet[(p / 4 * 124 + y) * 960 + p % 4 * 240 + x] = v;
            }
    }
    /* the ramp cache follows the palette (a stale ramp would blend toward the old background) */
    palette_set(0);
    cv_begin(3, 1, T_BG); cv_text(0, 0, &probe, "A", T_THEME);
    uint16_t night = swap16(cv_px[1]);
    palette_set(1);
    cv_begin(3, 1, T_BG); cv_text(0, 0, &probe, "A", T_THEME);
    assert(swap16(cv_px[1]) != night);
    palette_set(0);
    assert(palette_track(1) && !palette_track(1));             /* (and so does the track: once) */
    cv_begin(3, 1, T_BG); cv_text(0, 0, &probe, "A", T_THEME);
    assert(swap16(cv_px[1]) != night);
    /* fonts (docs/design README "Large type"): Rubik 500 LB 16, TX 20, VL 28, HR 48 px; Melodee Pixel's faces on the
     * same line heights and baselines; tabular digits; the ellipsis; HR small letters too */
    assert(AF_LB.h == 19 && AF_LB.asc == 15 && AF_TX.h == 24 && AF_TX.asc == 19 && AF_VL.h == 34 && AF_VL.asc == 27 &&
           AF_HR.h == 57 && AF_HR.asc == 45);
    assert(AP_LB.h == AF_LB.h && AP_LB.asc == AF_LB.asc && AP_TX.h == AF_TX.h && AP_TX.asc == AF_TX.asc &&
           AP_VL.h == AF_VL.h && AP_VL.asc == AF_VL.asc && AP_HR.h == AF_HR.h && AP_HR.asc == AF_HR.asc);
    assert(text_w(&AF_LB, "0000") == text_w(&AF_LB, "1111") && text_w(&AF_VL, "0000") == text_w(&AF_VL, "1111"));
    assert(text_w(&AF_TX, "0000") == text_w(&AF_TX, "1111") && text_w(&AF_LB, "1.25") == text_w(&AF_LB, "8.75"));
    assert(glyph(&AF_LB, (uint8_t)ELLIPSIS) != glyph(&AF_LB, '?') && glyph(&AF_TX, (uint8_t)ELLIPSIS) != glyph(&AF_TX, '?'));
    assert(text_w(&AF_HR, "abc") != text_w(&AF_HR, "ABC") && glyph(&AF_HR, 'a') != glyph(&AF_HR, 'A'));
    {
        char b[32];
        assert(!text_fit(b, sizeof b, "KICK", &AF_LB, 60) && !strcmp(b, "KICK"));
        assert(text_fit(b, sizeof b, "A VERY LONG PRESET NAME", &AF_LB, 60) && text_w(&AF_LB, b) <= 60);
        assert(b[strlen(b) - 1] == ELLIPSIS && b[strlen(b) - 2] != ' ');
        assert(text_fit(b, sizeof b, "WWWWWWWW", &AF_TX, 1) && b[0] == ELLIPSIS && !b[1]);
    }
    if (argc > 1) {
        FILE *f = fopen(argv[1], "wb"); assert(f);
        fprintf(f, "P6\n%u %u\n255\n", (unsigned)SHEET_W, (unsigned)SHEET_H);
        for (unsigned i = 0; i < SHEET_W * SHEET_H; i++) {
            fputc(channel(sheet[i], 0) * 255 / 31, f);
            fputc(channel(sheet[i], 1) * 255 / 63, f);
            fputc(channel(sheet[i], 2) * 255 / 31, f);
        }
        fclose(f);
    }
    printf("Palettes: MONO gray, contrast (worst margin x%.2f), blending, ramp cache, font metrics and ellipsis passed.\n", worst);
    return 0;
}
