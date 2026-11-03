/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Kerem Kilic (Ellic Studio) */
/* Exercise actual snapshot capture/restore with both parameter namespaces and
 * every native-patch kind. The one native snapshot must not overwrite itself. */
#define UI_TEST_NO_MAIN 1
#include "ui_test.c"
#include <assert.h>

static void take_parameter(uint32_t scope,uint32_t id)
{
    page_t page={"TEST",FAM_SEQ,(uint8_t)scope,GR_NONE,{(uint8_t)id,255,255,255}};
    page_over=&page;momentary_take(0);page_over=0;
}
static void parameter_namespaces(void)
{
    ui_power_on();ui.home=0;song.sel=2;
    fm1_in.buttons|=1u<<panel.btn[B_LFO];
    int16_t level=trk[2].p[P_LEVEL],attack=trk[2].p[P_ATK],swing=song.g[G_SWING];
    take_parameter(SC_TRACK,P_LEVEL);trk[2].p[P_LEVEL]=1;
    take_parameter(SC_TRACK,P_ATK);trk[2].p[P_ATK]=2;
    take_parameter(SC_GLOBAL,G_SWING);song.g[G_SWING]=3;
    take_parameter(SC_TRACK,P_LEVEL); /* repeated edits retain the first value */
    assert(momentary.count==3 && momentary.track==2);
    momentary_restore();
    assert(trk[2].p[P_LEVEL]==level && trk[2].p[P_ATK]==attack && song.g[G_SWING]==swing);
    assert(!momentary.active && !momentary.count);
}
static void native_snapshot(uint32_t engine,uint32_t scope,uint32_t id,uint32_t kind)
{
    ui_power_on();fm6_init();ui.home=0;TSEL->engine=TSEL->eng_req=(uint8_t)engine;
    fm1_in.buttons|=1u<<panel.btn[B_LFO];
    uint8_t fm[FP_SIZE+1u],fn[FM6_NFN],on=fm6_on[0];
    memcpy(fm,fm6_patch_of(0),sizeof fm);memcpy(fn,fm6_fn[0],sizeof fn);
    cz_patch_t cz=*cz_patch_of(0);p5_patch_t p5=*p5_patch_of(TSEL);
    int16_t voice=TSEL->p[P_VOICE],prio=TSEL->p[P_PRIO],detune=TSEL->p[P_DETUNE],alloc=TSEL->p[P_ALLOC];
    take_parameter(scope,id);assert(momentary.native==kind);
    if(kind==1){fm6_patch[0][FP_PR1]^=1;fm6_fn[0][0]^=1;fm6_on[0]^=1;}
    else if(kind==2)cz_patch_of(0)->raw[0]^=1;
    else{p5_patch[0].raw[0]^=1;TSEL->p[P_VOICE]=0;TSEL->p[P_PRIO]=1;TSEL->p[P_DETUNE]=7;TSEL->p[P_ALLOC]=1;}
    momentary_restore();
    assert(!memcmp(fm,fm6_patch_of(0),sizeof fm) && !memcmp(fn,fm6_fn[0],sizeof fn) && fm6_on[0]==on);
    assert(!memcmp(&cz,cz_patch_of(0),sizeof cz) && !memcmp(&p5,p5_patch_of(TSEL),sizeof p5));
    assert(TSEL->p[P_VOICE]==voice && TSEL->p[P_PRIO]==prio && TSEL->p[P_DETUNE]==detune && TSEL->p[P_ALLOC]==alloc);
}
int main(void)
{
    parameter_namespaces();
    native_snapshot(ENGI_FM6,SC_FM6,FP_PR1,1);
    native_snapshot(ENGI_CZ,SC_CZ1,0,2);
    native_snapshot(ENGI_PROPHET,SC_P5,P5_FREQ_A,3);
    puts("Momentary snapshots: parameter namespaces, repeated edits and all native patches restore exactly");
    return 0;
}
