Melodee 1.5.0-rc.2 adds two automatic chord modes and MIDI controller profiles to the 1.5 release candidate.
It includes the MIDI tracks, USB Host, effects and memory work described in
[RC1](RELEASE_1.5.0-rc.1.md). Stable 1.4.5 remains the default installer channel.

## Automatic chords

- **AUTO** chooses chords inside the selected Western scale using recent harmony
  and melody from other eligible tracks. With VOIC CLOSE it connects chords with
  nearby inversions. Held chords keep their captured notes through release,
  sustain and strumming.
- **AUTO2** is a separate option for playing a tune with harmony underneath.
  The mapped key stays the highest note, and the same key selects the same
  harmony regardless of backing notes, earlier presses or timing. During a strum
  the melody sounds immediately; the lower accompaniment follows.
- Start with **SCL → CHORD → CHRD AUTO2**, **VOIC CLOSE**. OPEN widens the lower
  accompaniment; INV1, INV2 and +OCT also keep the melody fixed at the top.
- Both modes support the 16 Western scales, including pentatonic, blues,
  whole-tone and diminished. Out-of-scale inputs follow the existing downward
  mapping policy. Microtonal selections play the input note alone in these new
  modes; the existing DIA3/DIA7 and fixed chord modes remain available there.
- Existing chord mode IDs retain their meaning. Recording stores the actual
  notes played, so playback reproduces the take rather than choosing new chords.

## MIDI controller knobs

- **MIDI KNOBS** offers OFF, GENERAL and MINILAB profiles for operating the eight
  panel controls from a MIDI controller. The MiniLab profile supports the
  MiniLab 3 factory Arturia/User CC assignments.
- Absolute and supported relative encoder modes are available; profile and mode
  are remembered. The feature defaults OFF to preserve conventional synth CC
  behavior. USB and TRS use the same mapping rules.

## Validation and compatibility

Automated checks cover both chord modes, Western scale/root/transpose combinations,
melody placement, strum attacks, note ownership, recording, project roundtrips,
controller profiles and UI layout. Reference sound renders and CPU budgets remain
blocking. These checks do not establish hands-on musical suitability, hardware
interoperability or sustained audio timing for this exact release candidate.
RC1's project-format and migration limits continue to apply.

Firmware and application binaries are built and attested by the reviewed
`zvenson/fm1-build/.github/workflows/build.yml@v1` workflow. Downloads include
native UBOOT recovery tools for Windows x64, macOS Apple Silicon, macOS Intel and
Linux x64, licence notices, `BUILD_INFO.json` and `SHA256SUMS`. The release workflow
verifies firmware attestations, application bytes and the complete recovery set
before publication. Verify the firmware with:

```sh
gh attestation verify melodee-1.5.0-rc.2.fwsc --repo keremimo/melodee \
  --signer-workflow zvenson/fm1-build/.github/workflows/build.yml \
  --source-ref refs/tags/v1.5.0-rc.2
```
