/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Kerem Kilic (Ellic Studio) */
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <assert.h>
#define MELODEE_ID "FM-1_900"
#define MELODEE_DUAL_CORE 1
#define FM1_CRASH_MAGIC 0x43525348u
static struct { uint32_t magic,count,vec,pc,rets,emu,dbg,sp,uptime_ms; } fm1_crash;
static struct { uint32_t count,pc,rets,emu,dbg; } fm1_core1_fault;
static char report[2048];static uint32_t used,frames;
static int ota_wire_send(const uint8_t *p,uint32_t n)
{
    assert(n>=5 && n<=96 && !memcmp(p,"\xF0\x7D\x4C\x47",4) && p[n-1]==0xF7);
    for(uint32_t i=4;i<n-1;i++){assert(p[i]<128);report[used++]=(char)p[i];}
    report[used++]='\n';report[used]=0;frames++;return 0;
}
#include "../firmware/src/installer_report.c"
int main(void)
{
    uint8_t request[]={0x7D,0x4C,0x47};
    assert(!installer_report_frame(request,2) && frames==0);
    assert(installer_report_frame(request,3));
    assert(strstr(report,"No retained CPU0 crash record\n") && strstr(report,"end\n"));
    used=frames=0;fm1_crash.magic=FM1_CRASH_MAGIC;fm1_crash.pc=0x02001234;fm1_crash.count=3;
    fm1_core1_fault.count=1;fm1_core1_fault.pc=0x1c40000;
    assert(installer_report_frame(request,3));
    assert(strstr(report,"CPU0 PC 02001234") && strstr(report,"CPU1 PC 01C40000"));
    assert(fm1_crash.count==3 && fm1_core1_fault.count==1);
    puts("installer report: bounded SysEx, CPU0/CPU1 records, no-record response and read-only behavior passed");
}
