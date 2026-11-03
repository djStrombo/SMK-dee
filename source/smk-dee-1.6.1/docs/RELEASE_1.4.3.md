Melodee 1.4.3 is the stable release that follows [1.4.1](RELEASE_1.4.1.md) and the
[1.4.2-rc.1](RELEASE_1.4.2-rc.1.md) candidate. It includes everything in both, plus
the latest `nightly` changes:

- **Four tracks to start:** new songs open with four tracks (Prophet, FM6 bass,
  CZ lead and 808 drums), and unused tracks are listed so they can be added back.
- **Chord strums:** voiced chords can be spread over a beat division with down,
  up or alternating strokes (STRUM/STROKE). Recording keeps the played onsets;
  release, stop and panic cancel pending tones. Existing projects, templates and
  presets load with strumming off.
- **Pattern halve and double:** SEQ's pattern dialog halves (C#) or doubles (D#)
  the pattern, and stays open for further steps until SEQ is released.
- **Voice weights:** GLO > WEIGHTS sets budget points per voice for each engine,
  with an optional overload SAFETY (off by default).
- **MPC pads:** MPC Sample program banks E-H route to tracks 1-4 (Bank F wraps
  through MIDI note zero), with a finger-drum pad layout that follows the selected
  track. Each bank keeps its own octave; Stage octave buttons, lights and the
  header follow the selected track. Older projects load neutral bank octaves.
- **Audio performance:** modulation caching, faster control, mixing, panel,
  recording index and capture paths, idle FX sleeping, and engine-specific fast
  paths for Prophet, FM6, CZ, drums and SID. Parts and drums are balanced across
  both cores, eligible adjacent reverbs overlap, and part of the data cache is
  used as audio RAM.
- **Memory:** inactive pattern banks are stored compressed, FM6 SysEx dumps reuse
  project RAM, and recording release queues share storage. Save formats for
  recordings and projects are otherwise unchanged.
- **Fixes:** local PLAY runs while an external MIDI sync master is stopped; each
  track keeps its own preset list in the browser; Stage drum cards no longer
  flicker under the knobs; the SCL cycle skips the scale picker.
- **CPU1 hold:** holding CPU1 masks the delayed bus traps it can raise on CPU0,
  adapted from Leo Kuroshita's Felucca 1.6.1 safe-hold sequence (also used by
  SLOOP 2.7.1). This package does not fall back to single-core rendering: if CPU1
  fails, the firmware waits for the watchdog restart; the boot-loop guard is
  retained.

Projects, templates and presets saved by 1.4.3 carry the two strum parameters,
which 1.4.1 does not read: back up before installing if you may return to 1.4.1.

Downloads include the firmware package and application binary, native UBOOT
recovery tools for Windows x64, macOS Apple Silicon, macOS Intel and Linux x64,
and licence notices. `BUILD_INFO.json` records the source commit, build switches
and native smoke tests; `SHA256SUMS` covers every asset.
