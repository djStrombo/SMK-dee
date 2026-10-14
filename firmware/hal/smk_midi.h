/* SPDX-License-Identifier: GPL-3.0-only
 * M-VAVE SMK-37 Hardware MIDI Subsystem
 * TRS MIDI OUT (UART1 on PC7) + Unified Output Router (TRS & USB)
 * Supports 24 PPQN MIDI Clock, Start/Stop transport, and Multitrack Channel Routing.
 */
#pragma once
#include <stdint.h>

/* SMK-37 UART1 Hardware Registers (JieLi AC791N / WL82) */
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

/* Ring buffer for non-blocking TRS MIDI OUT transmission (shared across all C files) */
#define SMK_TRS_RING_SIZE 64u
volatile uint8_t  smk_trs_ring[SMK_TRS_RING_SIZE] __attribute__((weak, section(".bss")));
volatile uint32_t smk_trs_w __attribute__((weak, section(".bss")));
volatile uint32_t smk_trs_r __attribute__((weak, section(".bss")));
volatile uint8_t  smk_trs_busy __attribute__((weak, section(".bss")));
volatile uint8_t  smk_trs_inited __attribute__((weak, section(".bss")));

/* Drain pending bytes from ring buffer into UART1 TX FIFO (called from 10 kHz TIMER5 ISR) */
static inline void smk_trs_poll(void)
{
    /* 1. If currently transmitting, check if completed (bit 15 = 1) */
    if (smk_trs_busy) {
        if (SMK_UT1_CON0 & (1u << 15)) {
            SMK_UT1_CON0 |= (1u << 13); /* Clear TPND (transmission pending) */
            smk_trs_busy = 0;
        }
    }

    /* 2. If transmitter ready and ring buffer has data, send next byte */
    if (!smk_trs_busy && (smk_trs_r != smk_trs_w)) {
        SMK_UT1_BUF = smk_trs_ring[smk_trs_r & (SMK_TRS_RING_SIZE - 1u)];
        smk_trs_r++;
        smk_trs_busy = 1;
    }
}

/* Initialize UART1 hardware transmitter on pin PC7 */
static inline void smk_trs_midi_init(void)
{
    /* 1. Enable PLL48M clock for UART peripheral in CLK_CON1 */
    SMK_CLK_CON1 = (SMK_CLK_CON1 & ~(3u << 10)) | (1u << 10);

    /* 2. Route UART1 TX to PC7 via JieLi Crossbar IO Mapping (IOMAP_CON3 bits [23:20] = 1) */
    SMK_IOMAP_CON3 = (SMK_IOMAP_CON3 & ~0xF00000u) | 0x100000u;

    /* 3. Configure PC7 pin: Output, High Drive, Pull-Up, Digital Enable, Idle HIGH (MIDI standard) */
    SMK_PORTC_OUT |=  (1u << 7);    /* Output level High (MIDI idle is high) */
    SMK_PORTC_DIR &= ~(1u << 7);    /* Output (0 = out) */
    SMK_PORTC_DIE |=  (1u << 7);    /* Digital output/input enable */
    SMK_PORTC_PU  |=  (1u << 7);    /* Pull-up enabled */
    SMK_PORTC_PD  &= ~(1u << 7);    /* Pull-down disabled */
    SMK_PORTC_HD  |=  (1u << 7);    /* High drive strength */

    /* 4. Initialize UART1 for MIDI standard 31250 baud (48 MHz / (31250 * 4) - 1 = 383) */
    SMK_UT1_CON0 = 0x3400u;          /* Reset UART1, clear pendings */
    SMK_UT1_CON1 = 0;
    SMK_UT1_BAUD = 48000000u / 31250u / 4u - 1u;  /* 383 */
    SMK_UT1_OTCNT = 60000u;
    __asm__ volatile("csync" ::: "memory");
    SMK_UT1_CON0 = 0x370au;          /* Enable UART1, TX enable, clear pendings */
    __asm__ volatile("csync" ::: "memory");

    smk_trs_busy = 0;
    smk_trs_inited = 1;
}

/* Enqueue a byte to TRS MIDI OUT */
static inline void smk_trs_tx_byte(uint8_t byte)
{
    if (!smk_trs_inited) {
        smk_trs_midi_init();
    }
    uint32_t next = smk_trs_w + 1u;
    if (next - smk_trs_r >= SMK_TRS_RING_SIZE) {
        /* Buffer is full: drain at least one byte synchronously */
        uint32_t timeout = 50000u;
        while (smk_trs_busy && !(SMK_UT1_CON0 & (1u << 15)) && --timeout);
        smk_trs_poll();
    }
    smk_trs_ring[smk_trs_w & (SMK_TRS_RING_SIZE - 1u)] = byte;
    smk_trs_w = next;
    smk_trs_poll();
}
