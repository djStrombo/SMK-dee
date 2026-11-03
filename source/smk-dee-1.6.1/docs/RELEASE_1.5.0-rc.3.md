Melodee 1.5.0-rc.3 reduces RAM, firmware size and dry-mixer CPU work, improves display transfers, and fixes metronome volume and FM6 SysEx reception.
It includes the automatic chords, controller profiles and other features in
[RC2](https://github.com/keremimo/melodee/releases/tag/v1.5.0-rc.2).
Stable 1.4.5 remains the default installer channel.

## Memory and performance

- Recovers about **25 KiB of general audio working memory** through shared FX
  coefficients, exact FM6 ROM symmetry, smaller resident control code and reduced
  stack reservations checked against linked call paths.
- Compresses the resident-code load image in flash and expands the identical
  instructions once at startup, before audio and the second core start.
  The measured development image shrinks by about **35 KiB**. The fixed-slot
  installation package retains its usual size.
- Avoids unused wet-return work and adds a centered-dry mixer path. The complete
  four-track dry fixture uses **5.3% fewer host instructions**, including 4.3%
  from the second optimization pass. These are host measurements, not measured
  FM-1 CPU percentages or deadline guarantees.
- Preset saving avoids large whole-bank stack copies while retaining the same
  serialized bytes, failure rollback, favorites, opaque records and migrations.

## PUNCH history tradeoff

The optional PUNCH history now uses **32 KiB instead of 64 KiB** while armed.
History lasts about **372 ms instead of 743 ms** at 44.1 kHz. Replay spans cap at
348 ms and echo delays at 370 ms, so long beat divisions at slower tempos use a
shorter capture. All 27 choices, FREEZE and existing transitions remain available.
Engine stereo placement and rack reverb tank lengths are retained.

Bluetooth MIDI is **not included**. The BLE-only HCI specialization is a separate
experimental size probe; this RC does not establish that a BLE port fits.

## Display and musical fixes

- Display updates send changed tiles through bounded DMA buffers, reducing
  redundant transfers while preserving buffer ownership during drawing.
- The metronome follows master volume, including silence at master zero.
- Extended DX7 voice dumps recover correctly in the FM6 SysEx receiver.
- The default MIDI-only preset is named **MIDI Track**.
- Restores the runnable nightly workflow so development builds no longer enter
  a recursive scheduler wrapper.

## Validation and hardware status

Blocking checks cover reference sound renders, mixer parity and CPU budgets,
FM6 lookup parity, storage migrations and every preset-write failure stage,
PUNCH capture wraps and transitions, dual-core/reference behavior, UI, MIDI,
USB, web installation and recovery. Independent boot-decoder fixtures include
malformed streams and exact expansion of the packaged resident-code image under
address/undefined-behavior sanitizers.

This candidate changes startup decompression and stack reservations. Their linked
bounds and recovery paths are checked automatically; **cold/soft boot, physical
stack watermarks, sustained audio deadlines and device interoperability still
need hardware acceptance for this exact candidate**. Automated checks do not
establish those measurements. RC1's project-format and migration limits continue
to apply.

Firmware and application binaries are built and attested by the reviewed
`zvenson/fm1-build/.github/workflows/build.yml@v1` workflow. Downloads include native
UBOOT recovery tools for Windows x64, macOS Apple Silicon, macOS Intel and Linux
x64, licence notices, `BUILD_INFO.json` and `SHA256SUMS`. The release workflow
verifies attestations, application bytes and the complete recovery set before
publication. Verify the firmware with:

```sh
gh attestation verify melodee-1.5.0-rc.3.fwsc --repo keremimo/melodee \
  --signer-workflow zvenson/fm1-build/.github/workflows/build.yml \
  --source-ref refs/tags/v1.5.0-rc.3
```
