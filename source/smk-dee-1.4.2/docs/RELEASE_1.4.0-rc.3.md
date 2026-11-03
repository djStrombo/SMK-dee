Melodee 1.4.0-rc.3 is the third release candidate for 1.4, based on `next`. It contains
everything in [1.4.0-rc.2](RELEASE_1.4.0-rc.2.md), with one change:

- **No clock changes at all (as 1.3.4):** the OVERCLOCK menu and its 320 MHz option are
  gone. Melodee runs at the 360 MHz the FM-1's boot loader sets and never writes the clock.
  On some FM-1s, often the ones that also had trouble with the second core, the clock
  change at start-up was the step that left the device in UBOOT behind a black screen. A
  320 MHz setting saved before is ignored; an FM-1 updated from a session at 320 MHz runs
  at 320 until it is switched off, then at 360. The boot order, the second core and the
  boot guard are unchanged.

This is a prerelease for testing. The host test suite passes; the exact candidate
packages have not been flashed or physically auditioned as part of publication.

Downloads include Standard (dual-core) and Single core firmware, application binaries,
and native UBOOT recovery tools for Windows x64, macOS Apple Silicon, macOS Intel and
Linux x64. `BUILD_INFO.json` records the source commit and native smoke tests;
`SHA256SUMS` covers all assets. See `BUILDING.md` for installation and recovery
instructions. The stable installer remains on 1.3.4.
