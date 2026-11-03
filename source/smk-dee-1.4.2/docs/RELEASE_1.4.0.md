Melodee 1.4.0 is the new stable release for the M-VAVE FM-1. These are the main
changes since 1.3.6, including the features tested in the 1.4 release candidates.

- **A redesigned interface:** larger text throughout, Rubik and Melodee Pixel
  fonts, clearer lists and dialogs, coloured track rows, and pattern dots sized
  to show the whole loop. New palettes give each track its own colour.
  Turning a Stage knob updates its cell without
  covering the performance display.
- **FX racks and tone shaping:** navigate three track inserts and the shared
  effects through rack views, open only the slots in use, and switch between
  chained and separate sends. ECHO, ROOM and REVERB gain a per-slot TONE control,
  from DARK through FULL to THIN, with low-frequency buildup reduced in their
  repeats and tails. Existing project effects and routing are retained.
- **C64 instruments and drums:** SID gains C64 6581/8580 models with one voice
  per track and register updates at PAL frame rate. POLY turns held chords into
  fast chip arpeggios. New SID KIT and SID DIGI drum presets use one 6581's three
  voices; SID DIGI plays synthesized kick and snare through the four-bit volume
  register. Retriggers, voice stealing and kit output levels are improved.
- **Recording and pattern performance:** explicit REC stays active across loops
  until disarmed or stopped. Selecting an empty pattern, or double-tapping a used
  pattern key, arms one pass instead. Undo/redo restores a whole take, including
  notes, motion and timing. Destructive pattern operations wait for the loop end
  during playback. SEQ's black keys select tracks, armed tracks have a REC border,
  and WAIT LOOP stays visible in the header while recording waits.
- **One to four tracks and a chord view:** start with one track, add or remove
  tracks from Stage, and retain that count in projects and templates. Tap HOME
  for a circle-of-fifths view with sounding notes, chords and waveform. The last
  complete voicing remains visible after staggered note releases.
- **One shared preset bank:** U001–U384 stores Prophet, FM6, CZ-1, SID and Drum
  sounds in any mix, including their native voice data. Supported legacy banks
  migrate at startup. The editor and on-device USER/STORE pages share the same
  slots; librarian imports route by manufacturer.
- **Simpler USB audio:** one duplex device named Melodee replaces the separate
  playback and recording devices. Host volume and mute control computer playback
  without changing USB recordings. Stereo master capture and four isolated mono
  track stems remain selectable.
- **An online user manual:** the illustrated guide covers the device, engines,
  effects, recording, editor, installation and recovery. Thanks to
  [@relyt29](https://github.com/relyt29) for writing it. Stable and nightly guides
  are published separately with their firmware version and generated screenshots.
- **Faster navigation:** KNOB 2 picks an EDIT-map category, KNOB 1 or SELECT picks
  its page, and each category remembers its page. Encoder detents arriving during
  a redraw are retained. HOME SELECT and GLO SELECT offer assignable performance
  controls; modulation destinations use their engine's names.
- **Audio and resource improvements:** synthesis, mixing and dual-core scheduling
  optimizations reduce work, and unused RAM is reclaimed for audio. A saved shared
  voice BUDGET controls the workload; idle tracks reserve no voices. Current
  packages use both cores; single-core downloads are retired. The stock V15 supply
  startup and existing boot, settings, preset and MIDI safeguards remain included.

Before upgrading, export projects and user sounds you want to keep. Leave power
connected during installation and preset migration. Older firmware cannot read
the unified preset bank; keep a backup made before migration if you may downgrade.
Unsupported preset contents can be reset at startup; projects retain OLD FORMAT
protection. The firmware leaves the system clock at the boot loader's setting.

Downloads include the dual-core firmware package and application binary, licences,
checksums and native USB recovery tools for Windows x64, Linux x64, macOS Intel
and Apple Silicon. BUILD_INFO.json records source and native recovery-test
provenance. Automated validation is reported separately from physical-device
audio, control and recovery testing; this release is not flashed during publication.

Install: https://keremimo.github.io/melodee/

Manual: https://keremimo.github.io/melodee/webapp/manual/
