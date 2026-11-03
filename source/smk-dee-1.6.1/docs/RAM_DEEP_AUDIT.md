# Deeper RAM opportunities

18 October 2026. Continuation of [the RAM audit](RAM_AUDIT.md), using the
current uncommitted `experiment/patterns-16x128` sources on `71bf054`.
**Production sources and the tested firmware package were not changed by this
investigation.** Prototypes are isolated under `build/ram-deep-audit/`.

## What is measured

The reference is `build/take-taker-pause/melodee.elf`, with all 19 nightly
options. Every target prototype uses the same options, resident-audio placement
pass and linker checks. Host instruction counts below are native-host counts,
not device cycles or CPU percentages.

| Prototype at current 8 x 64 limits | Fixed objects removed | Additional usable SRAM | Contiguous main arena |
| --- | ---: | ---: | ---: |
| Reference | — | — | 60,416 B |
| Compact recording skip index | 2,560 B | 2,528 B | 62,944 B |
| Shared FX histories | 1,500 B | 1,184 B | 60,448 B |
| Both together | 4,060 B | 3,680 B | 62,944 B |
| Both, preset-bank cache moved to data SRAM | 4,060 B | 3,680 B | 67,232 B |

The last row gains **6,816 bytes in the main arena**, but only **3,680 bytes
overall**. Moving the 4,292-byte bank cache is placement, not another saving.
The data tail falls to 936 bytes. It is useful for current limits but should
not become the final 16 x 128 placement without rebalancing the growing arrays.

The FX layout also changes instruction placement: the low SRAM tail shrinks
by 384 bytes. Combined linker alignment means the independent savings cannot
simply be added. The combined/placed build has 69,360 guaranteed resource
bytes across separate banks, versus 65,680 in the reference. Optional cache
partitions and the 49,152-byte main-arena minimum are unchanged.

## 1. Recording index: a smaller exact answer

`recording.c` currently keeps 128 pitch bits for every step of all four active
patterns: 4,096 bytes now, 8,192 at 128 steps. The sequencer only asks whether
the step's four note positions and eight fixed drum lanes already have timed
notes playing. It does not need to return the complete pitch set.

The prototype stores a 16-bit skip mask and a four-byte note key per cell.
That is six bytes instead of sixteen: **1,536 bytes now, 3,072 at 128 steps**.
The raw saving is **2,560 / 5,120 bytes**, respectively. The note key detects
direct overview edits; event deletion marks dirty cells, insertion updates the
mask, and bank/LEN changes invalidate it. Non-current-step query pointers fall
back to the scanner. No approximate membership test is used.

The independent scanner passes 640,000 pitch queries, all banks/LEN/cells,
20,000 edit iterations, wrapped eligibility, and deletion of 1,024 duplicate
notes. The actual 16 x 128 recording fixture also passes with capture fast
paths enabled. Sanitizers pass the index oracle.

There is a tradeoff:

| Host instructions, 1,024-event bank | Current | Prototype | Change |
| --- | ---: | ---: | ---: |
| Steady step query | 182.3 | 128.3 | about -30% |
| Full cache rebuild | 37,589 | 59,244 | about +58% |
| Single-cell rebuild | 28,408 | 28,772 | about +1% |

Computing masks at rebuild time does more comparisons, then makes steady
queries cheaper. The target build passes static budgets, but its actual dense
switch-boundary deadline still needs device measurement. Prepared banks may
be a suitable place to move rebuild work, provided event/edit generations are
checked and any extra staging memory is counted.

## 2. FX histories: proven exclusivity, partial sharing

Each of fifteen FX slots reserves a 464-byte state, totaling 6,960 bytes.
Filters use all eight biquad sections. ECHO/ROOM/REVERB need the first two
sections for input TONE, but not the other six. Their delay positions, spans,
gains, comb positions and input/DC histories can occupy that unused tail.

The prototype reduces each state to **364 bytes**, or **5,460 bytes total**.
Type changes already fade the old effect out and zero the state before the
new type starts, so this needs no new lifetime transition or sample-loop
compression. Track inserts and the shared buses still have separate slots.

Not all fields can be overlaid. In particular, the filter decimator already
uses `rev_damp`, the first two `rev_bass` entries, and the output interpolation
fields. Keeping those separate avoids a tempting but incorrect larger union.
The first two biquads must also survive alongside the reverb tank state.

The prototype matches all PCM hashes for **250 two-second settings cases**
(about 22 million samples), and passes the existing FX routing, tails,
transitions, TONE, exhaustion/recovery and UI tests. Target resident-audio and
static instruction budgets pass. Host ASan/UBSan passes the FX tests with
serial batch rendering. The ordinary host harness strips alignment attributes;
its 64-bit batch descriptors trigger unrelated alignment reports when batched
sanitizer rendering is used, so that run is not claimed as a sanitizer pass.

## 3. Display: the largest opportunity, with new evidence

The main RGB565 canvas is 59,520 bytes; the secondary canvas adds 11,520.
The main canvas already doubles as decoded-project scratch, so that project
memory must not be counted again as a separate removable allocation.

An instrumented run of the real UI renderer observed **316,942 canvas begins**,
67 different shapes, 265 screens across eight palettes plus the page/value
sweeps, and the existing font/diagram/layout checks. It completed with zero
layout findings and zero MONO violations. Examples:

| Canvas | Bytes now | Largest observed color count |
| --- | ---: | ---: |
| 240 x 124 | 59,520 | 34 |
| 236 x 126 | 59,472 | 49 |
| 236 x 124 | 58,528 | **89** |
| 160 x 172 | 55,040 | 48 |

**An indexed canvas is worth prototyping.** Eight-bit pixel indices would
occupy 29,760 bytes. A 256-entry RGB565 palette adds 512 bytes; a bounded
lookup dictionary might add another 2,048. This example leaves **27,200 bytes**
of raw saving while keeping the existing secondary buffer for RGB565 scanout.
The indexed canvas remains large enough for current decoded-project scratch.

This is a design estimate, not a verified saving. The observed maximum of 89
colors is not a proof that every live waveform, overlay and future drawing
stays below 256. A safe overflow strategy or a proven color bound is required.
Simply truncating colors or failing to draw is not acceptable. Palette lookup,
anti-alias blending, diff hashing and expansion into LCD DMA strips also need
performance measurements. Plain fills can map their color once rather than
searching the palette for every pixel.

**Strip rendering remains the other route.** A 240 x 64 RGB565 workspace would
save exactly **28,800 bytes** from the primary buffer. There were 29,045 draws
larger than that area, including non-240-wide canvases; changing one height
constant cannot implement this. Logical clipping, rounded panels, text,
diff/damage tracking and DMA lifetimes all need to remain correct.

Decoded `project_t` currently needs **16,456 bytes** of the shared canvas, and
its active steps alone add 2,816 at 128 steps. A 24- or 32-row full-width
workspace would be too small for the existing project borrow. A 64-row one
can accommodate both extents. Shared-scratch clients impose a floor as well
as the renderer itself.

## 4. Undo: large common-case savings, not a dense-case guarantee

The linked fixed-object list misses allocations acquired from the engine
arena. Target LLVM layouts show:

| Runtime allocation | Bytes at 64 steps | Reason |
| --- | ---: | --- |
| Recording take undo | 11,228 | 1,024 note slots, selected steps, motion and metadata |
| Manual note transaction | 11,224 | Another full note store, steps, motion and metadata |

An empty or sparse take still acquires the full recording-undo allocation.
Most saved entries are zero when only a few notes belong to that bank. An
occupancy bitmap plus densely stored notes could avoid almost 10 KiB for a
32-note snapshot. A dense fallback must retain all 1,024 notes. Redo can need
more storage than undo, so resizing/admission must happen before publication;
the present allocator clears newly allocated blocks and does not provide a
preserving resize operation. This is a real implementation task, not a change
to one allocation length.

The two undo owners cannot simply alias. A stopped manual edit may need to
undo back to the last take before the recording undo becomes usable again.
Both snapshots can be needed for that history chain. Releasing an invalidated
recording snapshot at the first edit would lose that behavior.

Smaller independent opportunities include using existing nine-byte snapshots
for `step_history.live` and recording-undo steps: 128 bytes each now, 256 each
at 128 steps. This preserves eight manual levels; it does not solve the whole
growth problem. Eight sound/load undo levels grow from 12,896 to 17,504 bytes
at 128 steps and exceed their 14,336-byte cache partition. The current
cache-failure fallback has one SRAM level; shrinking the logical normal depth
is not a substitute for addressing the larger layout.

## 5. Precise notes can fit in nine bytes

The current timed event is ten bytes. With 64 owners and 128 steps, its valid
fields require only **71 bits**: 16 onset, 16 duration, 7 note, 7 velocity,
6 owner, 7 actual step, 6 signed-pitch encoding, 3 duration exponent, and
three gate/round/wrap flags.

A structure of arrays with aligned 16-bit onset/duration arrays and five
metadata bytes per event would occupy **9,216 bytes**, saving **1,024 bytes**
from the main 1,024-event store without unaligned halfword loads. Full undo
copies can benefit too. This is a packing bound, not a tested codec.

It requires accessor-based mutation beyond the owner/step accessors already
added, malformed-input validation, legacy wire conversion, and onset/capture
cost measurements. Do not change the existing disk record or reinterpret old
raw bytes as this new runtime layout. Bank-grouped eight-byte wire events
already omit ownership; copying that wire size into the unordered runtime
store would lose the owner information.

## 6. Other allocations and tradeoffs

- **Project transfer staging: 27,904 bytes.** Streaming into a checked flash
  staging copy could replace most of this with a small transfer/validation
  buffer. A 4,096-byte staging buffer would represent 23,808 bytes of raw
  reduction, before metadata. Upload/backup state survives many UI frames, so
  it cannot borrow the drawing canvas. Complete validation before publishing,
  four saved slots, failed-write recovery and flash capacity still apply.
- **USB audio: 12,360 bytes.** Default stereo capture only uses half of the
  8,192-byte maximum-channel capture ring. Allocating for the active channel
  count could return 4,096 bytes in stereo mode, more with USB audio disabled.
  Four-stem capture needs it back. This is conditional headroom, not a smaller
  guaranteed worst case. The audio owner must grant memory before streaming;
  USB service cannot independently mutate its arena. Halving the ring would
  save 6,144 bytes but also halves buffering/jitter tolerance, so it is not an
  equivalent unqualified replacement.
- **Audio batch descriptors.** The target's largest payload is 148 bytes,
  whereas the shared limit reserves 168 to accommodate the 64-bit host.
  A target-specific bound could save 16 bytes in each aligned job, **192
  bytes** total. Keep all producer assertions and host alignment intact.
- **Mirrored FM6 log tables.** Folding MKI and OPL indices could save 2,560
  bytes. This adds operations per operator/sample; it needs exact DSP parity
  and device CPU evidence. Existing FM6 mono and silent-voice state also
  carries retrigger/portamento history and is not disposable merely because
  one voice is audible.
- **Saved settings copy: 604 bytes.** Reading the canonical saved settings
  when committing/comparing could reduce the permanent duplicate, at the cost
  of foreground flash IO. Unknown preference bytes, save-failure behavior and
  editor verification must survive. Runtime favorites and saved favorites
  currently distinguish pending edits from committed state.
- **Small padding/flags.** Voice fields total 77 bytes before alignment; their
  current 80-byte layout cannot be reduced by reordering alone. Bit-packing
  bounded flags might save 256 bytes across 64 slots, with access costs on hot
  paths. Keep this behind the larger opportunities.

## The separate data-region limit matters

Identified ordinary data allocations alone grow by at least **10,208 bytes**
when enabling 16 x 128 with the current shared-pool design:

| Allocation | Additional bytes |
| --- | ---: |
| Four active step arrays | 2,816 |
| Four staging step arrays | 2,816 |
| Bank/block directory | 1,536 |
| Additional chunk payload | 2,304 |
| Additional chunk links | 288 |
| Bank timings | 256 |
| Recording heads and bank counts | 128 |
| Recording watch/dirty words | 64 |

The reference data tail is only 3,688 bytes, independently of the main arena.
For example, putting the larger 7,680-byte ordinary chunk payload in the pool
would reduce that region's calculated growth by 7,680 bytes, while charging
the same bytes to the pool. That is necessary placement work, not a RAM saving.
The FX reduction helps this limit. Moving the preset bank into data SRAM helps
the current contiguous arena but competes with the future larger arrays.
Final placement must be evaluated on a fully integrated build, not by adding
all free tails together.

## Recommendation and evidence limits

The compact skip index and FX layout are the smallest tested next candidates;
qualify dense rebuild timing before adoption. For enough margin to integrate
16 x 128 comfortably, prototype the display representation and sparse undo,
and design streaming alongside the new project schema. Keep separate budgets
for ordinary data, contiguous audio space and the undo cache.

The isolated candidates pass target build/resident checks and static budgets.
They have focused host parity/sanitizer evidence, **not a complete host suite
or device timing qualification**. No working firmware changes, commit, push,
package installation or physical audition occurred during this investigation.

Local reproduction artifacts are in `build/ram-deep-audit/`: source snapshots,
`target-layouts.json`, per-candidate ELF/disassembly and RAM comparison JSON,
`index*.log`, `fx*.log`, and `canvas.csv` / `canvas_probe.c`. The ordinary
firmware remains the full-suite-tested `build/take-taker-pause/` snapshot.
