Melodee 1.4.0-rc.2 is the second release candidate for 1.4, based on `next`. It contains
everything in [1.4.0-rc.1](RELEASE_1.4.0-rc.1.md) plus the changes below.

- **No clock change at 360 MHz (from 1.3.3):** at its default 360 MHz, Melodee never
  retunes the system clock, not even once after updating from a 1.3.0 or 1.3.1 that ran
  at 320 MHz. That retune is the step that left some FM-1s in UBOOT behind a black screen.
  A 320 MHz left by an update stays until the next power-off. Switching OVERCLOCK to
  360 MHz applies at the next power-on (**360 MHZ AT POWER-ON**); 320 MHz still offers a
  restart.
- **Motion editing:** select a lane with KNOB 2, a step with KNOB 3, and edit its value
  with KNOB 4. SEQ + KNOB 2 clears the lane; SEQ + KNOB 4 clears the point. Each edit or
  clear supports undo and redo, preserving other lanes, tracks and banks.
- **UI feedback:** MOTION clears stale background pixels, SONG and SCALES align their
  titles to the right, ON/OFF values have badges, and HOME's menu saves a PICKER POPUPS
  setting for editing named parameters inline.
- **Installer:** a stable-release selector keeps checksum-verified earlier package pairs;
  Standard remains the default, Single core moves under Advanced / Hardware fallback, and
  the flashing log has a bounded height with auto-scrolling.
- **Documentation:** current firmware-rendered screens and a controls diagram replace the
  old graphics.

Thanks to [@aroum](https://github.com/aroum) for the detailed feature and usability
feedback in [issue #39](https://github.com/keremimo/melodee/issues/39).

This is a prerelease for testing. The host test suite passes; the exact candidate
packages have not been flashed or physically auditioned as part of publication.

Downloads include Standard (dual-core) and Single core firmware, application binaries,
and native UBOOT recovery tools for Windows x64, macOS Apple Silicon, macOS Intel and
Linux x64. `BUILD_INFO.json` records the source commit and native smoke tests;
`SHA256SUMS` covers all assets. See `BUILDING.md` for installation and recovery
instructions. The stable installer remains on 1.3.3.
