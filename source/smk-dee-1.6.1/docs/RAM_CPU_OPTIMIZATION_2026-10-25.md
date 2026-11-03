# RAM and CPU optimization run — 25 October 2026

Implemented locally on `nightly` at `1e4476e`, including a second CPU pass after
the RAM work. The baseline includes the display DMA-tile changes committed by
another session as `1e4476e`; their savings are excluded from these deltas.
No device was installed, and no release or push was made.

## Results

| Linked measure | Starting build | Final build | Change |
| --- | ---: | ---: | ---: |
| Data-region occupancy, including alignment | 98,200 B | 94,376 B | −3,824 B |
| Fixed pool | 107,884 B | 107,884 B | unchanged |
| Resident audio code | 129,924 B | 125,660 B | −4,264 B |
| Main contiguous resource arena | 98,048 B | 120,224 B | +22,176 B |
| Data SRAM resource tail | 104 B | 3,928 B | +3,824 B |
| Low SRAM resource tail | 2,744 B | 2,488 B | −256 B |
| Retained SRAM resource tail | 80 B | 80 B | unchanged |
| **Guaranteed resource bytes across separate banks** | **100,976 B** | **126,720 B** | **+25,744 B** |
| Optional validated cache | 28,672 B | 28,672 B | unchanged |
| PUNCH history while armed | 65,536 B | 32,768 B | −32,768 B |
| **Free RAM gain with PUNCH armed, same other allocations** | | | **58,512 B** |
| Application image, including unchanged stub | 575,180 B | 539,292 B | −35,888 B |
| Free application-body flash before commit marker | 2,068 B | 37,956 B | +35,888 B |

The separate RAM banks cannot be joined into one allocation. Optional cache is
excluded from guaranteed totals. The installable package stays 610,545 bytes
because it pads a fixed flash slot; the executable application image shrinks.
The four largest engine instances currently use 29,424 B; the linker retains
its conservative 49,152-byte minimum arena gate.

## RAM and flash changes

- Stereo FX filters share five coefficients per section and retain independent
  two-float channel histories. Fifteen states shrink from 340 to 260 bytes
  (1,200 B); PUNCH's embedded freeze state saves another 80 B. The wet-input tone
  union and hardware-EQ row layout retain their own histories.
- FM6 stores one quarter of each mirrored MARK I/OPL log ROM, reflecting the
  phase index at lookup. This saves 2,560 B of ordinary RAM with exact integer
  results, including sign, envelope wrap and overshoot. All three FM6 modes remain.
- Large foreground/control helpers are outlined, preserving explicit hot
  inlining. This reduces resident control code as well as large caller frames.
  Mutually exclusive preset-repair/general/Prophet migration banks now live in
  separate calls. The shared preset writer packs its foreground-owned cache in
  place and restores it before returning, including opaque phrase bytes and
  failure-state flags. No project, preset, backup or wire format changes.
- These stack reductions allow CPU0's actual foreground reservation to shrink
  from 24,320 to 12,288 B and its IRQ reservation from 7,936 to 6,144 B. CPU1's
  bank shrinks from 8,192 to 4,096 B: 3 KiB user, 1 KiB supervisor. Hardware guards
  remain, and stack reporting uses the linker boundaries.
- Resident instructions are compressed only in their flash load image. At boot,
  before CPU1/audio/IRQs start, a bounded raw-DEFLATE decoder expands the identical
  instructions into SRAM. The final resident load image is 125,660 → 94,459 B,
  including its header. There is no audio-time decompression or extra DSP state.
  The boot stub and its lock/hash remain unchanged; the existing body CRC protects
  the compressed image. A malformed header/stream enters ROM recovery.

`tools/stack_budget.py` blocks builds on unknown callbacks, dynamic frames,
unbounded recursion or a reservation overflow. It combines target assembly
frames, optimized LLVM calls (including tail calls), engine callback fields,
far-call targets and worker registries. The two explicitly bounded re-entry
paths are note-triggered recording and the supported single USB hub level.
Changes to their guard shapes require review. Callback binding propagation runs
to a fixed point.

| Current linked path estimate | Bytes |
| --- | ---: |
| CPU0 foreground, including preset repair/save | 8,976 |
| Audio IRQ, including serial batch fallback | 2,904 |
| Nested TIMER5 IRQ | 220 |
| CPU0 fatal handler/display path | 464 |
| CPU1 renderer | 1,764 |

The foreground check adds 2 KiB margin. The IRQ check sums audio, TIMER5, fatal
handling and 128 B exception reserve. CPU1 keeps IRQs disabled: its user check
adds 512 B margin and the 256 B bottom guard; a separate supervisor bank reserves
at least 1 KiB for its early fault branch. This is a conservative build-time
estimate, **not physical stack-watermark or stressed deadline acceptance**.
The reduced layout requires the verified LLVM build path; `MELODEE_SIZE=0`
cannot bypass that audit.

`tools/boot_audio.py` also verifies that the decoder, its direct/tail-call
closure and constant tables live in flash. It rejects indirect decoder calls
and SRAM dependencies, including a compiler-generated call to resident libc
before that memory has been initialized. `MELODEE_COMPRESS_AUDIO=0` retains the
raw-copy reference image.

## Authorized sound tradeoff

PUNCH history is now 16,384 mono samples: 372 ms at 44.1 kHz, versus 743 ms.
Replay spans clamp at 15,360 samples (348 ms); echo delay clamps at 16,320 samples
(370 ms). Long beat divisions at slow tempos use the shorter captured span.
Short divisions remain beat-exact until they reach that cap. This saves 32 KiB
only while the PUNCH layer owns history; it does not add another 32 KiB when idle.

All 27 PUNCH choices remain, including FREEZE. Engine synthesis, stereo placement,
reverb tank lengths, rack algorithms and the 64-sample transitions remain.
The manual and design notes describe the new history limit. Mono engine output
was authorized but unnecessary: voices already synthesize once and SPREAD
routes them to side buffers, so removing stereo placement does not halve synthesis.

## CPU measurements, including the second pass

The first pass skips the master wet-return read/rewrite pass when there is no
wet result and advances its monotone gain ramp once per block. Wet returns keep
the original rounding; PUNCH, DC blocking, limiting and clipping retain their order.

The second pass adds a separate centered-dry track mixer. It avoids unity-pan
multiplications and all send-buffer accesses. The centered-send fast path and
panned fallback remain separate, avoiding the earlier failed experiment that
made sends slower.

Host instruction measurements on this Mac, floating-point contraction off:

| Workload | Before | After | Change |
| --- | ---: | ---: | ---: |
| First pass: master output, dry, instructions/frame | 107.938 | 90.744 | −15.93% |
| First pass: master output, wet, instructions/frame | 150.741 | 146.812 | −2.61% |
| Second pass: centered-dry track sum, instructions/sample | 40.2 | 12.6 | −68.7% |
| Second pass: centered send, instructions/sample | 57.4 original general loop | 16.2 retained fast path | no loss of the prior optimization |
| Second pass: full four-track mixer, inserts off | 1,852.570 | 1,772.176 | −4.34% |
| Complete run: full four-track mixer, inserts off | 1,871.728 | 1,772.176 | −5.32% |
| Complete run: full mixer, Phaser | 2,574.509 | 2,551.211 | −0.90% |
| Complete run: full mixer, Tape | 2,501.122 | 2,477.017 | −0.96% |
| Complete run: full mixer, Reverb | 3,521.761 | 3,500.069 | −0.62% |

The complete mixer fixture uses Prophet, two FM6 parts and drums, warms 256
blocks and measures 2,048 blocks of 32 frames. FX-enabled mixer paths gain little
from the second change because they use the stereo FX mixer. Panned paths remain
within 1% of the reference in the focused sum benchmark. These are **host
instructions, not FM-1 cycles or device CPU percentages**.

No CPU or target budget was relaxed. Target filter cost is 172, equal to the
starting implementation. FM6's static estimate rises from the actual earlier
3,439 to 3,689 with mirrored-ROM lookup: a RAM/CPU tradeoff, within the unchanged
3,385 +10% gate. That metric counts all compiled loop alternatives and is not
a measured FM-1 percentage. The added dry helper and general fallback are now
included in the aggregate target check, so extraction cannot hide their work.

## BLE-only investigation

The earlier standalone template comparison used upstream fm1-base `6c0b47e`
and the pinned AC79 SDK. Central+peripheral BLE added 135,264 B flash, 47,772 B
ordinary RAM and 24,576 B pool over the USB-only template. ELF comparison also
shows 3,892 B radio executable SRAM and 1,308 B retained SRAM: about 77.5 KB SRAM
in total. These remain separate-template sizing estimates, not a linked Melodee port.

**Classic disabled does not mean its code is unreachable.** The SDK's shared
`hci_acl_handler` dispatches low handles to `hci_edr_acl_handler` without a classic
module guard. `hci_event_handler` retains classic event handling and forwarding;
shared L2CAP/controller paths reference `lmp_conn_for_handle`,
`lmp_private_remote_addr_for_handler`, classic command handlers and `lmp_acl_link`.
In addition, common function sections retain unused profile code alongside
referenced functions. The paths were traced in the vendor bitcode and linked symbols.

| Isolated central-template experiment | App image | Ordinary RAM |
| --- | ---: | ---: |
| Original BLE configuration, classic already disabled | 215,612 B | 75,580 B |
| BIG_FLASH off, unused classic/test feature flags off | 215,416 B | 75,580 B |
| Per-function BT code sections | 216,140 B | 75,580 B |
| Same section split + targeted HCI dispatch cuts | 211,676 B | 75,500 B |

The final probe saves **3,936 B flash and 80 B ordinary RAM** versus the original;
its dispatch change alone saves 4,464 B flash versus the section-split image.
Splitting sections by itself is rejected: it increases total size despite
removing some profile functions. The HCI probe retains disconnect/encryption,
command-complete, completed-packet and LE meta handling, and leaves LE subevents,
GATT, SM/security and controller/radio code in the SDK. Classic handles take
cleanup paths rather than being reinterpreted as LE handles.

`tools/ble_hci_probe.py` makes that narrow IR transformation reproducible and
rejects unexpected SDK dispatch layouts. It is **experimental and not enabled
in Melodee or installed on hardware**. It needs pairing/encryption, both roles,
reconnect, sustained MIDI and controller-fault acceptance before integration.
The source/archive provenance and all vendor notices remain with the private SDK;
no vendor archive or extracted SDK source is added to this repository.

This run creates substantial RAM headroom, but **does not establish that BLE fits**.
The simple additive flash model still lacks about 93 KB after the measured HCI
probe savings and the final 37,956-byte application headroom. Duplicate HAL/libc
removal and placement in a real port may change that estimate. BLE-only dispatch
specialization is worthwhile, but the measured cuts so far do not remove that gap.

The template's three 8 KiB task stacks, 24 KiB heap and shared L2CAP paths are
further candidates. Saadet's documented advertising heap peak (~11.3 KiB) does
not establish the connected/pairing worst case, so none of those allocations was
arbitrarily halved. A real integrated link and hardware stress run are still needed.

## Verification and artifacts

Final target build passes image limits, resident-code placement, boot decoder
closure, stack audit, unchanged stub lock, RAM boundaries and target CPU budgets.
Complete host/web/UI/DSP suite: **ALL HOST TESTS PASSED in 103 s**
(`build/ble-room-20261025/final-host-tests.log`). The earlier complete run passed
in 102 s before the final CPU1 stack split.

Additional focused checks:

- Original frozen FX PCM hashes and layout-independent audio/allocation trace
  `d63b453a1469d794`: 57,600 blocks across inserts, CHAIN/SPLIT, controls,
  zero input, fades, type changes and epoch resets. Delay contents remain exact.
- Independent master-output oracle: 6,600 wet/dry, length 0..32 and gain-ramp cases,
  including limiter/DC state and untouched samples.
- Independent mono-sum oracle: every level/pan, send extremes, input clipping,
  every track and USB stem capture on/off; exact channels, sends and peaks.
- Independent full-ROM FM6 operators: every phase/sign, fractional bits and
  wrapped/negative envelopes match the folded lookup exactly.
- Original preset serializer comparison: exact serialized bytes and complete
  cache restoration after every page/commit cut, erase failure and readback failure.
  Existing migration/reboot/torn-write and opaque-future-record tests also pass.
- Boot decoder: independent zlib stored/fixed/dynamic/Huffman-only streams,
  empty/random/real resident-code data, truncated/oversized inputs, output guards,
  and 10,000 deterministic malformed/mutated inputs per fixture. The actual
  packaged load image expands exactly to the linked resident section under ASan/UBSan.
- ASan/UBSan passes preset migration/serialization and full FX tests with serial
  rendering. As in the first pass, the host harness strips target alignment;
  no batched sanitizer pass is claimed for its existing 64-bit descriptor limitation.
- All PUNCH effects, slow/fast tempo bounds, long captures across wraps, stereo
  effects, FREEZE, transitions, allocation failure and exact dry release pass.
- Synthetic build-audit tests reject unresolved callbacks, unbounded recursion,
  dynamic frames, stack overflow, SRAM decoder dependencies and changed SDK layouts.

First-pass sources, baselines and measurements remain in
`build/optimization-run-20261025/`. Continuation artifacts are in
`build/ble-room-20261025/`: linked memory comparison, source/package hashes,
stack paths, separate before/after CPU fixtures, SDK probe archives and logs.
These ignored artifacts are local evidence, not release packages or hardware acceptance.

## Follow-up: recorder indexes, snapshots and flash tables

The follow-up audit uses `70fc020` as its baseline. Its isolated baseline rebuild
reproduces the original application bytes. These measurements exclude concurrent
USB-host changes in the main checkout.

| Linked measure | Baseline | Combined follow-up |
| --- | ---: | ---: |
| Application, including unchanged stub | 540,908 B | 537,684 B |
| Guaranteed resources across separate banks | 125,088 B | 127,760 B |
| Main contiguous arena | 120,000 B | 121,888 B |
| Data SRAM resource tail | 3,928 B | 4,712 B |

This recovers **2,672 B usable RAM and 3,224 B application flash**. The fixed-size
installable package and project/preset partition sizes do not change.

- Capture-list links and queued playback positions share 2,048 B. A sealed
  capture may linger in the list until the next tick; playback detaches it before
  overwriting its link. Normal capture completion retains its existing cost.
- Momentary UI snapshots store parameter IDs in place of pointers and one native
  patch snapshot at a time. The target recovers 784 B without changing persistence.
- Pinned Zopfli 0.4.3 compresses the existing boot-only resident-code image using
  the same DEFLATE format. The baseline stream shrinks by 1,556 B; the decoder,
  expanded instructions and audio-time work remain unchanged. Both nightly and
  shared release builds install the same dependency file.
- FM6 frequency points use coarse anchors and exact 16-bit residuals. The table
  shrinks from 4,100 to 2,314 B. Added code costs 128 B usable RAM; linked flash
  shrinks by 1,708 B in isolation. All 1,025 points and 16,777,216 interpolated
  pitch fractions match the original integers. Four held-preset fixtures add
  0.27–0.37% host FM6 instructions; no hardware cycle result is claimed.

The combined audit passes target memory, placement, stack and CPU gates and all
337 golden audio renders. Explicit handoff and native snapshot tests accompany
the production changes; compressed streams exercise the existing decoder under
ASan/UBSan. Physical deadline and stack-watermark validation remains open.

Further project streaming could remove roughly 14–15 KiB of shared canvas
reservation, but the current codec simultaneously holds a 15,432-byte decoded
project and a 14,684-byte bank tail. Compressing the other four startup sections
offers 10,394 B of payload savings before integration overhead. Neither larger
redesign is implemented here. The bit-exact MODERN sine-folding probe is omitted:
its approximately 28% host instruction penalty outweighs its small RAM saving.
