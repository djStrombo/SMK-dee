/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Kerem Kilic (Ellic Studio) */
/* Original full-table operators, reconstructed independently from the ROM
 * halves. Test every phase cell, both signs, fractional phase bits, envelope
 * wrap, silence and overshoot. No floating point tolerance. */
#define main hostsim_main
#include "hostsim.c"
#undef main
#include <assert.h>
static uint16_t full_mki[2048],full_opl[512];
static int32_t reference_mki(int32_t ph,int32_t env)
{
    uint32_t e=((uint32_t)full_mki[((uint32_t)ph>>12)&2047u]+(((uint32_t)ph>>8)&0x8000u)+(uint32_t)env)&0xffffu;
    int32_t y=(int32_t)(((uint32_t)FM6_MKI_EXP[e&1023u]>>((e&32767u)>>10))<<13);
    return e&32768u?-y-8192:y;
}
static int32_t reference_opl(int32_t ph,int32_t env)
{
    uint32_t e=((uint32_t)full_opl[((uint32_t)ph>>14)&511u]+(((uint32_t)ph>>8)&0x8000u)+((uint32_t)env<<3))&65535u;
    uint32_t sh=(e&32767u)>>8;
    int32_t y=sh>31u?0:(int32_t)((uint32_t)FM6_OPL_EXP[e&255u]>>sh);
    return (e&32768u?-y-1:y)*16384;
}
int main(void)
{
    for(uint32_t i=0;i<1024u;i++){full_mki[i]=FM6_MKI_LOG_H[i];full_mki[2047u-i]=FM6_MKI_LOG_H[i];}
    for(uint32_t i=0;i<256u;i++){full_opl[i]=FM6_OPL_LOG_H[i];full_opl[511u-i]=FM6_OPL_LOG_H[i];}
    for(uint32_t i=0;i<4096u;i++)for(int32_t env=-65537;env<=65537;env+=127){
        int32_t ph=(int32_t)((i<<12)|((i*733u)&4095u)|0x55000000u);
        assert(fm6_mki(ph,env)==reference_mki(ph,env));
        assert(fm6_opl(ph,env)==reference_opl(ph,env));
    }
    assert(sizeof FM6_MKI_LOG+sizeof FM6_OPL_LOG==2560u);
    puts("FM6 folded ROMs: every phase/sign and wrapped envelope exactly matches original full tables; 2560 B RAM saved");
    return 0;
}
