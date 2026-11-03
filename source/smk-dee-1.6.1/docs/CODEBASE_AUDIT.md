# Codebase cleanup — 2026-10-15

Baseline: `nightly` at `adefa37`. Measurements below compare that baseline with
this cleanup.

## Coverage and method

The audit covered the application and engines, HAL, loader and boot stub,
storage/migration/editor paths, Python build/generator/device tools, and browser
editor/updater/backup code. It combined exact and renamed-identifier function
comparisons, production and test caller searches, source-history checks, linked
symbol sizes, and manual review of the candidates. Source similarity is a lead;
types, state ownership, memory placement and wire formats determine whether
sharing is appropriate. This does not establish that every algorithm or path is
optimal.

## Changes

- Share little-endian bit fields through `wire_bits.h` across drum patches,
  project recordings and pattern banks. Their existing normalization and rejection
  rules remain at their callers. Project and bank step decoding now share one
  implementation too.
- Share seeded byte-wise FNV hashing across UI history, recording undo, projects
  and editor preferences. Word-wise drawing signatures retain their different
  semantics.
- Share integer clamp, clipping, noise and amplitude-ramp helpers across active
  engines and effects. Force these small DSP helpers inline so RAM kernels keep
  their arithmetic local. Float curves retain their own precision and ranges.
- Compute engine capacity once per query. The former contract helper repeated the
  same capacity callback and clamping; diagnostics now use the same query as
  playback.
- Remove seven alias-only shared-preset APIs and the constant retired native-view
  selector. UI and tests call the underlying preset store directly.
- Remove unused oscillator/filter wrappers, retired browser helpers, battery/list
  drawing helpers, an identity preset adapter and an unused default-engine query.
  Browser tests now exercise the current factory/user browser rather than the
  disconnected engine-scrolling implementation.
- Collapse identical Stage/view frame clears into their caller and remove the
  unreachable Stage branches after its early return.
- Share division arithmetic while keeping real-time tempo and external musical
  time as explicit, separate callers.
- Pack four Boolean preset-index flags into one byte and keep 12 name bytes per
  entry, adding the terminator on read. Each RAM-only index entry shrinks from 18
  to 14 bytes. Validate each cached record once instead of up to three times.
- Reuse the package module's CRC-16 in the build tool, and reuse the palette
  generator's sRGB linearization function.
- Fix the single-core FM6 batch kernel's direct XIP-to-SRAM call exposed by
  variant validation. It now uses the same volatile indirect-call mechanism as
  the existing single-core render path. Remove its unused dual-core scratch and
  the MIDI-only mixer's unused capture index.

The optimization pass removed **230 net production firmware/tool lines**,
including the new shared bit-field header, before the dual-core-only workflow
changes below. Regression tests are counted separately.

## Measured device impact

Same default build flags and toolchain before and after:

| Resource | Baseline | Cleanup | Difference |
| --- | ---: | ---: | ---: |
| Application image | 498,960 B | 498,416 B | −544 B |
| Static `.data + .bss` | 97,084 B | 95,548 B | −1,536 B |
| Free data SRAM tail | 1,220 B | 2,756 B | +1,536 B |
| Static pool allocation | 164,884 B | 164,884 B | unchanged |
| Total available audio resource arenas | 171,448 B | 172,984 B | +1,536 B |
| Installable package | 610,534 B | 610,534 B | unchanged |

The package reserves a fixed application slot. Smaller linked code therefore
does not shrink the download or enlarge the persistent project/preset sectors.
The reclaimed data SRAM is available to the existing resource allocator.
The flash saving is modest because the compiler and linker already discard
many unused helpers and inline much of the repeated arithmetic.

## Deliberately retained

- Boot-stub register/timing/byte helpers: the stub builds independently, runs
  without a valid application and has a pinned binary hash.
- The slow reference package CRC: it independently checks the optimized CRC and
  compensation algorithm.
- Similar updater and editor/archive MIDI codecs: the updater streams groups of
  seven bits; editor archives use a leading high-bit mask for seven bytes.
  Archive decoding additionally checks lengths, unused mask bits and trailing
  bytes. Browser/Python/C counterparts serve different execution environments.
- Native bank readers and engine/parameter IDs: migration, archives and stored
  identities still use them. Retired serialized values remain reserved.
- Receive, send and project scratch buffers: their lifetimes can overlap while
  an import waits for a destination. Name resemblance does not establish that
  their storage can be shared.
- The generated voice-quota table: it has no firmware include or linked symbol;
  historical measurement/report tools still consume its source data. Compacting
  it would save no device flash or RAM.
- Tiny typed engine-state accessors, separate FM6/Prophet worker joins, and UI
  action guards: these express type, ownership or interaction differences.
  Combining them would add a generic dispatch layer for very little shared work.
- Existing third-party DSP/reference helpers and host fixture entry points that
  are absent from the linked application. Unused-function searches also find
  assembly/interrupt callbacks; caller searches alone cannot prove them dead.

Source provenance was checked before extraction. The bit-field routines came
from Melodee work in `4a50561`; the upstream FNV implementation moved into the
existing mixed-origin `libc.c`, which retains its Felucca portions notice.
Third-party licence notices and existing SPDX identifiers are retained.

## Validation and evidence

Build and validation logs, before/after images, package variants and the local
audit scans are in `build/cleanup-audit/` (ignored build artifacts).

The baseline full suite passed. A separate differential harness compiled the
baseline and cleanup sources, populated four engine tracks, pattern banks,
recordings and full-length preset names, then compared the packed project plus
simulated NOR flash: **1,076,480 bytes identical**, SHA-256
`3a8e929c06a6e627613f90f5a576664cd3c211904061b20183277e7d8dc77f10`.

New bit-field checks cover widths 0–32 at unaligned offsets against independent
64-bit arithmetic, surrounding bytes, OR-write semantics and canaries. Shared
hashing has published FNV vectors and incremental-seed checks. Bit-field and
resource/cache tests also pass AddressSanitizer and UndefinedBehaviorSanitizer.

Current supported dual-core configurations pass, with no compiler warnings:

| Configuration | App bytes | Static data/BSS bytes | Saved package |
| --- | ---: | ---: | --- |
| Default, dual core, USB audio + TRS MIDI | 498,416 | 95,548 | `build/cleanup-audit/final.fwsc` |
| Resident audio, dual core | 500,888 | 95,836 | `build/cleanup-audit/resident.fwsc` |
| MIDI only, dual core | 496,540 | 96,044 | `build/cleanup-audit/midi.fwsc` |

Following the CPU voltage startup fix, single-core target builds and delivery
are retired on this branch. The earlier audit exercised the single-core path
before that policy changed; it is no longer part of the build/release workflow.
Serial host references and CPU1 fault fallback remain for validation and recovery.
Nightly/release CI, release validation, stable/RC/nightly site generation, release
history imports, installer choices and live nightly verification now use dual-core
firmware only. The target build tool rejects `MELODEE_DUAL_CORE=0`, and release
validation refuses leftover `-1core` assets. Existing site metadata with two core
variants is converted to the dual-core package when the site is regenerated.
The updated dual-core-only build and full suite pass (`ALL HOST TESTS PASSED
in 73 s`), including release aggregation, legacy site migration, nightly checksum
verification, and installer channel/race checks. The default firmware bytes and
SHA-256 remain unchanged from the optimization result below.

The resident build verifies 327 linked audio functions in SRAM. Every build
retains boot-stub version 3 and its pinned hash. Package SHA-256 values are in
`build/cleanup-audit/SHA256SUMS`. The current `build/melodee.fwsc` is the default
configuration and matches `build/cleanup-audit/final.fwsc`.

Commands, with each variant flag scoped to its build:

```sh
PYTHON="$PWD/build/venv/bin/python" ./build.sh
MELODEE_RAM_AUDIO=1 PYTHON="$PWD/build/venv/bin/python" ./build.sh
MELODEE_USB_AUDIO=0 PYTHON="$PWD/build/venv/bin/python" ./build.sh
PATH="$PWD/build/venv/bin:$PATH" PARALLEL=6 tests/run_tests.sh
```

Final full suite: **`ALL HOST TESTS PASSED in 75 s`**. This includes 335 golden
renders with 0 changed/0 gone, 0 health failures, 0 voice/routing failures,
0 CPU entries over budget, and the target instruction-budget checks. No golden
or cost baselines were changed.
UI validation covers 251 screens across eight palettes plus the page/value sweep:
0 layout-lint findings and 0 monochrome pixels off gray.

Default package SHA-256:
`30c857eea93d2970b0910c98e7d631cee16e3fb9fa9645daf76dc0a675877279`.

No firmware was installed or published. Physical audio, controls and MIDI have
not been exercised by this cleanup run. Optional external DaisySP/Dexed
comparisons require their separate checkouts.
