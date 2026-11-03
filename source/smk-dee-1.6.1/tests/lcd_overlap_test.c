/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Kerem Kilic (Ellic Studio) */
/* Real LCD/canvas code against a DMA that remains busy until explicitly
 * waited on. It checks source bytes at completion, catching early reuse. */
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <assert.h>
#define __attribute__(x)
static const void *dma_source;
static uint32_t dma_bytes, dma_waits;
static uint8_t dma_copy[240u*124u*2u];
static uint8_t command, check_delta;
static uint32_t x0, y0, x1, y1, delta_pixels, delta_transfers;
static uint16_t screen[240u * 240u];
static void fm1_lcd_wait(void)
{
    if(dma_source){
        assert(!memcmp(dma_source,dma_copy,dma_bytes));
        if(check_delta && command==0x2C){
            uint32_t w=x1-x0+1u,h=y1-y0+1u;
            assert(x1<240u && y1<240u && dma_bytes==w*h*2u);
            for(uint32_t r=0;r<h;r++)
                memcpy(screen+(y0+r)*240u+x0,dma_copy+r*w*2u,w*2u);
            delta_pixels+=w*h;delta_transfers++;
        }
        dma_source=0;dma_waits++;
    }
}
static void fm1_lcd_deselect(void) {}
static void fm1_lcd_send_cmd(uint8_t c){assert(!dma_source);command=c;}
static void fm1_lcd_send_data(const void *p,uint32_t n)
{
    assert(!dma_source && n<=sizeof dma_copy);dma_source=p;dma_bytes=n;memcpy(dma_copy,p,n);
    if(command==0x2A){assert(n==4);x0=dma_copy[0]*256u+dma_copy[1];x1=dma_copy[2]*256u+dma_copy[3];}
    if(command==0x2B){assert(n==4);y0=dma_copy[0]*256u+dma_copy[1];y1=dma_copy[2]*256u+dma_copy[3];}
}
static void fm1_lcd_hw_init(void) {}
static void fm1_lcd_baud(uint32_t b){(void)b;}
#include "../firmware/src/lcd.c"
#include "../firmware/src/gfx.c"
int main(void)
{
    cv_begin(240,24,RGB(20,30,40));cv_rect(3,3,10,10,RGB(200,50,0));cv_blit(0,0);
    const uint16_t *first=cv_px;uint32_t before=dma_waits;
    cv_begin(55,8,RGB(0,70,0));cv_rect(0,0,20,8,RGB(90,0,90));
    assert(cv_px!=first && dma_waits==before && dma_source==first);
    assert(!memcmp(dma_source,dma_copy,dma_bytes));
    cv_blit(0,24);assert(dma_waits>before);
    before=dma_waits;
    cv_begin(240,124,RGB(10,0,0));assert(cv_px==first && dma_waits==before);
    cv_rect(0,0,240,124,RGB(100,100,100));cv_blit_from(0,24,2);
    assert(dma_source==cv_px+2u*240u);
    before=dma_waits;
    cv_begin(240,124,RGB(0,0,80));assert(dma_waits==before+1u && !dma_source);
    cv_blit(0,24);before=dma_waits;
    cv_begin(240,2,RGB(0,80,0));assert(cv_px!=first && dma_waits==before);
    cv_blit(0,220);lcd_fill(0,0,240,1,RGB(70,0,0));lcd_sync();
    assert(!dma_source);
    cv_begin(240,124,RGB(40,50,60));cv_blit_from(0,24,3);
    before=dma_waits;
    uint32_t *work=cv_work();
    assert((void *)work==(void *)cv_primary && !dma_source && !cv_flight && dma_waits==before+1u);
    memset(work,0xA5,16400u);                 /* decoded project overwrites only after DMA completed */
    cv_begin(240,124,RGB(60,50,40));cv_blit(0,24);
    cv_begin(240,2,RGB(9,81,0));cv_blit(0,220);
    before=dma_waits;work=cv_work();          /* small canvas still on DMA: borrow the other buffer */
    assert(dma_source==cv_alt && dma_waits==before);
    memset(work,0x5A,16400u);lcd_sync();assert(!dma_source);
    /* Tall, narrow deltas must retain their exact area, including the final
     * partial tile. A second delta waits before reusing either staging half. */
    cv_begin(240,64,0);
    for(uint32_t r=0;r<64u;r++)for(uint32_t c=0;c<240u;c++)cv_px[r*240u+c]=(uint16_t)(r*240u+c+1u);
    check_delta=1;
    df_send(0,20,3,17,1,61,DF_N);
    df_send(0,20,37,199,0,64,DF_N);
    assert(dma_source && (dma_source==(void *)cv_alt || dma_source==(void *)(cv_alt+CV_ALT_MAX/2u)));
    /* Gathering finishes with DMA still reading a tile, so primary scratch
     * can already be borrowed without waiting on that independent transfer. */
    before=dma_waits;work=cv_work();assert(dma_waits==before && dma_source);
    memset(work,0x5A,CV_WORK_BYTES);lcd_sync();
    assert(delta_pixels==17u*61u+199u*64u && delta_transfers>2u);
    for(uint32_t r=0;r<240u;r++)for(uint32_t c=0;c<240u;c++){
        uint32_t inside=r>=21u && r<82u && c>=3u && c<20u;
        inside|=r>=20u && r<84u && c>=37u && c<236u;
        assert(screen[r*240u+c]==(inside?(uint16_t)((r-20u)*240u+c+1u):0));
    }
    puts("LCD overlap: drawing overlaps DMA, partial/large/fill transfers preserve their source bytes");
    return 0;
}
