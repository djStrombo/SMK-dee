# Compressed pattern RAM

The 18 October continuation and shared-pool policy are tracked in
[PATTERN_CAPACITY_PLAN.md](PATTERN_CAPACITY_PLAN.md). Larger host core fixtures
now exercise 16 banks and 128 steps; the device limits remain unchanged while
RAM, admission, project persistence and UI integration are completed.

Implemented on top of `86c8130` (2026-10-17). This is the RAM-storage foundation for larger pattern capacity. Shipping limits remain eight banks per track and 64 steps, including existing odd lengths. The flash map and shared 1,024-note recording capacity remain unchanged. With the MIDI-track expansion, four-part songs still use FBKK; songs with tracks 5–8 use sparse FBKL and refuse saves that exceed a flash slot.

## Ownership and switching

The eight `track_t.step` arrays hold the editable/playing patterns. Each track also has one staging pattern. Every other bank is represented by a directory of 16-step blocks in a dedicated, statically bounded chunk pool.

Foreground `pattern_poll()` compresses outgoing staging data and prepares the next queued bank, or the next SONG row. At a prepared boundary, the sequencer frees the incoming cold copy and swaps expanded steps and timing with staging. The outgoing bank remains readable from staging immediately, including edits made after preparation; foreground service encodes it later.

If preparation has not run, the sequencer flushes any previous outgoing bank and decodes the requested bank synchronously. This fallback is bounded by the pattern size and chunk count. It preserves the requested boundary and never waits for foreground work. It can cost more CPU than a prepared switch, so device deadline measurements remain required before increasing capacity.

Pool reads and mutations are serialized with audio through interrupt guards. Foreground compression is outside the audio ISR but still uses a bounded guarded section; it is not background work on CPU1. There is no compaction, `malloc`, or relocation of unrelated banks.

Callers read banks using `pattern_read` / `pattern_step` / `pattern_timing`, and publish edits with `pattern_write` under the existing sequencer guard. They cannot retain writable pointers into inactive banks. The host-only `pattern_at` assertion helper returns snapshots.

## Runtime codec

Each block describes 16 steps:

- Canonical empty block: a directory entry, no payload chunks.
- Sixteen identical steps: one eight-byte packed step in one chunk.
- Other blocks: a 16-bit presence mask plus eight bytes for each non-default step, streamed through 16-byte chunks.
- Dense fallback: 128 bytes in eight chunks, with no compression-dependent capacity failure.

Packed steps preserve every valid field and unused note bytes except the hidden note count `n` on rests and ties, which becomes zero on a bank switch, matching project serialization. All steps up to `NSTEP` are retained regardless of current LEN. Shortening a pattern does not discard hidden material. Original recorded onsets, independent releases, pitch and length remain in the existing precise event store.

At most 56 banks are cold: eight tracks times seven inactive banks. The pool reserves 1,792 chunks, enough for every cold block to be dense. Staging temporarily reduces the number of encoded banks; flushing an outgoing bank therefore always has its dense allocation available. Replacing a block frees its old chunks first. Current-capacity edits do not depend on typical compression ratios.

## Historical RAM and compiled build (four tracks, nine-byte snapshots)

| Pattern storage component | Bytes |
| --- | ---: |
| Chunk payload | 16,128 |
| Chunk links | 2,016 |
| Block directory | 512 |
| Bank timing | 256 |
| Four staging patterns and tags | 2,856 |
| Pool counters and free-list head | 10 |
| Total, excluding shared pattern epoch | 21,778 |
| Previous expanded bank arrays | 22,784 |

The four active step arrays already existed and are excluded from both totals. Linker placement/alignment makes the actual reclaimed SRAM **1,024 bytes**. Unused chunks remain reserved for patterns; they are not lent to engines or effects. Lower payload utilization must not be reported as additional audio RAM.

A fresh HEAD baseline and candidate were built with the same generated assets and default build flags:

| Measure | Baseline | Candidate |
| --- | ---: | ---: |
| App image including stub | 569,780 B | 571,508 B |
| Audio main arena | 155,904 B | 155,904 B |
| Data SRAM tail | 2,336 B | 2,720 B |
| Retained SRAM tail | 208 B | 848 B |
| Low SRAM tail | 1,768 B | 1,768 B |
| Total audio resources | 160,216 B | 161,240 B |

The main audio arena still exceeds its 142,336-byte minimum. Evidence is in local `build/pattern-pool-baseline-build.log`, `build/pattern-pool-build.log`, and `build/pattern-pool-memory.json`. The older pre-existing build artifact had different parameter/feature layouts and is not used for the comparison.

## Validation and CPU evidence

`tests/pattern_pool_test.c` checks the actual pool against an independent expanded model: all banks dense, all four simultaneous prepared switches, repeated unprepared switches, late outgoing edits, hidden steps, destination edits after preparation, every step queried independently, and chunk/free-list ownership after seeded mutations. AddressSanitizer and UndefinedBehaviorSanitizer pass this workload.

The complete host suite passed (`ALL HOST TESTS PASSED in 117 s`), including existing bank copy/clear/double/halve behavior, SONG, track removal/addition, unquantized recording, undo, FBKK persistence/backup, golden renders, and compiled target budgets. Target budget checks are static instruction costs, not measured device cycles.

A host-only dense switching benchmark with the same empty recording store and shared release/motion work measured approximately:

| Work per track | Host time |
| --- | ---: |
| Previous expanded commit/load reference | 0.10 microseconds |
| Prepared switch | 0.16 microseconds |
| Foreground outgoing compression plus incoming preparation | 1.36 microseconds |
| Unprepared fallback | 1.52 microseconds |

These are one local optimized host run, exclude live audio rendering, and must not be converted into a device CPU percentage or deadline guarantee. The sanitizer run is slower and is not the performance baseline. Reproduce with `build/host/pattern_pool_test`; the benchmark is included in the host suite. Local evidence: `build/pattern-pool-benchmark.log` and `build/pattern-pool-sanitize.log`.

## Resident configurations and nightly integration

On the experimental base `86c8130`, a minimal resident build with only `MELODEE_RAM_AUDIO=1` and `MELODEE_DUAL_CORE=1` fails the audio-working-arena check for both baseline and candidate. The default build passes. No linker assertion was relaxed. These preliminary builds leave nightly's fast-path options unset. Local logs in the experimental checkout: `build/pattern-pool-baseline-resident-build.log` and `build/pattern-pool-resident-build.log`.

The pattern-storage change was then ported onto nightly `6f6fb92`, retaining its chord-strum changes. The full 19-option configuration from `.github/workflows/nightly.yml` passes the resident target build: dual core, CPU1 fallback disabled, resident audio, cache RAM, admission/profile/bench disabled, and all twelve fast-path options enabled. The audio main arena is 56,768 bytes against a 49,152-byte minimum; total audio resources are 59,600 bytes plus the optional 14,336-byte audio cache partition. The image is 532,184 bytes.

The complete nightly host suite, compiled with the same twelve fast-path options, passed: `ALL HOST TESTS PASSED in 116 s`. This establishes the integrated nightly build and host behavior; it does not establish device switching deadlines, physical controls, or audible MIDI/audio behavior. Logs: `build/pattern-pool-nightly-build.log` and `build/pattern-pool-nightly-host.log`.

## Next capacity gate

This foundation does not enable 16 banks, 128 steps, or 16-step-only lengths on the device. The user subsequently chose a shared budget preserving existing dense-project capacity. Recording identifiers and a bounded-pool core prototype now have larger-capacity host coverage; automation, full edit admission, RAM/flash integration, device deadline measurements and legacy-length policy remain in the linked continuation plan.
