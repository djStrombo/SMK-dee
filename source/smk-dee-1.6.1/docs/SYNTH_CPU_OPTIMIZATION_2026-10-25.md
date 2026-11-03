# Synth instruction optimization 2026-10-25

The initial exact optimizations reduce steady host rendering instructions by **7.8% for
Prophet, 12.2% for CZ-1 and 13.8% for FM6 MARK I**, summed across each engine's
factory presets. The complete four-track fixture uses up to **11.2% fewer
instructions**. The requested broad 50% gain has not been demonstrated.

The SID and drum follow-up below also reduces SID instructions by **8.0%**,
808 repeated-hit playback by **4.9%**, 909 by **2.9%**, and the SID drum kits
by **17.1–17.4%**.

A bounded MARK I operator path does exceed that target: very quiet operators
use **81–83% fewer instructions** while retaining every sample, including the
chip model's negative quantization code. Ordinary modulated MARK I operators
use about one third fewer instructions. These kernel savings must not be
reported as the improvement of an entire synth or song.

## Measurements

Native Apple host, `cc -O2 -ffp-contract=off`, identical generated tables and
serial admission policy. The baseline is nightly `05a05cf` plus the local edits
present at task start; none of those edits were modified by this work. Sources
were captured before the synth changes in `build/synth-opt/before/`.

`tests/synth_bench.c` forks each scenario from untouched DSP state, requests four
notes per engine, renders 512 attack blocks, 4,096 held-note blocks and 512
release blocks, and reads `proc_pid_rusage` only around each complete run.
Blocks have 32 frames. The measurements include track preparation, rendering,
buffer clearing and one PCM hash update per block. They exclude file writing.
Some patches naturally decay while held; this is the specified fixture, not a
claim of four continuously sounding voices in every preset.

The factory matrix has 201 Prophet programs, 65 CZ programs, 32 SID programs,
four drum presets, and all 25 FM6 presets in each of its three modes. Three
four-track cases use Prophet program 3, two FM6 tracks and drums, with two
requested notes per track and inserts off. Every case has three measured phases:
**1,140 rows**, with matching before/after PCM hashes. Each hash samples one
output per block; full rendered audio is checked separately by the golden suite.

The first-pass table uses the held-note phase. Each engine row is the ratio of the summed
preset costs, with every preset weighted equally. Instructions are per audio
frame, across the track's voices, not per voice.

| Workload | Before | After | Fewer instructions |
| --- | ---: | ---: | ---: |
| Prophet, all 201 programs | 1943.121 | 1792.325 | 7.76% |
| CZ-1, all 65 programs | 1039.395 | 912.739 | 12.19% |
| FM6 MARK I, all 25 presets | 660.330 | 569.177 | 13.80% |
| FM6 MODERN, all 25 presets | 525.785 | 525.948 | −0.03% |
| FM6 OPL, all 25 presets | 671.519 | 673.430 | −0.28% |
| SID, all 32 programs | 926.139 | 926.201 | −0.01% |
| Four tracks, MODERN FM6 | 1728.500 | 1636.775 | 5.31% |
| Four tracks, MARK I FM6 | 1889.905 | 1678.672 | 11.18% |
| Four tracks, OPL FM6 | 1898.224 | 1807.595 | 4.77% |

Prophet preset reductions range from 3.2–13.4%, CZ from 6.5–14.9%, and MARK I
from 1.0–22.0%. The small MODERN/OPL/SID differences do not establish a gain;
the worst held-note OPL row is about 1% higher. Drum costs in this first pass are effectively
unchanged; the focused follow-up below measures repeated hits. Raw evidence is `build/synth-opt/before-full.csv`, `final-full.csv`
and `summary.json`.

## Retained changes

**Prophet:** generate oscillator input and cutoff arrays before filtering. The
oscillator and filter states are independent until their samples are combined,
so each filter still receives exactly the same input in the same order. This
reduces register pressure. Unmodulated oscillator A pulse width is converted
once per block. Scratch arrays use 256 bytes at 1× and 512 bytes at 2×.

**CZ:** render each independent line contiguously, retaining phase, DC and gain
values locally, then combine lines in the original order. This uses 256 bytes
of scratch. Window 4 returns its exact constant upper half before evaluating
the phase function, while waveform 3 retains its zero return. Phase wrapping
only runs when the nonnegative phase reaches 2048; the original subtraction is
unchanged when needed. Noise, ring modulation, toggles and both envelopes keep
advancing.

**FM6:** MARK I attenuation ramps are integral by construction. The separate
operator kernel retains those additions in the integer domain. A settled MODERN
gain uses its own kernel, preserving the first float addition and signed zero.
Every operator still advances phase and gain, and buses retain their addition
order. Feedback kernels and OPL arithmetic retain their original behavior.

For a complete MARK I gain ramp inside `[13312, 22171)`, all exponent values
shift to zero and adding log-sine attenuation cannot cross the sign boundary.
The output is therefore exactly 0 on the positive half and −1/2048 on the
negative half. The fast path preserves that output, rather than muting the
operator. Ramps crossing either bound use the full ROM kernel.

Focused operator measurements from `tests/synth_kernel_test.c`, including
loop/call overhead, show:

| MARK I operator | Original instructions/sample | Candidate | Reduction |
| --- | ---: | ---: | ---: |
| Ordinary modulated, ramping | 33.434 | 22.252 | 33.4% |
| Quiet, unmodulated, fixed gain | 27.424 | 4.643 | 83.1% |
| Quiet, modulated, fixed gain | 33.517 | 6.299 | 81.2% |

## Rejected experiments

- Integer OPL ramps produced matching samples but raised complete-track host
  instructions by about 19%. The float ramp remains.
- A small-modulation phase shortcut with a guarded fallback raised MODERN and
  OPL costs. The original exact phase reduction remains.
- Outlining every operator raised MODERN/OPL complete-track costs by about 4%.
  Only the selected fast kernels are isolated.

These results also show why a lower count in one helper is insufficient: the
compiler can change register allocation and loop layout in neighboring modes.
The complete factory matrix is the acceptance comparison.

## Validation and target limits

- 261,120 exact FM6 bus/state cases cover all algorithms, engine modes,
  feedback settings, short blocks, attenuation boundaries and ramp directions.
- 12,864 exact Prophet PCM/full-state cases cover all programs, randomized live
  edits, oscillator sync, modulation and block lengths, at both 1× and 2×.
- Existing CZ tests compare the original phase kernel and complete renderer
  through live edits. All 337 golden renders remain unchanged.
- The first-pass host/web suite reports `ALL HOST TESTS PASSED in 104 s`.
- AddressSanitizer and UndefinedBehaviorSanitizer pass the kernel parity test.
  Shift and signed-overflow instrumentation are excluded for the retained DSP's
  intentional fixed-point wrapping operations.
- Reference FM6 dispatch passes kernel parity. Disabling both FM6/CZ fast
  switches also retains all 93 hashes in the short benchmark matrix.
- The firmware builds and its SRAM residency, stack and resource checks pass.
  Target static cost guards include both new FM6 helpers; no budget was raised.

| Target static estimate | Before | After |
| --- | ---: | ---: |
| CZ renderer | 615 | 511 |
| Combined FM6 renderer and helpers | 3689 | 3338 |
| Prophet samples | 1077 | 1132 |

The Prophet host improvement accompanies a **5.1% increase in its target static
estimate**. The target estimate counts compiled loop alternatives, not measured
cycles, so a device measurement must decide whether this is also a hardware
improvement. The combined build has 120,000 bytes in its main audio working arena
against the unchanged 49,152-byte minimum; its stack audit passes with 2,968
bytes on the audio interrupt chain and 1,828 bytes on CPU1.

Host instructions, instruction efficiency and FM-1 CPU time are different
measurements. A 50% throughput gain corresponds to a one-third cost reduction;
a 50% instruction reduction corresponds to twice the instruction efficiency.
Neither establishes device deadlines. No firmware was installed during this
work. Physical audio, stressed polyphony and device deadline measurements
remain necessary before claiming a hardware performance gain.

## Reproduction

```sh
cc -O2 -ffp-contract=off -w -Ibuild/gen -Ifirmware/src \
  tests/synth_bench.c -lm -o build/host/synth_bench
build/host/synth_bench full > build/synth-full.csv
PYTHON="$PWD/build/venv/bin/python" ./build.sh
PATH="$PWD/build/venv/bin:$PATH" tests/run_tests.sh
```

Build and run the same benchmark against the saved baseline sources or the
starting revision to compare costs and hashes. `MELODEE_FM6_FAST=0` and
`MELODEE_CZ_FAST=0` retain reference dispatch paths; Prophet sample scheduling
is unconditional and uses the retained independent reference in the kernel test.


## SID and drum follow-up

The original drum measurement held four notes for several seconds after one
trigger. One-shot instruments naturally decay, so that fixture is weak at
characterizing busy drum playback. `tests/synth_bench.c drums` adds repeated
hits every 128 control blocks (about 93 ms), each instrument separately and
an overlapping kick/snare/hat/tom groove. It measures 8,192 blocks per case,
with both fixed controls and TUNE/DECAY changes at each hit. This produces
126 cases covering the 808, 909, SID KIT and SID DIGI presets. Timing includes
retrigger/control preparation and track rendering. Each case has equal length.

All 126 before/after hashes match, as do all 1,140 rows of the original factory
matrix. The baseline here is the completed initial synth pass. Evidence is in
`build/synth-opt/drums-before.csv`, `sid-drums-final-drums.csv`,
`sid-drums-final-full.csv` and `sid-drums-summary.json`.

| Workload | Before instructions/frame | After | Reduction |
| --- | ---: | ---: | ---: |
| SID, all 32 factory programs, held-note phase | 926.201 | 852.424 | 7.97% |
| 808, all instruments plus groove, fixed controls | 137.002 | 130.299 | 4.89% |
| 808, moving controls | 136.356 | 129.674 | 4.90% |
| 909, all instruments plus groove, fixed controls | 269.649 | 261.783 | 2.92% |
| 909, moving controls | 264.984 | 257.345 | 2.88% |
| SID KIT, all instruments plus groove, fixed controls | 175.615 | 145.114 | 17.37% |
| SID KIT, moving controls | 181.140 | 149.674 | 17.37% |
| SID DIGI, all instruments plus groove, fixed controls | 171.274 | 141.878 | 17.16% |
| SID DIGI, moving controls | 176.459 | 146.206 | 17.14% |

SID preset gains range from 2.5–10.3%. The 808 groove uses about 5.7% fewer
instructions, the 909 groove about 2.4%, SID KIT about 15.0% and SID DIGI about
13.8%. The 909 change benefits its synthesized metallic voices: their focused
renderer drops from about 127 to 108 instructions/sample, while complete
repeated-hit metal tracks improve by up to 9.4%. Kick, snare and tom costs are
approximately unchanged.

**SID synth:** generate the oscillators' delayed, edge-corrected excitation
into a 128-byte block, then run envelope gain and the filter/output chain. The
order and integer rounding of every sample remain unchanged. This reduces
competition between oscillator and filter registers.

**808:** annotate each circuit's state pointer with its actual non-aliasing
contract. State, raw output, patch and scratch storage are disjoint at every
caller. The compiler can retain coefficients and histories across output
writes. There is no change to circuit equations or stored state.

**909 metal:** generate the six free-running pulse phases and their float sum
before filtering, using 128 bytes of scratch. The six additions keep their
original order. Noise advances even when its current mix is zero, and the
original envelope, distortion and stereo pan processing follow unchanged.

**SID drums:** render each independent channel into its routed or direct block,
then apply the shared filter and DIGI/output stages. This uses 256 bytes of
scratch and removes repeated channel setup from the sample loop. Channel sums
retain their order; steals, fades, frame programs, envelope counters and DIGI
positions retain their exact state.

A separate 909 state-pointer annotation experiment saved only about 0.3% and
was discarded. No larger waveform/DAC tables or extra persistent state were
added.

Validation:

- The SID reference test passes 67,584 complete PCM/voice-state cases across
  all models, waveforms, stacks and filter modes, including 0–32-frame blocks.
- The existing drum oracle passes 40,000 variable-length render/state cases,
  including 909 stereo/pan/distortion and 808 scratch state.
- The new SID-kit reference test passes 80,000 complete PCM/chip-state cases
  across all programs, DIGI transitions, controls, recorded releases and steals.
- All three focused tests pass AddressSanitizer/UndefinedBehaviorSanitizer with
  the wrapping-arithmetic exclusions noted above. SID-kit parity also passes
  with both SID/DRUM fast switches disabled.
- The combined host/web suite reports **`ALL HOST TESTS PASSED in 105 s`**:
  all 337 golden renders remain unchanged, with no CPU budget failures.
- The firmware build, SRAM/stack checks and all target budgets pass. A new
  dedicated SID-kit cost guard uses its original 629 baseline; no existing
  budget was increased.

Actual target static estimates, before and after this follow-up:

| Kernel | Before | After |
| --- | ---: | ---: |
| SID renderer | 1029 | 1016 |
| SID-kit renderer | 629 | 600 |
| 808 kick | 129 | 130 |
| 808 snare | 143 | 140 |
| 808 metal preparation/rendering kernel | 114 | 103 |
| 909 metal renderer | 204 | 218 |

The 909 metal target estimate increases by 6.9% despite the host improvement;
these static loop scores cannot establish FM-1 cycle savings. Physical audio
and deadline measurements remain pending. No firmware was installed.

To reproduce the added repeated-hit workload, compile the benchmark as above,
then run `build/host/synth_bench drums` on both source revisions.
