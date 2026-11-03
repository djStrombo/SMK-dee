# RAM optimization implementation

All changes stay on `experiment/patterns-16x128`, in separate commits.
`f1be889` checkpoints the previously tested pattern-capacity foundation, RAM
savings, global Take Taker pause and investigation. Device limits remain
8 x 64 until the complete 16 x 128 integration is validated.

| Change | State | Evidence / constraint |
| --- | --- | --- |
| Share mutually exclusive FX histories | Implemented | 1,500 B fixed state removed; 1,184 B usable SRAM gained; frozen PCM, full FX tests, Chorus cost/oracle and target budgets pass |
| Compact exact recording skip index | Implemented | 2,560 B fixed pool removed; 2,464 B usable SRAM gained after code alignment; exact arbitrary-query fallback |
| Pack precise notes without changing wire data | Implemented | Nine bytes/event; 896 B additional fixed usable RAM, 1,024 B per full history copy; frozen wire bytes pass |
| Sparse recording/manual undo | Implemented | 9,792 B less per 32-note snapshot; full-density fallback, redo and slot ownership preserved |
| Reduce display canvas | Implemented | 28,832 B usable SRAM gained; exact RGB565 bands, 1,100 image and four rolling-frame comparisons; project scratch retained |
| Stream project/archive staging | Implemented | Wire scratch 27,904 -> 4,104 B; unpublished A/B staging, exact bytes and interrupted-write recovery |
| Allocate USB capture by channel count | Implemented | Stereo keeps fixed 1,024-frame ring; extra two stem channels use 4,096 B arena only when configured; 3,968 B fixed usable gain |
| Compact remaining step history copies | Implemented | 128 B fixed plus 128 B per recording undo allocation; all eight manual levels retained |
| Size audio batch payloads for target pointers | Implemented | 192 B retained SRAM returned; target 148 B payload, host 168 B; all producer assertions pass |
| Balance data/pool placement and final budgets | Implemented | Move 5,376 B pattern payload from ordinary data to POOL; 10,392 B data headroom; no total saving claimed for placement |

FX validation: `build/ram-implementation/fx/`. The actual firmware uses all
19 nightly workflow options. The Chorus cost test uses its prescribed `-O2`
configuration, and all wet-output reference hashes remain unchanged.
No push or flash is part of these commits.

Index validation: `build/ram-implementation/index/`. Target build and budgets,
640,000 randomized scanner comparisons, exhaustive byte-mask comparisons,
alternate overview queries, runtime/scheduler and 16 x 128 capacity fixtures
pass. Dense steady query cost drops from 182 to 126 host instructions; a full
1,024-event rebuild rises from 37,589 to 45,446 (21%). This is bounded edit
maintenance, not a per-sample cost. Combined usable SRAM gain so far: 3,648 B.

Sparse history validation: `build/ram-implementation/sparse/`. Every occupancy
count from 0 through 1,024 round trips with holes and original slot bytes.
Recording undo, manual tools, allocator relocation/failure, capture parity/cost
and target budgets pass. Recording undo also passes ASan/UBSan with the serial
audio path (the batched host harness has a separate existing alignment issue).
Snapshots allocate their packed size immediately; expansion failures leave a
retryable undo and unchanged musical state. Full snapshots cost no bitmap.
Extra resident code/placement costs 448 B of fixed free SRAM; the quiescent
gain with one 32-note history is therefore 9,344 B. The two history handles
remain independent so a later manual undo can precede recording undo.

Note packing validation: `build/ram-implementation/notes-final/` and
`notes-aligned/`. Hot owner/step bytes stay byte aligned, while the compiler
handles odd-stride timing fields. Every 64-owner/128-step identifier and all
duration/rounding/gate bits pass exhaustive edits; 168 FBKK/FUN22 workloads
retain the frozen pre-change wire hash. Prior ten-byte raw runtime snapshots
still import with validation before narrowing. Dense/sparse history, capture
cost and target budgets pass; serial ASan/UBSan passes. The complete host suite
passes (`notes-host.log`, 166 s). Fixed usable SRAM is now 69,776 B, a 4,096 B
gain over the checkpoint build, before any sparse-history savings.

Display validation: `build/ram-implementation/display-final/` and
`display-host.log`. Primary canvas falls from 59,520 to 30,720 B. Logical
layouts replay into bounded RGB565 bands; glyph clips, shared scope snapshots,
DMA ownership, partial wheel coverage, dialogs and FM6 diagram masks retain
their original semantics. Fourteen smaller diff-cache entries use less RAM
than the old nine, avoiding band-driven cache eviction. All 1,100 images and
four rolling frames exactly match the whole-canvas oracle, including its
layout and FM6 graph checks. The target budgets and project/resource/recording
undo checks pass. Host About rendering decodes roughly twice as many glyph
pixels; steady unchanged frames and audio rendering retain their paths.
The largest measured knob redraw sends 199,840 versus 199,296 pixels (0.27%
more); ARP redraw falls from 58,720 to 57,280 pixels. These are host/display
workload measurements, not physical input-latency measurements.
Fixed usable SRAM is now 98,608 B: 32,928 B more than the checkpoint.
The complete rendered UI also passes ASan/UBSan with serial audio enabled
(`display-sanitize.log`); band bounds and the original layout checks remain
active in both reference and candidate runs.

USB validation: `build/ram-implementation/usb-final/` and `usb-host-final.log`.
The complete host suite passes in 167 s. Stereo/four-track PCM16 and PCM24,
clock drift, packet deadlines, reset/replug, volume and muted-master routing
pass. Both mock and real-arena exhaustion preserve running stereo and allow
retry; returning to stereo or disabling capture releases the extra bank.
Stream red zones and ASan/UBSan pass. Allocation happens only during a guarded
main-loop mode change/startup, never inside sample or USB service loops.
Target audio budgets pass; this is not a device cycle measurement.
Fixed usable SRAM is now 102,576 B: 36,896 B more than the checkpoint in stereo
mode. Four-track mode reserves 4,096 B from that arena while configured.

Streaming validation: `build/ram-implementation/stream-final/`,
`stream-host.log`, `stream-sanitize.log` and `stream-profile.log`.
The full host suite passes in 180 s. The target build and budgets pass;
168 generated images match the complete RAM codec byte for byte, including
hash/dirty checks, saved-slot load/rename, legacy ten-byte raw notes and track
removal. Sequential and tail-first staging survive 223 program cutoffs and
391 selected page/header byte cutoffs, seven erase failures, stale publication
and write protection. Serial ASan/UBSan passes. Guarded profiling sessions
retain the full wire buffer and pass RAM-only LIST/GET/runtime restore with
zero erases; normal nightly builds use the smaller buffer.

Normal LIST/runtime restores and project PUT begin/data stage an unpublished
inactive flash copy. This adds flash erases/readbacks, including begin/abort
preflight; only a verified final header replaces a saved object. The current
committed project survives interruption. No per-sample work is added. The
resident build pass also handles lowered memory intrinsics and places libc
entry points at the high end of resident code so implicit compiler calls stay
in range after fixed buffers shrink.

Measured combined fixed resources are 126,016 B (main 119,808; data 5,016;
low 344; retained 848), 60,336 B above the checkpoint. This measured build
also contains concurrent uncommitted live-ARP clock changes in `seq.c`, which
this RAM work does not stage or commit; its code cost is included conservatively.
Optional cache RAM is excluded. Shipping limits remain 8 x 64; the new larger
project schema, capacity UI and complete 16 x 128 integration remain separate.

Remaining history copies use the existing lossless nine-byte step snapshot,
including unused note bytes and rest/tie counts. `history-final/` passes the
target build/budgets, recording undo/redo, manual note tools, sequence entry
and full UI controls. Fixed usable resources rise by 128 B to 126,144 B;
every recording-undo allocation saves another 128 B. Eight manual levels
remain. Validation/packing runs during history maintenance, not per sample.

Audio batch validation: `batch-final/`. FM-1 uses 148-byte descriptors while
64-bit hosts retain 168 bytes. All producer size assertions, dual-core batch
accounting, worst-case engine resources and target budgets pass. Twelve jobs
and their PCM scratch remain unchanged; aligned target jobs save 16 B each,
returning 192 B to the retained SRAM resource bank. No new rendering work.
Combined fixed resources: 126,336 B. Recording undo also passes serial
ASan/UBSan after the compact-step change (`history-sanitize.log`).

## Final measured budget

The final normal nightly target (`ram-final/`) and complete host suite pass
(`final-host.log`: **ALL HOST TESTS PASSED in 173 s**). Resource lifetime,
pattern pool/shared capacity, 16 x 128 recording fixtures, project streaming,
capture parity/cost and batch accounting pass. Target resident-audio closure,
per-region bounds and static CPU budgets pass without changing their limits.
The final firmware source fingerprints match the measured package exactly.

| Guaranteed resource bank | Checkpoint | Final | Change |
| --- | ---: | ---: | ---: |
| Contiguous main arena | 60,416 B | 114,560 B | +54,144 B |
| Ordinary data tail | 3,688 B | 10,392 B | +6,704 B |
| Low SRAM tail | 728 B | 344 B | -384 B |
| Retained SRAM tail | 848 B | 1,040 B | +192 B |
| **Total** | **65,680 B** | **126,336 B** | **+60,656 B** |

These banks are disjoint; allocations never span them. Optional 28,672 B
cache RAM is excluded. Four-track USB capture reserves 4,096 B dynamically;
sparse undo adds occupancy-dependent savings on top of the fixed totals.
A 32-note history now uses 416 B for events/map instead of the nine-byte
layout's 9,216 B full array, an additional 8,800 B saving per history.

Moving the existing 5,376 B ordinary pattern payload into POOL transfers
capacity between banks and leaves the total unchanged. With that placement,
the previously identified 16 x 128 data growth consumes about 7,904 B of the
10,392 B data tail; further UI/schema changes still need their own budget.
This is preparation, not a fully integrated 16 x 128 firmware.

The profiling target also builds and passes its resident/region checks in an
independent output directory (`profile-target/`; 100,848 B guaranteed SRAM).
It retains full wire RAM for guarded sessions; normal `build/` outputs remain
the smaller nightly configuration. Guarded archive tests prove zero erases
while capturing/restoring runtime; serial ASan/UBSan passes streaming and
recording history. These are host and target-build results; no physical audio,
controls, MIDI, display latency or flash timing qualification was performed.
No push or device installation is part of this work.

FM6 table folding and voice flag packing remain deferred because they add
work on sample/voice paths and need device CPU evidence. The saved-settings
copy retains unknown preferences and failure semantics. Removing those
without a validated replacement would trade away existing behavior.

## Optimization-only nightly

Nightly returns to eight patterns per track, 64 steps and 1,024 precise notes.
The capacity experiments are withdrawn independently of the preceding RAM
savings. FBKK/FUN22 and all four A/B project slots retain their normal layout.

The later experimental undo optimization is now independent of capacity:
manual step history has small permanent metadata and a bounded allocation
while used; sound/pattern load history grows to eight levels on demand with
one fixed fallback level. The validated cache bank has no fixed UI partition.
Voice/effect and USB capture requests can retire these disposable histories
before refusing an allocation. Music and active audio state remain intact.
Consumers validate their handles under the audio guard before access.

`tests/undo_memory_test.c` covers eight undo/redo levels without cache RAM,
audio reclamation that overwrites the retired memory, stale history refusal,
editing with no history memory and release on clear. Its ASan/UBSan run and
the complete UI tests pass. Linked final measurements are recorded below.


The final `MELODEE next-21a5f3f` target was built with all 19 nightly flags.
Its source-hash manifest and results are in `build/nightly-optimizations/`.
The independent eight-bank baseline is the same source before demand history;
the sixteen-bank comparison is the prior normal `origin/nightly` configuration.
All values below are linked byte counts before live resource allocations.

| Resource | Optimized eight-bank baseline | Final eight-bank nightly | Prior sixteen-bank nightly |
| --- | ---: | ---: | ---: |
| Main contiguous arena | 114,560 | 125,152 | 108,768 |
| Data SRAM tail | 10,392 | 10,376 | 9,192 |
| Low SRAM tail | 344 | 344 | 344 |
| Retained SRAM tail | 1,040 | 1,040 | 1,040 |
| Guaranteed shared resources | 126,336 | 136,912 | 119,344 |
| Optional validated cache available to shared allocator | 14,336 | 28,672 | 14,336 |
| Maximum shared resources when cache passes | 140,672 | 165,584 | 133,680 |

Compared with the eight-bank baseline, manual-history fixed storage shrinks
from 6,036 to 332 bytes. The resource handle table grows 16 bytes, and linked
resident audio code is 4,900 bytes smaller; the guaranteed total rises by
10,576 bytes. The measured compiler/code-placement difference is included in
the totals, rather than inferring the entire gain from C object sizes.
An additional 14,336 bytes of optional cache is shared instead of permanently
partitioned for UI history. Manual history reserves 5,760 bytes while used;
load history grows only for its used depth, and audio can retire either.

Compared with the prior sixteen-bank nightly, guaranteed resources grow by
17,568 bytes and maximum cache-ready shared resources by 31,904 bytes. The
recorded-note limit stays 1,024; there is no upper-event demand bank or new
saved project format. The primary and alternate display allocations retain
their existing sizes and DMA ownership rules.

Focused ASan/UBSan checks pass for shared undo and its exhaustion/reclamation
paths. The actual final disassembly passes target instruction budgets, and
the build verifies resident audio, CPU1 stacks, SRAM boundaries and flash
limits. No flash, push, or physical audio/control/MIDI validation is included.
The complete host/web/UI/DSP suite with nightly's twelve optimization flags
ends with `ALL HOST TESTS PASSED in 89 s` in
`build/nightly-optimizations/host-verified.log`. Eight-pattern sequencing,
eight-level undo/redo, legacy saved formats and golden audio all pass.

## Delta transfer staging

The secondary display canvas now shuttles dirty rectangles through two
240-pixel DMA tiles: 960 bytes instead of 11,520. Tall deltas are split into
bounded transfers without widening them to full canvas rows. Gathering the
next tile overlaps the preceding transfer; neither tile is overwritten while
DMA reads it. Larger canvas redraws wait before reusing the primary buffer.
The primary remains 30,720 bytes because project save/load shares it and needs
30,116 bytes for the decoded project and bank tail.

The target build returns 10,560 bytes to the contiguous resource arena, now
98,048 bytes; guaranteed resources across all banks total 100,976 bytes before
live allocations. Optional cache RAM is excluded. The complete host suite
passes in 103 seconds. All 1,304 saved UI/rolling images match the unchanged
baseline byte for byte. Added notification tests cover wrapped toasts, queued
short-message replacement and expiration on six screens in both fonts; each
transition restores the same pixels as a full redraw. DMA ownership and exact
delta areas also pass ASan/UBSan. Results are in `build/framebuffer-audit/`.

Smaller transfers add panel-window commands and reduce the canvas sizes that
can draw while a primary transfer runs. Host checks establish pixels and
transfer ownership; physical display/input latency remains unmeasured. No
device installation is included.
