/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Kerem Kilic (Ellic Studio) */
/* Saadet's installer log framing, backed by Melodee's own retained records.
 * Read-only: no reset, acknowledgement, flash write or clearing of a record. */
static void installer_report_line(const char *text)
{
    uint8_t wire[96] = {0xF0,0x7D,0x4C,0x47};
    uint32_t n=4;
    while (*text && n<sizeof wire-1u) wire[n++]=(uint8_t)*text++ & 0x7Fu;
    wire[n++]=0xF7;
    ota_wire_send(wire,n);
}
static void installer_report_value(const char *name, uint32_t value)
{
    char line[48];uint32_t n=0;
    while (*name && n<sizeof line-10u) line[n++]=*name++;
    line[n++]=' ';
    for (uint32_t i=0;i<8;i++) line[n++]="0123456789ABCDEF"[(value>>(28u-i*4u))&15u];
    line[n]=0;installer_report_line(line);
}
static int installer_report_frame(const uint8_t *p, uint32_t n)
{
    if (n!=3 || p[0]!=0x7D || p[1]!=0x4C || p[2]!=0x47) return 0;
    installer_report_line("Melodee " MELODEE_ID);
    if (fm1_crash.magic==FM1_CRASH_MAGIC) {
        installer_report_value("CPU0 count",fm1_crash.count);
        installer_report_value("CPU0 vector",fm1_crash.vec);
        installer_report_value("CPU0 PC",fm1_crash.pc);
        installer_report_value("CPU0 RETS",fm1_crash.rets);
        installer_report_value("CPU0 EMU",fm1_crash.emu);
        installer_report_value("CPU0 DBG",fm1_crash.dbg);
        installer_report_value("CPU0 SP",fm1_crash.sp);
        installer_report_value("CPU0 uptime ms",fm1_crash.uptime_ms);
    } else installer_report_line("No retained CPU0 crash record");
#if MELODEE_DUAL_CORE
    installer_report_value("CPU1 fault count",fm1_core1_fault.count);
    if (fm1_core1_fault.count) {
        installer_report_value("CPU1 PC",fm1_core1_fault.pc);
        installer_report_value("CPU1 RETS",fm1_core1_fault.rets);
        installer_report_value("CPU1 EMU",fm1_core1_fault.emu);
        installer_report_value("CPU1 DBG",fm1_core1_fault.dbg);
    }
#endif
    installer_report_line("end");return 1;
}
