Melodee 1.4.0-rc.4 is the fourth release candidate for 1.4, based on `next`. It
includes everything in [1.4.0-rc.3](RELEASE_1.4.0-rc.3.md), plus:

- **Larger text throughout:** labels, text, values and large readouts use four
  consistent sizes. Settings > FONT selects Rubik or Melodee Pixel. Lists, menus,
  dialogs, the browser and editing pages fit the larger type.
- **HOME and pattern display:** tracks appear as coloured rows. Every pattern
  step is shown as a dot, sized to fit the track's row. Knob pages show a large
  value while turning a knob.
- **Colours and Stage light:** five new palettes, knob colour shades, and optional
  screen-edge lighting that follows the playing sound. List values and scale status
  remain readable in the larger UI.
- **Recording undo:** undo or redo a whole recorded take, including its motion,
  while retaining other tracks and pattern banks. Recording popup cleanup is fixed.
- **MIDI channel filtering:** GLOBAL > SYSTEM > ROUT now limits USB and TRS notes
  to the selected four-channel range: 1–4, 5–8, 9–12 or 13–16, mapped to tracks 1–4.
  Other channels cannot trigger the selected track, and the DRUM override respects
  the range. SEL still accepts all channels. Note-offs and sustain release follow
  their original notes when routing changes; saved CH1-4 and SEL values retain
  their identities. The web editor exposes the same choices.
- **Audio memory:** reclaim unused RAM for audio resources while keeping project,
  preset and recording layouts compatible with the preceding candidate.
- **Chord-wheel retention:** releasing chord keys one by one keeps the full last
  voicing and its connecting lines after the final release. New notes replace
  the retained voicing. Sounding-note display and voice modes are unchanged.
- **384 shared user slots:** all engines share U001–U384, including complete
  native FM6, CZ-1 and Prophet voices. The device and web editor use the same
  library. Recognized preceding preset banks convert on first boot, with visible
  progress and restartable writes. Unreadable banks reset to empty defaults;
  readable banks retain compatible entries and discard unsupported entries.
- **USB audio:** one duplex Melodee device supports computer playback volume and
  mute, stereo master recording, and optional four-track mono recording. Hosts
  may need to reselect the combined device. Reported intermittent computer
  playback crackling remains unresolved.
- **Startup and update protection:** an interrupted application write can return
  to the retained USB update loader. Startup displays maintenance before flash
  writes, resets foreign settings safely, and protects incompatible projects as
  OLD FORMAT. The first installation of boot protection still requires
  uninterrupted power while its boot sector is written.
- **Source credits:** corrected authorship notices distinguish Melodee work from
  retained Felucca code and preserve third-party notices.

This is a prerelease for testing. Standard (dual-core) and Single core firmware
packages are built from the same source commit. The full host suite validates
routing, recording, persistence, rendering and resource limits; physical testing
of these exact RC4 packages is pending. The shared
preset format requires a pre-conversion backup when downgrading to older
firmware; see [startup and compatibility](../README.md#startup-and-compatibility) and
[boot protection](BOOT-SAFETY.md) for compatibility and validation limits.


Downloads include both firmware variants and application binaries, native UBOOT
recovery tools for Windows x64, macOS Apple Silicon, macOS Intel and Linux x64,
and licence notices. `BUILD_INFO.json` records the source commit and native smoke
tests; `SHA256SUMS` covers every asset. The web installer offers RC4 alongside
stable and nightly; stable remains the default.
