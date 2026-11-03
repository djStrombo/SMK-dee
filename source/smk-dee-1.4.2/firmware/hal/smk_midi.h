/* SPDX-License-Identifier: GPL-3.0-only
 * M-VAVE SMK-37 Hardware MIDI Subsystem
 * TRS MIDI OUT (UART1 on PC7 via JieLi Crossbar Output Channel 1)
 * Supports 24 PPQN MIDI Clock, Start/Stop transport, and Multitrack Channel Routing.
 */
#pragma once
#include <stdint.h>

/* SMK-37 UART1 & Crossbar Hardware Registers (JieLi AC791N / WL82) */
#define SMK_UT1_CON0    (*(volatile uint32_t *)0x12100u)
#define SMK_UT1_CON1    (*(volatile uint32_t *)0x12104u)
#define SMK_UT1_BAUD    (*(volatile uint32_t *)0x12108u)
#define SMK_UT1_BUF     (*(volatile uint32_t *)0x1210Cu)
#define SMK_UT1_OTCNT   (*(volatile uint32_t *)0x12110u)
#define SMK_CLK_CON1    (*(volatile uint32_t *)0x10010u)
#define SMK_IOMAP_CON3  (*(volatile uint32_t *)0x51028u)
#define SMK_PORTC_OUT   (*(volatile uint32_t *)0x50080u)
#define SMK_PORTC_DIR   (*(volatile uint32_t *)0x50088u)
#define SMK_PORTC_DIE   (*(volatile uint32_t *)0x5008Cu)
#define SMK_PORTC_PU    (*(volatile uint32_t *)0x50090u)
#define SMK_PORTC_PD    (*(volatile uint32_t *)0x50094u)
#define SMK_PORTC_HD    (*(volatile uint32_t *)0x5009Cu)

/* 256-byte Ring buffer for Lock-Free non-blocking TRS MIDI OUT (placed in .bss / RAM) */
#define SMK_TRS_RING_SIZE 256u
volatile uint8_t  smk_trs_ring[SMK_TRS_RING_SIZE] __attribute__((weak, section(".bss")));
volatile uint32_t smk_trs_w __attribute__((weak, section(".bss")));
volatile uint32_t smk_trs_r __attribute__((weak, section(".bss")));
volatile uint8_t  smk_trs_busy __attribute__((weak, section(".bss")));
volatile uint8_t  smk_trs_timer __attribute__((weak, section(".bss")));
volatile uint8_t  smk_trs_inited __attribute__((weak, section(".bss")));

/* Initialize UART1 hardware transmitter on pin PC7 */
static inline void smk_trs_midi_init(void)
{
    /* 1. UART clock: 48 MHz from PLL48M (CLK_CON1 bits [11:10] = 1) */
    SMK_CLK_CON1 = (SMK_CLK_CON1 & ~(3u << 10)) | (1u << 10);

    /* 2. Disable fixed UART1 IO mapping in IOMAP_CON3 (bit 7 = 0) */
    SMK_IOMAP_CON3 &= ~0x80u;

    /* 3. Crossbar: Select UT1_TX on Output Channel 1 (IOMAP_CON3 bits [23:20] = 1) */
    SMK_IOMAP_CON3 = (SMK_IOMAP_CON3 & ~(0xFu << 20)) | (1u << 20);

    /* 4. Configure PC7 pin for Output Channel 1 crossbar:
     *    Crossbar mux enabled when PU=1 and PD=1 simultaneously.
     *    Channel 1 selected when OUT=0 and DIE=1.
     *    High Drive (HD) enabled, Direction = Output (DIR=0).
     */
    SMK_PORTC_DIR &= ~(1u << 7);    /* Output (0 = out) */
    SMK_PORTC_PU  |=  (1u << 7);    /* Pull-Up = 1 */
    SMK_PORTC_PD  |=  (1u << 7);    /* Pull-Down = 1 (enables crossbar mux!) */
    SMK_PORTC_OUT &= ~(1u << 7);    /* OUT = 0 (selects Ch 1) */
    SMK_PORTC_DIE |=  (1u << 7);    /* DIE = 1 (selects Ch 1) */
    SMK_PORTC_HD  |=  (1u << 7);    /* High Drive strength */

    /* 5. Initialize UART1 registers: 31250 baud @ 48MHz (48000000 / (31250 * 4) - 1 = 383) */
    SMK_UT1_CON0 = 0x3400u;          /* Reset UART1, clear pendings */
    SMK_UT1_CON1 = 0;
    SMK_UT1_BAUD = 48000000u / 31250u / 4u - 1u;  /* 383 */
    SMK_UT1_OTCNT = 60000u;
    __asm__ volatile("csync" ::: "memory");
    SMK_UT1_CON0 = (1u << 13) | 1u;  /* Clear TPND (bit 13), Enable UART (bit 0) */
    __asm__ volatile("csync" ::: "memory");

    smk_trs_busy = 0;
    smk_trs_timer = 0;
    smk_trs_inited = 1;
}

/* Drain pending bytes from ring buffer into UART1 TX FIFO (called ONLY from 10 kHz TIMER5 ISR) */
static inline void smk_trs_poll(void)
{
    if (!smk_trs_inited) {
        smk_trs_midi_init();
    }

    /* 1. If currently transmitting, check if completed (bit 15 = 1) */
    if (smk_trs_busy) {
        if (SMK_UT1_CON0 & (1u << 15)) {
            SMK_UT1_CON0 |= (1u << 13); /* 0x2000: Clear TPND */
            __asm__ volatile("csync" ::: "memory");
            smk_trs_busy = 0;
            smk_trs_timer = 0;
        } else {
            /* Watchdog: 1 byte takes 320 us (3.2 ticks). If busy > 25 ticks (2.5 ms), force reset */
            if (++smk_trs_timer > 25u) {
                SMK_UT1_CON0 |= (1u << 13);
                __asm__ volatile("csync" ::: "memory");
                smk_trs_busy = 0;
                smk_trs_timer = 0;
            }
        }
    }

    /* 2. If transmitter ready and ring buffer has data, send next byte */
    if (!smk_trs_busy) {
        uint32_t r = smk_trs_r;
        uint32_t w = smk_trs_w;
        if (r != w) {
            SMK_UT1_CON0 |= (1u << 13);
            SMK_UT1_BUF = smk_trs_ring[r & (SMK_TRS_RING_SIZE - 1u)];
            __asm__ volatile("csync" ::: "memory");
            smk_trs_r = r + 1u;
            smk_trs_busy = 1;
            smk_trs_timer = 0;
        }
    }
}

/* Enqueue a byte to TRS MIDI OUT - 100% Lock-Free & Non-Blocking SPSC Producer */
static inline void smk_trs_tx_byte(uint8_t byte)
{
    uint32_t w = smk_trs_w;
    uint32_t r = smk_trs_r;
    if ((uint32_t)(w - r) < SMK_TRS_RING_SIZE) {
        smk_trs_ring[w & (SMK_TRS_RING_SIZE - 1u)] = byte;
        __asm__ volatile("csync" ::: "memory");
        smk_trs_w = w + 1u;
    }
}
