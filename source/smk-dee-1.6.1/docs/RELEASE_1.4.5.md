Melodee 1.4.5 is a hotfix release following [1.4.4](RELEASE_1.4.4.md).

- **USB identification:** the USB product name is `Melodee FM-1`, and the update
  loader is `Melodee FM-1 Update`. Keeping FM-1 in the name helps other installers
  recognise the hardware family when macOS retains a MIDI port name after a
  firmware switch. USB vendor and product IDs are unchanged.
- **External MIDI tempo:** smooths clock jitter and stabilises the displayed BPM
  for USB and TRS clock, while retaining exact pulse-driven sequencer timing and
  quickly following larger tempo changes.
- **Live arpeggiation:** physically held notes keep arpeggiating at the local tempo
  while the selected external sync master is stopped. A released HOLD chord still
  waits for external transport, and a running master takes over timing as before.
- **Shared project root:** ROOT is shared across tracks with SCL, QNT and MPC
  degree. Older projects with differing roots use the saved selected track's root
  when loaded; each track's TRN remains independent. The saved project layout is
  unchanged.
- **Page navigation:** removes the repeated HOLD GLO / SCL shortcut hints after
  ordinary taps. Hold and double-tap shortcuts remain available.
- **Installer and recovery:** uses TransitFM1 0.1.3 for switching firmware and
  documents direct entry to ROM UBOOT for recovery. For Baud Girl, install official
  V15 first and then use Baud Girl's installer.

Projects, templates and presets remain compatible with 1.4.3 and 1.4.4. Their
compatibility limits with older releases still apply. This release retains eight
pattern banks and the established effects; the nightly RAM and FX development
changes are outside this patch.

Downloads include firmware, the application binary, native UBOOT recovery tools
for Windows x64, macOS Apple Silicon, macOS Intel and Linux x64, and licence
notices. `BUILD_INFO.json`, `SHA256SUMS` and signed GitHub attestations record the
release's source and build provenance.

```sh
gh attestation verify melodee-1.4.5.fwsc --repo keremimo/melodee \
  --signer-workflow zvenson/fm1-build/.github/workflows/build.yml \
  --source-ref refs/tags/v1.4.5
```

Automated build and test results do not establish hands-on audio, control or MIDI
validation.
