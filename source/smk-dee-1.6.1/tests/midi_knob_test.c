/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Kerem Kilic (Ellic Studio) */
/* Real USB/UART queues -> audio dispatch -> foreground UI/native patch writes. */
#define MIDI_CONTROL_NO_MAIN
#include "midi_control_test.c"

static void knob_reset(uint32_t profile, uint32_t mode)
{
    midi_test_reset();
    settings_midi_knobs = (uint8_t)profile; settings_midi_knob_mode = (uint8_t)mode;
    midi_knob_r = midi_knob_w = midi_knob_overflow = 0;
    memset(midi_knob_seen, 0, sizeof midi_knob_seen);
    midi_knob_ui_config = ~0u;
    midi_master_volume = 127; midi_master_physical(4096);
    memset(host_enc, 0, sizeof host_enc);
    memset(&scrn, 0, sizeof scrn);
}
static void knob_cc(uint32_t source, uint32_t cc, uint32_t value)
{
    route_input(source, 0xB0, cc, value);
    ui_input();
}

static int panel_controls(void)
{
    int bad = 0;
    const uint8_t cc[2][8] = {{16,17,18,19,80,81,82,83},{74,71,76,77,93,18,19,16}};
    for (uint32_t source = 1; source <= 2; source++)
        for (uint32_t profile = MK_GENERAL; profile <= MK_MINILAB; profile++) {
            const uint8_t *map = cc[profile - 1u];
            knob_reset(profile, MK_ABSOLUTE);
            int32_t bpm = song.g[G_BPM];
            knob_cc(source, map[1], 64);
            bad += check("absolute SELECT establishes position without changing tempo", song.g[G_BPM] == bpm);
            knob_cc(source, map[1], 65);
            bad += check("mapped SELECT uses the real HOME SELECT control", song.g[G_BPM] == bpm + 1);
            knob_cc(source, map[2], 64); knob_cc(source, map[2], 65); browse_commit();
            bad += check("mapped PRESETS browses and loads the next sound", trk[0].preset == 1);
            knob_cc(source, map[3], 64); knob_cc(source, map[3], 65);
            bad += check("mapped ALGORITHM selects the next track", song.sel == 1);
            track_select(0);
            /* Native Prophet controls exercise descriptors stored in temporary cells. */
            set_engine_of(TSEL, ENGI_PROPHET); apply_preset_to(TSEL, 0);
            const uint8_t ids[4] = {P5_CUTOFF,P5_RESONANCE,P5_ENV_FILTER,P5_RELEASE_AMP};
            for (uint32_t k = 0; k < 4; k++) {
                knob_cc(source, map[4u + k], 64);
                uint8_t old = p5_patch_of(TSEL)->raw[ids[k]];
                route_input(source, 0xB0, map[4u + k], 127);
                bad += check("native patch stays untouched until foreground UI consumes MIDI", p5_patch_of(TSEL)->raw[ids[k]] == old);
                ui_input();
                bad += check("mapped KNOB 1..4 reaches the native parameter maximum", p5_patch_of(TSEL)->raw[ids[k]] == 127);
                knob_cc(source, map[4u + k], 0);
                bad += check("mapped KNOB 1..4 reaches the native parameter minimum", p5_patch_of(TSEL)->raw[ids[k]] == 0);
            }
            knob_cc(source, map[0], 0);
            bad += check("mapped VOLUME mutes the master", !song.master_q12);
            midi_master_physical(2048);
            bad += check("physical pot sampling retains MIDI attenuation", !song.master_q12);
            knob_cc(source, map[0], 127);
            bad += check("full MIDI VOLUME retains the physical pot's limit", song.master_q12 == 2048);
            settings_midi_knobs = MK_OFF; ui_input();
            bad += check("turning the profile OFF restores physical master volume", song.master_q12 == 2048);
        }
    return bad;
}

static int encoder_modes(void)
{
    int bad = 0;
    const uint8_t down[4] = {0,63,127,15}, up[4] = {0,65,1,17}, neutral[4] = {0,64,0,16};
    for (uint32_t mode = MK_REL1; mode < MK_MODES; mode++) {
        knob_reset(MK_MINILAB, mode);
        int32_t bpm = song.g[G_BPM];
        for (uint32_t n = 0; n < 8; n++) knob_cc(1, 71, up[mode]);
        bad += check("relative encoders keep every repeated +1 without local acceleration", song.g[G_BPM] == bpm + 8);
        knob_cc(1, 71, neutral[mode]);
        bad += check("relative neutral does not move SELECT", song.g[G_BPM] == bpm + 8);
        knob_cc(1, 71, down[mode]);
        bad += check("relative encoder decrements exactly once", song.g[G_BPM] == bpm + 7);
        knob_cc(1, 74, down[mode]);
        bad += check("relative volume starts at unity and decrements", midi_master_volume == 126);
    }
    knob_reset(MK_GENERAL, MK_ABSOLUTE);
    knob_cc(1, 17, 64); int32_t bpm = song.g[G_BPM];
    knob_cc(2, 17, 0);
    bad += check("TRS does not inherit USB's absolute navigation position", song.g[G_BPM] == bpm);
    route_input(1, 0xB1, 17, 127); ui_input();
    bad += check("another MIDI channel establishes its own position", song.g[G_BPM] == bpm);
    knob_cc(1, 17, 65);
    bad += check("the original USB/channel position survives interleaved input", song.g[G_BPM] == bpm + 1);
    settings_midi_knob_mode = MK_REL2;
    knob_cc(1, 17, 1);
    bad += check("mode changes reset absolute history and take relative input immediately", song.g[G_BPM] == bpm + 2);
    return bad;
}

static int isolation_and_overflow(void)
{
    int bad = 0;
    knob_reset(MK_MINILAB, MK_REL2);
    int32_t bpm = song.g[G_BPM];
    route_input(1, 0xB7, 71, 1); ui_input();
    bad += check("channels outside ROUT cannot operate the panel", song.g[G_BPM] == bpm && !midi_knob_w);
    int16_t level = TSEL->p[P_LEVEL];
    knob_cc(1, 7, 0);
    bad += check("unmapped standard CC7 still controls track volume", !TSEL->p[P_LEVEL] && level);
    set_engine_of(TSEL, ENGI_PROPHET); apply_preset_to(TSEL, 0);
    p5_patch_of(TSEL)->raw[P5_CUTOFF] = 50;
    knob_cc(1, 74, 0); /* relative volume neutral, formerly brightness */
    bad += check("mapped CC74 does not also modify synth cutoff", p5_patch_of(TSEL)->raw[P5_CUTOFF] == 50);
    knob_reset(MK_GENERAL, MK_ABSOLUTE);
    knob_cc(1, 17, 64); bpm = song.g[G_BPM];
    for (uint32_t i = 0; i < MIDI_KNOB_Q + 8u; i++) route_input(1, 0xB0, 17, i & 127u);
    bad += check("controller flood fills only its bounded UI queue", midi_knob_overflow && !midi_in_overflow);
    ui_input();
    bad += check("overflow discards the interrupted gesture without moving navigation", song.g[G_BPM] == bpm && midi_knob_r == midi_knob_w);
    knob_cc(1, 17, 100);
    bad += check("first absolute value after overflow rebases", song.g[G_BPM] == bpm);
    knob_cc(1, 17, 101);
    bad += check("controller input recovers on the next movement", song.g[G_BPM] == bpm + 1);
    route_input(1, 0xB0, 17, 110);
    settings_midi_knobs = MK_MINILAB; ui_input();
    bad += check("profile change discards pending old-profile controls", song.g[G_BPM] == bpm + 1);
    knob_reset(MK_GENERAL, MK_ABSOLUTE);
    knob_cc(1, 17, 64); knob_cc(2, 17, 64); bpm = song.g[G_BPM];
    route_input(1, 0xB0, 17, 100);   /* waiting in the UI queue when the controller disconnects */
    midi_usb_lost = 1; events_block(CTL); ui_input();
    bad += check("USB disconnect discards pending controls from its old session", song.g[G_BPM] == bpm);
    knob_cc(1, 17, 0);
    bad += check("a reconnected USB controller establishes a fresh position", song.g[G_BPM] == bpm);
    knob_cc(2, 17, 65);
    bad += check("USB reconnect preserves the TRS controller's position", song.g[G_BPM] == bpm + 1);
    return bad;
}

static int page_and_local_controls(void)
{
    int bad = 0;
    knob_reset(MK_MINILAB, MK_ABSOLUTE);
    set_engine_of(TSEL, ENGI_CZ); apply_preset_to(TSEL, 0); go_home();
    knob_cc(1, 18, 64); knob_cc(1, 18, 127);
    int16_t *vp; const param_desc_t *d = home_param(1, &vp);
    bad += check("absolute MIDI edits the native CZ Stage parameter through its writer", d && *vp == d->max);
    knob_cc(1, 18, 0); d = home_param(1, &vp);
    bad += check("native CZ absolute parameter reaches minimum", d && *vp == d->min);
    knob_reset(MK_MINILAB, MK_ABSOLUTE);
    set_engine_of(TSEL, ENGI_FM6); apply_preset_to(TSEL, 0);
    for (uint32_t p = 0; p < NPAGES; p++) if (PAGES[p].scope == SC_FMOP) { ui.home = 0; ui.page = p; break; }
    knob_cc(1, 93, 64); knob_cc(1, 93, 127);
    d = page_desc(cur_page(), 0, &vp);
    bad += check("absolute MIDI follows the current FM6 operator page", d && *vp == d->max);
    knob_cc(1, 93, 0); d = page_desc(cur_page(), 0, &vp);
    bad += check("native FM6 operator absolute parameter reaches minimum", d && *vp == d->min);
    knob_reset(MK_MINILAB, MK_ABSOLUTE);
    set_engine_of(TSEL, ENGI_PROPHET); apply_preset_to(TSEL, 0);
    p5_patch_of(TSEL)->raw[P5_CUTOFF] = 50;
    knob_cc(1, 93, 64);
    route_input(1, 0xB0, 93, 127);
    host_enc[panel.enc[EN_K1]] = 1;
    uint8_t cutoff = p5_patch_of(TSEL)->raw[P5_CUTOFF]; ui_input();
    bad += check("simultaneous physical input wins without inheriting the MIDI absolute value", p5_patch_of(TSEL)->raw[P5_CUTOFF] == cutoff + 1);
    song.rec = 1; seq_start(); seq_tick(TSEL, CTL);
    knob_cc(1, 93, 0);
    bad += check("MIDI native edits record through the existing motion path", motion.count && motion.event[0].param == MO_NATIVE + P5_CUTOFF);
    seq_stop();
    knob_reset(MK_MINILAB, MK_ABSOLUTE);
    go_page(GR_FXRACK);
    knob_cc(1, 93, 64); knob_cc(1, 93, 127);
    d = page_desc(cur_page(), 0, &vp);
    bad += check("absolute note FX selection reaches NOTE ECHO", d && *vp == FX_MIDIDELAY && enum_rows(d) == 3);
    knob_cc(1, 93, 0); d = page_desc(cur_page(), 0, &vp);
    bad += check("absolute FX selection returns to OFF across nonnumeric effect IDs", d && !*vp);
    knob_reset(MK_OFF, MK_ABSOLUTE);
    ui.menu = 1; ui.menu_sel = MI_MIDI_KNOBS;
    menu_input(2); menu_input(2);
    bad += check("settings menu enables the MiniLab profile", settings_midi_knobs == MK_MINILAB);
    ui.menu_sel = MI_MIDI_MODE; menu_input(2);
    bad += check("settings menu selects the encoder mode", settings_midi_knob_mode == MK_REL1);
    knob_reset(MK_MINILAB, MK_REL2);
    set_engine_of(TSEL, ENGI_MIDI); events_block(CTL); usb.config = 1; mo_r = mo_w = 0;
    int32_t bpm = song.g[G_BPM]; knob_cc(1, 71, 1);
    bad += check("panel CCs operate the selected MIDI Track without forwarding", song.g[G_BPM] == bpm + 1 && mo_r == mo_w);
    knob_cc(1, 7, 100);
    bad += check("unmapped CCs still pass through a MIDI Track", mo_r != mo_w && ((midi_out_q[mo_r % MQ] >> 16) & 127u) == 7);
    return bad;
}

int main(void)
{
    int bad = panel_controls() + encoder_modes() + isolation_and_overflow() + page_and_local_controls();
    printf("%s\n", bad ? "MIDI KNOB TEST FAILED" : "MIDI knob integration tests passed");
    return bad != 0;
}
