Melodee 1.4.0-rc.1 is the first release candidate for 1.4, based on `next`.

- **One to four tracks:** new songs start with one track. On HOME/Stage, hold
  OCT+ to add a track, or remove the selected track while stopped after confirming.
  Removing a track moves the remaining sounds, patterns, song sections, motion and
  recordings together. Projects and templates retain their track count.
- **HOME chord view:** tap HOME again to see the chord on a circle of fifths,
  sounding notes, track levels, waveform and keyboard. A single track uses a larger
  Stage layout; the other screens show the tracks in use.
- **Assignable SELECT:** HOME's held menu lets SELECT control BPM, mod wheel,
  level, swing, transpose, chord, arpeggiator rate or pattern, or turn it off.
- **Audio performance:** optimized synthesis, mixing and dual-core scheduling
  reduce audio work while preserving native DSP behavior. GLO > GLOBAL knob 2
  sets a shared BUDGET of 8–32 weighted points; idle tracks reserve no voices.
  The web editor exposes the same saved device setting.
- **Single-core build:** audio batching uses serial access when CPU1 is disabled,
  so the optimized audio path builds for both firmware variants.
- **1.3.2 fixes included:** startup stays at the boot loader's 360 MHz, optional
  320 MHz retuning has fault protection, retired CPU1 stays off until power-off,
  and recovery accepts the verified official M-VAVE V15 package.

This is a prerelease for testing. Earlier audio measurements apply to the specific
packages and settings recorded in `docs/AUDIO_PERFORMANCE.md`; they do not certify
every combination or higher BUDGET setting in this candidate. The exact release
candidate has not been flashed or physically auditioned as part of publication.

Downloads include Standard (dual-core) and Single core firmware, application
binaries, and native UBOOT recovery tools for Windows x64, macOS Apple Silicon,
macOS Intel and Linux x64. `BUILD_INFO.json` records the source commit and native
smoke tests; `SHA256SUMS` covers all assets. See `BUILDING.md` for installation and
recovery instructions. The stable installer remains on 1.3.2.

## Follow-up changes on the release branch

These changes on `next` follow the published 1.4.0-rc.1 tag and are intended for
the next candidate build. The existing rc.1 downloads do not contain them.

Thanks to [@aroum](https://github.com/aroum) for the detailed feature and usability
feedback in [issue #39](https://github.com/keremimo/melodee/issues/39):

- **Motion editing:** select a lane with KNOB 2, a step with KNOB 3, and edit its
  value with KNOB 4. SEQ + KNOB 2 clears the lane; SEQ + KNOB 4 clears the point.
  Each edit/clear supports undo and redo, preserving other lanes, tracks and banks.
- **UI feedback:** MOTION clears stale background pixels, SONG and SCALES align
  their titles to the right, ON/OFF values have badges, and HOME's menu saves a
  PICKER POPUPS setting for editing named parameters inline.
- **Installer:** a stable-release selector retains checksum-verified historical
  package pairs; Standard remains the default, Single core moves under Advanced /
  Hardware fallback, and the flashing log has bounded height with auto-scrolling.
- **Documentation:** current firmware-rendered screens and a controls diagram
  replace the old graphics.

Bluetooth and Wi-Fi exploration from that issue remains outside this change.
The firmware build, UI/motion/settings regressions, installer/site tests, web
protocol and backup tests pass. UI rendering covers 243 screens in three palettes
with zero layout findings. Physical-device validation remains pending.
