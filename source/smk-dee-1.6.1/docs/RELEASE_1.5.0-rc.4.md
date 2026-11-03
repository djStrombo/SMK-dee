Melodee 1.5.0-rc.4 brings the current nightly changes to the release-candidate
channel: LZMA startup compression, MIDI clock recovery, shared audio effects,
synth optimizations, and quieter idle USB host handling. It includes the features
in [RC3](https://github.com/keremimo/melodee/releases/tag/v1.5.0-rc.3).
Stable 1.4.5 remains the default installer channel.

## Startup compression and memory

- All five SRAM startup sections use LZMA compression by default. They expand
  once before SRAM code or the second core runs. The decoder uses the unused
  audio working arena for its probability tables, with no heap allocation.
- The development build's startup images compress from 157,868 to 105,580 bytes.
  Its application image is 516,828 bytes; the fixed-slot installation package
  retains its usual size. These figures describe the development build before
  the release version is applied.
- Malformed compressed records enter ROM recovery. The build checks that the
  decoder and its dependencies execute from flash during SRAM initialization.
- Recorder bookkeeping reclaims working memory without changing stored note
  pitch or project layouts. Synth kernel changes retain reference PCM and state
  across the automated comparisons.

## MIDI, recording and USB host

- Recover clock pulses discarded during input overflow and consume overdue ARP
  steps while retaining residual phase and gate timing.
- Arm one recording track at a time and reset retroactive capture when the
  selected track changes.
- Idle USB host detection no longer repeatedly resets or reprobes an empty hub
  or an unsupported direct device. A connection change or HOST toggle retries
  detection.
- Firmware installation build dependencies include the flash helper's required
  Python packages.

## Shared audio effects

Audio processors now run in the three-slot shared rack. Tracks retain NOTE TAIL
and NOTE ECHO, plus their sends to the shared rack. The shared rack permits one
REVERB: selecting it in another slot moves it there; imported duplicate REVERB
slots keep the first.

**Migration:** historical per-track audio effect types load OFF. They are not
automatically moved into the shared rack. Set those processors and track sends
in SHARED when adapting an older project. NOTE TAIL and NOTE ECHO remain track
effects. Stored parameter IDs and project layouts remain readable.

Absolute MIDI controller knobs select the valid note-effect choices correctly.
The editor retains existing library keys, and the small device cards show the
note-effect label without clipping.

## Validation and hardware status

The combined development source passed the firmware build and full host/web
suite, including reference sound renders, MIDI timing recovery, shared effects,
recording, storage, UI layout, USB, installation and recovery. The LZMA decoder
and USB host fixtures also passed address/undefined-behavior sanitizers on Linux.
The release workflow repeats blocking host/web checks on the tagged source.

**Cold/soft boot, LZMA startup time, physical stack watermarks, sustained audio
deadlines and device interoperability still need hardware acceptance for this
exact candidate.** No device installation is implied by this release.
Bluetooth MIDI remains outside this candidate. Earlier RC project-format and
migration limits continue to apply.

Firmware and application binaries are built and attested by the reviewed
`zvenson/fm1-build/.github/workflows/build.yml@v1` workflow. Downloads include
native UBOOT recovery tools for Windows x64, macOS Apple Silicon, macOS Intel
and Linux x64, licence notices, `BUILD_INFO.json` and `SHA256SUMS`. The workflow
verifies attestations, application bytes and the complete recovery set before
publication. Verify the firmware with:

```sh
gh attestation verify melodee-1.5.0-rc.4.fwsc --repo keremimo/melodee \
  --signer-workflow zvenson/fm1-build/.github/workflows/build.yml \
  --source-ref refs/tags/v1.5.0-rc.4
```
