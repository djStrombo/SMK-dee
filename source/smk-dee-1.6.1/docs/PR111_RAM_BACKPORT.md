# SLOOP PR #111 RAM backport

Source: [isod89/sloop-fm1#111](https://github.com/isod89/sloop-fm1/pull/111),
reviewed at head `a7ae5ea8db469376bf5c3cf3e234c430a4761247`.
The applicable shared-scratch change is Andre Rezemini's
[`d024b410eeaba7d1f96888028517a8175ee09b4e`](https://github.com/andrerezemini/sloop-lab/commit/d024b410eeaba7d1f96888028517a8175ee09b4e)
(upstream commit also credits Claude Fable 5.1).
Melodee adaptations are by Kerem Kilic (Ellic Studio); retained notices and
GPL-3.0-only remain in the affected sources.

## Applied

`scratch.h` overlays the 256-byte storage page buffer, 1,024-byte HOME/Stage
scope snapshot, and 640-byte decoded update frame in one 1,024-byte union.
These are synchronous main-loop jobs; each fills its member before consuming
it. None uses the union from an interrupt, core 1, or LCD DMA. Scope drawing
does not invoke storage or update decoding. Update progress does not draw a
scope. The loader omits the scope member, keeping its decoder at 640 bytes.

The 112-byte update commit record reuses the first bytes of existing project
wire staging after `ota_stage()` returns successfully. Unlike decoded replies,
this record must survive progress drawing until commit, so it stays separate
from both the shared union and display canvases. Failed sessions still discard
the staging area and return to normal operation.

## Other PR changes

| Change | Applicability here |
| --- | --- |
| Lower SRAM relocation | Already reclaimed dynamically by `app.ld` and `resources.c`, after resident code/tables. A fixed `.lowram` allocation would consume those same bytes. |
| MIDI ownership nibbles | Already present in `midi_control.c`, including the sustain flag. |
| Scope snapshots / OTA staging | HOME and Stage already shared a snapshot; OTA package staging already borrowed project wire RAM. This port shares the remaining transient buffers and commit record. |
| Preset banks read directly through XIP | Melodee stores compressed preset records and uses one shared cache across user/FM6/CZ/Prophet banks. Raw flash records are not interchangeable with the expanded cache. Keep migration, favourites, legacy layouts and backup identities intact. |
| DRAWBAR state in engine arena | Already allocated on demand through `eng_state_size()` / `drw_of()` for the legacy WHEEL engine. |
| Stack watermarking / render split | Separate diagnostics and scheduling changes; no additional RAM saving to port here. |

## Measured resources

Default dual-core build, same configuration before and after, based on
`8839f0e` on `feat/mpc-bank-octaves`, 18 October 2026:

| Resource | Before | After | Change |
| --- | ---: | ---: | ---: |
| Static RAM reported by build | 96,264 B | 95,256 B | -1,008 B |
| Data-region audio tail | 2,040 B | 3,048 B | +1,008 B |
| Main contiguous audio arena | 162,560 B | 162,528 B | -32 B |
| Total audio resources across SRAM banks | 167,264 B | 168,240 B | +976 B |
| Application image | 525,556 B | 527,372 B | +1,816 B |

The main arena's 32-byte difference comes from resident-code growth and stack
alignment; the new data-region tail is a separate allocation bank. These are
linked capacity measurements, not measured CPU or polyphony improvements.

The PR's 29,488-byte lower-SRAM claim starts at `0x01C00BD0`. This Melodee
build instead uses 2,964 bytes for `.ram_text`, 20,376 bytes for `.dsp_text`,
7,336 bytes for `.dsp_tables`, and 20 bytes of alignment there. Its free tail
starts at `0x01C077E8`, leaving 1,816 bytes up to `0x01C07F00`, already
available through the resource allocator. Relocating buffers into the PR's
fixed range would overlap live DSP code and tables.

Validation includes the firmware build and target instruction budgets,
ASan/UBSan storage, update and LCD/DMA checks, and the full host suite. The
update test poisons shared drawing scratch at every progress callback, checking
that staged package data and the commit record remain valid. No hardware flash
or physical audio/control validation is part of this backport.

Completed result: `ALL HOST TESTS PASSED in 316 s` with `PARALLEL=2`;
337 golden audio renders unchanged, zero health/voice/routing failures,
target budgets passed, and zero UI layout lint findings.
