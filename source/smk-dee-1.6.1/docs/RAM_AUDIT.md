# RAM audit for the 16-pattern / 128-step work

18 October 2026, `experiment/patterns-16x128`, based on `71bf054` plus the
uncommitted capacity foundation. These measurements compare fresh builds
before and after the RAM changes with the same 19 nightly workflow options.
The device configuration remains **8 patterns per track and 64 steps**.

The subsequent [deeper audit](RAM_DEEP_AUDIT.md) adds isolated target prototypes,
recording-index CPU comparisons, dynamic undo sizes, display color/shape
measurements, and the separate data-region growth budget. Those experiments
are not applied to the production sources measured below.

## Implemented savings

| Allocation | Before | After | Saved |
| --- | ---: | ---: | ---: |
| Recording capture counters / playback deadlines | 8,192 B | 4,096 B | 4,096 B |
| Track/voice state, excluding retired VOICE/NOISE tail | 10,272 B | 9,760 B | 512 B |
| Dedicated editor backup transfer buffer | 512 B | 0 B | 512 B |
| Preset index, including new bank-readiness bitmap | 5,376 B | 4,996 B | 380 B |
| **Fixed object savings** | | | **5,500 B** |

The recording runtime now uses one word per note for either its held capture
duration or its queued release deadline. A held event cannot play from that
same slot. Recapture cancels any old sounding release before starting the new
duration, and sealing a capture stores the duration in the persistent event
before the runtime word becomes reusable. Sounding ownership uses the existing
message flag, so an old nonzero duration does not create a phantom release.
The independent scanner/countdown comparison builds keep their separate words.
There is no new allocation, compression or copying in the audio tick.

Current engines need voice state slots 0 through 5. Only the retired VOICE and
NOISE engines need slots 6 and 7. Their eight-byte tail was still reserved for
all 64 voice slots. Normal builds omit it; legacy comparison builds retain it.
Engine IDs, stored presets and current sound algorithms remain unchanged.

The editor's sample-named 512-byte buffer was actually used for backup chunks,
which are bounded to 256 bytes. Backup decoding and range reads now borrow the
existing main-loop scratch union synchronously. The reply is packed into its
separate output buffer before transmission. This scratch is never borrowed by
an ISR, CPU1 or DMA; the storage page-write scratch does not overlap these
operations. There is no remaining sample-upload feature behind this buffer.

Preset readiness is tracked once per bank rather than once per slot. Three
flags and the bounded engine ID share a byte. All twelve name bytes, favorite
and old-format state, and browsing without flash reads are preserved.

## Linked result

| Measure | Before | After | Change |
| --- | ---: | ---: | ---: |
| Data-region occupancy, including alignment | 96,024 B | 94,616 B | -1,408 B |
| Fixed pool occupancy | 162,112 B | 158,008 B | -4,104 B |
| Resident audio code | 117,472 B | 117,424 B | -48 B |
| **Contiguous main audio arena** | **56,288 B** | **60,416 B** | **+4,128 B** |
| Main arena minimum | 49,152 B | 49,152 B | unchanged |
| Low SRAM tail | 728 B | 728 B | unchanged |
| Data SRAM tail | 2,280 B | 3,688 B | +1,408 B |
| Retained SRAM tail | 848 B | 848 B | unchanged |
| **Total guaranteed SRAM resources** | **60,144 B** | **65,680 B** | **+5,536 B** |
| Optional cache RAM, all partitions | 28,672 B | 28,672 B | unchanged |
| Image including stub | 534,736 B | 534,692 B | -44 B |

The fixed-object reduction, smaller resident code and linker alignment explain
the difference between 5,500 bytes removed and 5,536 bytes made usable. Moving
the 4,104-byte FM6 receive buffer from the pool into the freed data space makes
most of the savings available in the main arena. That move is placement, not
an additional 4,104-byte saving. The receive buffer remains independent because
USB interrupt accumulation can overlap main-loop work.

The main arena now has **11,264 bytes above its existing minimum**, up from
7,136 bytes. Separate SRAM tails and optional cache cannot be counted as one
contiguous engine allocation. This gain alone does not establish that a fully
integrated 16 x 128 device build fits, or prove additional polyphony.

The first audit snapshot, before the requested global Take Taker pause,
reclaimed 5,568 bytes in total and 4,160 bytes in the main arena. Adding the
pause logic uses 32 bytes of that main-arena gain after code/alignment changes;
all fixed-object reductions remain intact. The table above is the later build.

## Take Taker and live recording

Take Taker's rolling `cap_ev` store occupies **1,024 bytes**, not another copy
of the 10,240-byte timed-note store. The timed-note store contains saved takes
across pattern banks and is required for playback even while Take Taker is
collecting. Removing it during capture would discard existing music.

The live-recording queue starts at a loop boundary per track. Following the
user's subsequent choice, Take Taker now pauses collection globally when the
first take punches in, and resumes when the last active take finishes. Queued
takes do not pause collection before their boundary. Latched recording keeps
collection paused across loops, and applying a capture is refused while any
track records. Releases still close retained notes from before the pause.

The implemented per-note timer sharing recovers four times the rolling
capture-buffer size. Globally pausing Take Taker does not provide a further
1,024-byte saving by itself: the remaining recorder runtime and event arrays
also serve playback during ordinary jams, so the ring cannot safely overwrite
them. Its pre-pause history is retained. A future shared allocation requires
another proven exclusive owner, rather than discarding saved playback events.

## Largest remaining allocations

These are actual linked object sizes after the changes, not estimates of
reclaimable memory. Some components below have existing shared lifetimes.

| Object | Bytes | Purpose / constraint |
| --- | ---: | --- |
| `cv_primary_u` | 59,520 | Main display canvas, also borrowed for synchronous work |
| `proj_wire_u` | 27,904 | Project/archive staging retained across transfer frames |
| `ua` | 12,360 | Active USB audio rings and state |
| `cv_alt` | 11,520 | Secondary display/DMA overlap storage |
| `pattern_chunks_retained` | 10,752 | Part of the existing shared pattern budget |
| `recording` | 10,240 | Up to 1,024 precise timed notes, required for playback |
| `trk` | 9,760 | Four tracks, voices and active patterns |
| `cpu1_stacks` | 8,192 | CPU1 stacks; reduction requires watermark evidence |
| `fx_state` | 6,960 | Current effects |
| `step_history` | 6,180 | Eight levels of step editing history and live state |
| `pattern_chunks_ram` | 5,376 | Remaining existing shared pattern payload |
| `up_meta` | 4,992 | Preset index with cached names |
| `bank_buf` | 4,292 | Shared preset-bank cache |
| `fm6_rx` | 4,104 | Asynchronous native MIDI dump receive buffer |
| `recording_pitch` | 4,096 | Active recording pitch lookup cache; grows at 128 steps |

Retired engine sources mostly disappear through build selection and linker
garbage collection; their compatibility IDs and parsing code do not imply
large resident allocations. Current FM6, CZ and Prophet state is allocated
when needed. Removing their compatibility code is not a RAM optimization.

## Next opportunities, in order

1. **Display strips or tiles.** A 64-row working canvas could save roughly
   28,800 bytes from the main canvas. Current drawings can be 124 rows high, so
   lowering the allocation alone would corrupt memory. This requires clipped
   rendering, transfer scheduling and unchanged UI/hash verification. CPU and
   transfer costs must be measured. No saving is claimed yet.
2. **Compact project staging and streaming.** The 27,904-byte wire image is a
   large target, especially because the 16 x 128 format already needs a new
   schema. Upload and backup hold this image across frames while decoded
   project work borrows the display canvas. Blindly overlaying them corrupts
   transactions. Preserve compatibility, complete-import admission and
   power-loss behavior before claiming a saving.
3. **Bound the growing caches and undo representation.** The recording pitch
   cache doubles to 8,192 bytes at 128 steps; a lazy or bounded representation
   could avoid that growth, with dense-recording CPU validation. Preserve all
   eight undo levels and the lossless nine-byte step representation. These
   are integration work, not permission to remove history.
4. **Fold mirrored FM6 lookup tables.** Keeping half of the MKI and OPL log
   tables could save 2,560 bytes, at the cost of extra index operations for
   every operator/sample in those sound models. Exact state/PCM comparisons
   and target CPU measurements are required. These are current sound models,
   not retired engines. Not implemented in this audit.

USB audio and stack allocations are not removed or reduced speculatively.
Likewise, `set_rec` must coexist with the project snapshot during settings
backup: aliasing its 3,648 bytes with project staging is unsafe. Dropping
preset names would add flash reads to browsing and is not an equivalent
replacement for packing metadata.

## Reproduction and evidence

`tools/ram_audit.py` reads the actual linked ELF using Python's standard
library. It uses linker bounds for resource totals, including alignment, and
does not add potentially overlapping symbol sizes:

```sh
build/venv/bin/python tools/ram_audit.py build/take-taker-pause/melodee.elf \
  --compare build/ram-audit-baseline/melodee.elf \
  --json build/take-taker-pause/ram-comparison.json --top 25
```

The baseline and candidate ELF, disassembly, package, build log, build options
and source fingerprints are retained locally under `build/ram-audit-baseline/`
and `build/take-taker-pause/`. The initial audit candidate remains under
`build/ram-audit-candidate/`. They use all 19 settings from the nightly
workflow, including resident audio, dual core, no core1 fallback, and the
enabled fast paths. These are uncommitted working-tree snapshots, so the base
commit alone does not identify the artifacts.

Focused validation covers all 1,024 capture/deadline handoffs, stale counters,
same-slot recapture, clock wrap, Take Taker's global pause and resume boundaries,
independent scheduler parity and preset browsing without extra flash reads.
AddressSanitizer and UndefinedBehaviorSanitizer pass the runtime handoff and
complete backup tests. After the global Take Taker pause, the runtime sanitizer
passes again. The complete host suite, compiled with nightly's twelve fast-path
options and `PARALLEL=2`, finished with **ALL HOST TESTS PASSED in 323 s**,
including audio, UI, recording, backups, web and target-budget checks. All 337
golden audio renders match with no reference/budget changes. Full-suite
validation is recorded in `build/take-taker-pause/host.log`; the initial audit's
322-second run remains in `build/ram-audit-candidate/host.log`.

No hardware flash or physical audio/control verification was performed for
this audit. Linked SRAM savings and host/static target checks do not measure
device CPU usage or audio deadline headroom.
