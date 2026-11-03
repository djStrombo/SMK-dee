/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Kerem Kilic (Ellic Studio)
 * Portions Copyright (C) 2026 Leo Kuroshita (@kurogedelic), Hügelton Instruments */
/* DSP input fixture, not an application insert path. Exercises shared kernels
 * with historical mono/spread input and pan to retain their PCM oracles. */
static __attribute__((noinline,section(".dsp_text"))) void fx_pan(track_t *t,int32_t *b,uint32_t n)
{
    if(!spread_on){
        for(uint32_t i=0;i<n;i++)fx_left[i]=fx_right[i]=clamp(b[i],-65536,65536);
        return;
    }
    int32_t pan=0,s=spread_on?(t->p[P_SPRD]+1)>>1:0;
    int32_t pa=clamp(pan-s,-64,63),pb=clamp(pan+s,-64,63);
    int32_t gla=4096-(pa>0?pa*64:0),gra=4096+(pa<0?pa*64:0),glb=4096-(pb>0?pb*64:0),grb=4096+(pb<0?pb*64:0);
    for(uint32_t i=0;i<n;i++){
        int32_t a=spread_on?spread_buf[i]:fx_div_pow2(b[i],1),c=b[i]-a;
        a=clamp(a,-262143,262143);c=clamp(c,-262143,262143);
        fx_left[i]=clamp(fx_div_pow2(a*gla+c*glb,12),-65536,65536);fx_right[i]=clamp(fx_div_pow2(a*gra+c*grb,12),-65536,65536);
    }
}
/* Position the finished track once. A mono engine stays mono through its
 * filter chain even when PAN is slightly off centre; stereo effects and
 * genuine engine spread retain their independent channels and tails. */
static __attribute__((noinline,section(".audio_text"))) void fx_post_pan(track_t *t,uint32_t n)
{
    int32_t pan=t->p[P_PAN];if(!pan)return;
    int32_t gl=4096-(pan>0?pan*64:0),gr=4096+(pan<0?pan*64:0);
    for(uint32_t i=0;i<n;i++){
        fx_left[i]=fx_scale(fx_left[i],(uint32_t)gl*16u);fx_right[i]=fx_scale(fx_right[i],(uint32_t)gr*16u);
    }
}
static int fx_kernel_process(track_t *t,int32_t *b,uint32_t n)
{
    int active=0;fx_pan(t,b,n);
    for(uint32_t slot=0;slot<FX_SLOTS;slot++){
        song.g[G_MFXTONE+slot]=t->p[P_FXTONE+slot];
        fx_plan_t plan;uint32_t fresh=fx_state[slot].epoch!=fx_epoch || fx_state[slot].type!=t->p[P_FXTYPE+slot*FX_PARAMS];
        fx_slot_prepare(&plan,slot,t->p+P_FXTYPE+slot*FX_PARAMS);
        if(plan.active){plan.shared=0;plan.third=t->p[P_FXTONE+slot];if(fresh)plan.f->rng=(int32_t)(0x73a9825du+slot*997u);} /* historical DSP oracle; real sends are tested separately */
        active|=fx_slot_run(&plan,n);
    }
    fx_post_pan(t,n);return active;
}
