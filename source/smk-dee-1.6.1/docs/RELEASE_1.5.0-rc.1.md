Melodee 1.5.0-rc.1 is the first release candidate for 1.5, based on `next` after merging the current `nightly` and stable 1.4.5 fixes.
It brings the MIDI, effects and memory changes developed since stable 1.4.5
into a candidate for testing. Stable 1.4.5 remains the default installer channel.

## MIDI tracks and USB Host

- **MIDI Track engine:** use any of tracks 1–4 to sequence an external USB MIDI
  instrument. CH selects output channel 1–16. Keys, scales, chords, arpeggios,
  patterns, recorded takes and SONG use the same musical paths as synth parts.
  MIDI Track uses no audio voices or engine/FX working memory.
- **Four additional MIDI-only tracks:** Stage's Add track continues to tracks
  5–8, initially on output channels 5–8. They open on CH/TRS controls and always
  remain MIDI Track. Tracks 1–4 retain their choice of instruments.
- **Groups of four:** ALGORITHM selects every track. Stage, MIXER, PATTERNS,
  SONG and GLO show the group containing the selected track. With SEQ held,
  D# switches groups and the four track keys select within the group. GLO
  retains mute/solo and shows MIDI channels instead of audio levels.
- **USB Host input and output:** Menu > USB HOST connects a class-compliant
  USB-MIDI device directly or through one externally powered hub. Controllers
  feed the existing MIDI input paths; MIDI tracks send to the attached device,
  including output-only USB instruments. Host mode resets to device mode at boot.
  Low-speed devices and nested hubs are not supported.
- **Input and note cleanup:** TRS THRU optionally admits routed TRS input to a
  MIDI track while USB is selected. Channel controls follow its output channel.
  Mute, solo, stop, channel changes and USB loss release outgoing notes; queued
  releases take priority after reconnection. Disconnect detection is debounced.

## Effects, audio memory and installation

- **Revised master punch:** the SLOOP punch controls, hold/lock behavior and
  buffered effects run on the master output, with state shown in the header.
- **Expanded insert effects:** the current effect rack includes the SLOOP reverb,
  drive, fold, fuzz, crush, phaser, chorus and flanger additions. Each slot has
  its own wet-input TONE control. Effects and routing save with projects.
- **More audio memory available on demand:** compressed inactive patterns,
  packed recording data, shared scratch buffers and demand-allocated histories
  reduce fixed reservations. MIDI-only tracks have no synth patch or motion
  working state. Production fast paths remain enabled.
- **Installer and recovery:** includes the TransitFM1 0.1.3 switching flow,
  installer safeguards and the pinned m-bootloader package. Firmware retains
  the FM-1 family name in its USB identification.

## Compatibility and candidate limits

- Eight patterns of 64 steps remain available on every track; the recording
  store remains shared at 1,024 notes. This candidate does not enable sixteen
  pattern banks or 128-step patterns.
- Songs with at most four tracks retain FBKK project records. Songs using
  tracks 5–8 use the new sparse FBKL format in the existing flash slots.
  **PROJECT FULL** refuses an oversized save before replacing the saved copy.
  All banks can be filled in working memory, but a fully dense eight-track
  song exceeds a saved project's capacity. Older firmware cannot read FBKL.
- Recognized earlier Melodee projects, templates and presets retain their
  existing compatibility paths. Unknown projects remain protected as OLD FORMAT.
  See [startup and compatibility](../README.md#startup-and-compatibility) and
  [boot protection](BOOT-SAFETY.md) for migration and recovery limits.
- The web editor retains its four-track interface. Templates retain the track
  count and the first four parts' settings; tracks 5–8 start with default MIDI
  settings. Projects save all eight tracks' settings and patterns.
- A DX7 dump arriving while save/load or another main-loop job owns the shared
  transfer buffer is dropped; resend the dump after that operation.

Automated validation covers firmware resource limits, unchanged reference audio
renders, CPU budgets, MIDI input/output and cleanup, step entry on tracks 5–8,
all 64 recording-bank owners, project flash roundtrips and track removal, and UI
layout across palettes and fonts. These checks do not establish hands-on audio,
controls, USB-device interoperability or update behavior for this exact candidate.

Downloads include the dual-core firmware, application binary, native UBOOT
recovery tools for Windows x64, macOS Apple Silicon, macOS Intel and Linux x64,
and licence notices. `BUILD_INFO.json`, `SHA256SUMS` and GitHub attestations record
the source and build provenance. Verify firmware with:

```sh
gh attestation verify melodee-1.5.0-rc.1.fwsc --repo keremimo/melodee \
  --signer-workflow zvenson/fm1-build/.github/workflows/build.yml \
  --source-ref refs/tags/v1.5.0-rc.1
```
