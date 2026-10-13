/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Leo Kuroshita (@kurogedelic), Hügelton Instruments */
/* Dry mixer: engine output -> track level/pan -> master. DC blocking and
 * bounded output limiting protect the DAC; there are no effects or sends. */
static volatile uint32_t kb_mask;
#if BOARD_SMK37
static volatile uint64_t kb_layer;
#else
static volatile uint32_t kb_layer;
#endif
static volatile uint8_t kb_lock;
#define LIM_T 18000
static int32_t lim_env = LIM_T;
static int32_t dc_l, dc_r, dce_l, dce_r;
static inline __attribute__((always_inline)) int32_t output_clip(int32_t x)
{
    int32_t a = x < 0 ? -x : x, i = a >> 8, y;
    if (i >= 256) y = TANH_Q15[256];
    else y = TANH_Q15[i] + (((TANH_Q15[i + 1] - TANH_Q15[i]) * (a & 255)) >> 8);
    return x < 0 ? -y : y;
}

/* DC blocker (~2 Hz), always on: a leaky integrator of the input (Q6 state) subtracted from it.
 * The >> 12 step keeps its remainder (error feedback, 0..4095) and adds it to the next one, so no
 * part of the step is lost: the state follows the input exactly, down to 0 after the sound stops.
 * (A rounded step of (x - dc) / 4096 would stop moving at |x - dc| < 2048 and leave an offset of up
 * to +-31 at the output after silence.) */
static inline __attribute__((always_inline)) int32_t dc_block(int32_t x, int32_t *dc, int32_t *err)
{
    int32_t e = x * 64 - *dc + *err, d = e >> 12;
    *err = e - d * 4096;
    *dc += d;
    return x - ((*dc + 32) >> 6);
}

static __attribute__((noinline,section(".dsp_text"))) void master_out(int32_t *l, int32_t *r)
{
    int32_t al, ar, a;
    *l = dc_block(*l, &dc_l, &dce_l);
    *r = dc_block(*r, &dc_r, &dce_r);
    
    al = *l < 0 ? -*l : *l;
    ar = *r < 0 ? -*r : *r;
    a = al > ar ? al : ar;
    if (a > lim_env)
        lim_env += (a - lim_env) >> 2;
    else if (lim_env > LIM_T)
        lim_env -= ((lim_env - LIM_T) >> 12) + 1;
    if (lim_env > LIM_T) {
        int32_t g = (int32_t)(((uint32_t)LIM_T << 15) / (uint32_t)lim_env);   /* < 32768 */
        *l = ((*l >> 4) * g) >> 11;                      /* >> 4 first: |l| may be far above Q15 */
        *r = ((*r >> 4) * g) >> 11;
    }
    *l = output_clip(*l);
    *r = output_clip(*r);
}

/* length of one division (N_DIV order) in samples at the song tempo */
static const uint8_t DIV_DEN[6] = {1, 2, 4, 8, 3, 6};    /* original IDs stay fixed; slow rates append */
static uint8_t midi_sync_active;                 /* armed by an incoming Start/Continue/Stop, never a clock pulse */
static uint32_t midi_beat_samples;                    /* zero until an external clock has a measured tempo */
static uint32_t beat_samples(void)
{
    return midi_sync_active && midi_beat_samples ? midi_beat_samples : (uint32_t)FS * 60u / (uint32_t)song.g[G_BPM];
}
static uint32_t div_samples(uint32_t div)
{
    uint32_t quarter = beat_samples();
    return div < 6u ? quarter / DIV_DEN[div] : div < 10u ? quarter << (div - 5u) : quarter / DIV_DEN[div % 6u];
}

/* External sequencing uses musical units, independent of the measured tempo.
 * 24 clocks/beat and every division divide exactly; tempo estimates only set
 * LFO timing and the display, never move an already recorded step. */
#define MIDI_BEAT_UNITS 24576u
static uint32_t seq_beat_samples(void)
{
    return midi_sync_active ? MIDI_BEAT_UNITS : beat_samples();
}
static uint32_t seq_div_samples(uint32_t div)
{
    uint32_t quarter = seq_beat_samples();
    return div < 6u ? quarter / DIV_DEN[div] : div < 10u ? quarter << (div - 5u) : quarter / DIV_DEN[div % 6u];
}


static void events_block(uint32_t n);
static int32_t part_buf[CTL], mix_l[CTL], mix_r[CTL];
#if MELODEE_USB_AUDIO
static int ua_capture_active(void);
static uint8_t track_capture_on;
static int32_t track_capture[CTL * NTRK];
#endif

typedef struct {
    int16_t level, pan;
    uint8_t valid;
    int32_t lvl, gl, gr;
} mix_cache_t;
static mix_cache_t mix_cache[NTRK];
static __attribute__((noinline)) void mix_cache_update(const track_t *t, mix_cache_t *mc)
{
    mc->level=t->p[P_LEVEL];mc->pan=t->p[P_PAN];mc->valid=1;
    mc->lvl=LEVEL_Q12[mc->level & 127];
    mc->gl=4096-(mc->pan>0?mc->pan*64:0);mc->gr=4096+(mc->pan<0?mc->pan*64:0);
}
static __attribute__((noinline)) void mix_spread(track_t *t, int32_t *b, uint32_t n)
{
    int32_t *d=spread_buf;
    int32_t lvl=LEVEL_Q12[t->p[P_LEVEL] & 127],pan=t->p[P_PAN],s=(t->p[P_SPRD]+1)>>1;
    int32_t pa=clamp(pan-s,-64,63),pb=clamp(pan+s,-64,63);
    int32_t gla=4096-(pa>0?pa*64:0),gra=4096+(pa<0?pa*64:0);
    int32_t glb=4096-(pb>0?pb*64:0),grb=4096+(pb<0?pb*64:0);
    int32_t glm=(gla+glb)>>1,grm=(gra+grb)>>1,gld=(gla-glb)>>1,grd=(gra-grb)>>1,pk=t->peak;
    for(uint32_t i=0;i<n;i++){
        int32_t x=clamp(((clamp(b[i],-884000,884000)>>2)*lvl)>>10,-524287,524287);
        int32_t y=clamp(((clamp((d[i]<<1)-b[i],-884000,884000)>>2)*lvl)>>10,-524287,524287);
        int32_t a=x<0?-x:x;
#if MELODEE_USB_AUDIO
        if(track_capture_on)track_capture[i*NTRK+(uint32_t)(t-trk)]=x;
#endif
        if(a>pk)pk=a;
        mix_l[i]+=((x*glm)>>12)+((y*gld)>>12);
        mix_r[i]+=((x*grm)>>12)+((y*grd)>>12);
    }
    t->peak=pk;
}
static inline __attribute__((always_inline)) int32_t mix_clamp(int32_t x,int32_t lo,int32_t hi)
{ return x<lo?lo:x>hi?hi:x; }
static __attribute__((noinline,section(".dsp_text"))) void mix_mono_samples(track_t *t,int32_t *b,uint32_t n,const mix_cache_t *mc)
{
    uint32_t ti=(uint32_t)(t-trk);
    int32_t lvl=mc->lvl,gl=mc->gl,gr=mc->gr,pk=t->peak;
    for(uint32_t i=0;i<n;i++){
        int32_t x=mix_clamp(((mix_clamp(b[i],-884000,884000)>>2)*lvl)>>10,-524287,524287),a=x<0?-x:x;
#if MELODEE_USB_AUDIO
        if(track_capture_on)track_capture[i*NTRK+ti]=x;
#endif
        if(a>pk)pk=a;
        mix_l[i]+=(x*gl)>>12;mix_r[i]+=(x*gr)>>12;
    }
    t->peak=pk;
}
static int32_t solo_gain[NPART]={32768,32768,32768,32768};
static void mix_solo(track_t *t,int32_t *b,uint32_t n)
{
    uint32_t ti=(uint32_t)(t-trk);
    int32_t from=solo_gain[ti],to=!track_solo || ((track_solo>>ti)&1u)?32768:0;
    if(from==32768 && to==32768)return;
    for(uint32_t i=0;i<n;i++){
        from += clamp(to-from,-256,256); /* 128 samples, same GLO solo ramp as before */
        b[i]=mulq16(b[i],(uint32_t)from<<1);
        if(spread_on)spread_buf[i]=mulq16(spread_buf[i],(uint32_t)from<<1);
    }
    solo_gain[ti]=from;
}
static void mix_part(track_t *t,uint32_t n)
{
    mod_begin(t);
    spread_on=t->p[P_SPRD]>0 && (trk_vmode(t)==V_POLY || trk_vmode(t)==V_UNISON);
    if(track_render_audio(t,part_buf,n,0)){
        mix_solo(t,part_buf,n);
        if(spread_on)mix_spread(t,part_buf,n);
        else{
            mix_cache_t *mc=&mix_cache[(uint32_t)(t-trk)];
            if(!mc->valid || mc->level!=t->p[P_LEVEL] || mc->pan!=t->p[P_PAN])mix_cache_update(t,mc);
            void (*volatile mix)(track_t *,int32_t *,uint32_t,const mix_cache_t *)=mix_mono_samples;
            mix(t,part_buf,n,mc);
        }
    }
    if(mod.on)mod_end(t);
}
static __attribute__((noinline,section(".dsp_text"))) void master_samples(int32_t *out,uint32_t n)
{
    for(uint32_t i=0;i<n;i++){
        int32_t l=((mix_l[i]>>2)*(int32_t)song.master_q12)>>10;
        int32_t r=((mix_r[i]>>2)*(int32_t)song.master_q12)>>10;
        master_out(&l,&r);out[2u*i]=l;out[2u*i+1u]=r;
    }
}
static void mix_block(int32_t *out,uint32_t n)
{
#if MELODEE_USB_AUDIO
    track_capture_on=(uint8_t)ua_capture_active();
    if(track_capture_on)memset(track_capture,0,n*NTRK*sizeof *track_capture);
#endif
    memset(mix_l,0,n*sizeof *mix_l);memset(mix_r,0,n*sizeof *mix_r);
    events_block(n);
    for(uint32_t i=0;i<NPART;i++)mix_part(&trk[i],n);
    void (*volatile run)(int32_t *,uint32_t)=master_samples;
    run(out,n);
}
