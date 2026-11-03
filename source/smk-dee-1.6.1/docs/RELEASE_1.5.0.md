# Melodee 1.5.0

Melodee 1.5 turns the FM-1 into a more capable MIDI sequencer and performance
instrument: four additional MIDI tracks, USB Host input and output, two automatic
chord modes, master punch effects, and quicker sound selection on PATTERNS.
This changelog covers the changes since stable **1.4.5**, including the four
1.5 release candidates and the final recording and navigation improvements.

## Eight tracks, including external instruments

- **Tracks 5–8 are dedicated MIDI tracks.** Tracks 1–4 can use Melodee's synth
  engines or the MIDI Track engine. Each MIDI track has its own output channel
  from 1–16 and uses the same scales, chords, arpeggiator, patterns, recorded
  takes and SONG arrangement as an internal part. MIDI tracks consume no synth
  voices or audio-effect working memory.
- **USB Host receives and sends MIDI.** Connect a supported USB-MIDI keyboard or
  instrument directly, or through one powered hub. The selected device can
  provide input, output or both; output-only instruments are supported. Sequence
  an external synth alongside the FM-1's internal parts, or play them from a
  larger keyboard. TRS remains a MIDI input; a MIDI track's TRS setting admits
  additional routed TRS input while USB input is selected.
- **Direct track selection.** The first eight black keys select tracks 1–8 on
  PATTERNS while unarmed, or with SEQ held. The screen follows the selected
  group of four, including the actual track numbers. Press an unused track key
  on PATTERNS to create and select it immediately; any missing intermediate
  tracks are created too.
- **MIDI cleanup and clock recovery.** Channel changes, mute/solo, stop and USB
  reconnects release outgoing notes. Disconnect handling retains local and TRS
  input ownership. Clock-overflow recovery and overdue ARP-step handling retain
  musical phase instead of accumulating lost pulses.

USB Host temporarily uses the USB-C port as a host: computer-facing USB MIDI,
audio and firmware updates are unavailable until HOST is off. HOST is not saved
and resets off at boot. Use an externally powered hub or a suitable powered
adapter; the firmware does not supply USB bus power. One full-speed MIDI 1.0
device/interface is selected, directly or behind one hub. Nested hubs, low-speed
devices and attached-device SysEx/editor traffic are not supported. See
[USB Host setup and limits](../BUILDING.md#usb-midi-host).

## Play melodies with automatic harmony

- **AUTO** chooses scale-based chords using recent harmony and melody from
  other eligible tracks. CLOSE voicing connects them with nearby inversions.
- **AUTO2** keeps the key you play as the highest note and adds harmony below
  it. The same mapped key produces the same harmony regardless of backing
  notes or previous presses. During a strum, the melody sounds immediately and
  the accompaniment follows.
- Try **SCL → CHORD → CHRD AUTO2**, **VOIC CLOSE** for a melody with accompaniment;
  OPEN spreads the lower voices. Recording captures the actual resulting notes,
  so playback reproduces the performance.
- Both modes cover the 16 Western scales. Microtonal selections and kits keep
  their bypass behavior; existing fixed and diatonic chord modes remain available.

## Performance effects and a shared audio rack

- **27 master punch choices adapted from SLOOP.** Hold FX and press a key for
  loops, stutter, reverse, tape stop, half speed, filters, crush, gate, echo,
  rewind, octave up, flanger, auto-pan, freeze and more. They process the master
  mix, including shared returns and stereo USB capture. Double-tap FX to lock
  the performance layer; release an effect key to return to dry sound.
- **Three shared audio-effect slots.** Use CHAIN for a serial rack or SPLIT for
  separate sends to each slot. Send several internal tracks into the same space
  or processor. The rack includes SLOOP Reverb, drive with Soft/Hard/Fold/Fuzz
  shapes, crush and swept pedals alongside the existing audio processors.
- **One shared REVERB.** Selecting REVERB in another shared slot moves it there;
  imported duplicate REVERB slots keep the first. Per-track NOTE TAIL and NOTE
  ECHO remain available, with note-based echo timing and velocity decay.

**Effects migration:** older per-track audio processors load **OFF**; they are
not automatically moved to SHARED. Recreate those processors and their track
sends in the shared rack when adapting an older project. Existing shared
settings load through their compatibility paths. NOTE TAIL and NOTE ECHO remain
track effects. This is a routing change even though stored parameter IDs and
project layouts remain readable.

The optional PUNCH buffer uses **32 KiB**, providing about **372 ms** of mono
history at 44.1 kHz. Replay spans cap at 348 ms and echo delay at about 370 ms;
long beat divisions at slower tempos use a shorter captured span. Rack reverb
and stereo dry output retain their own processing paths.

## Faster PATTERNS and recording workflow

- **Browse sounds without leaving PATTERNS.** PRESET changes the active audio
  track's sound and immediately displays its name and engine. Keys audition the
  sound while the card is open. Each turn or held live input extends the preview;
  two idle seconds after release restore track/pattern selection. SEQ explicitly
  restores selection during preview. MIDI-only tracks 5–8 keep their settings.
- **Repeat half/double without reopening the dialog.** After a resize, the
  pattern action dialog stays open while its original pattern key or SEQ is
  held. Release both to close it. Existing pattern delete/copy shortcuts remain.
- **One recording grid for the project.** TEMPO → QNT applies to every audio and
  MIDI track and is saved in projects and templates. OFF retains performed
  timing. Quantization commits when a take ends; note lengths and velocities
  remain. Existing takes are not re-quantized by changing the setting. Older
  projects adopt the saved selected track's recording grid.
- **Focused recording and Take Taker.** Arming a track finishes and disarms the
  previous track's take. Retroactive capture follows only the selected track;
  changing tracks starts a fresh capture history. First-note recording and the
  existing one-pass pattern shortcuts remain available.
- **MIDI controller knobs.** Optional GENERAL and MiniLab 3 profiles operate the
  eight panel controls using absolute or supported relative encoder modes.
  Profile and mode are remembered; the feature defaults OFF.

## Memory, display and fixes

- LZMA-compressed SRAM startup images expand before audio and the second core
  start. Compact inactive patterns, packed recording data, shared temporary
  buffers and on-demand histories reduce fixed memory reservations.
- Synth and mixer optimizations retain the automated reference audio/state
  checks. Display transfers use bounded DMA tiles and send changed pixels.
- Idle USB Host handling avoids repeatedly resetting empty hubs or unsupported
  devices. Reconnect or toggle HOST to retry a failed detection.
- The metronome follows master volume, including silence at zero. Extended DX7
  voice dumps, including the supported MainStage wrapper, import correctly.
- Installer safeguards and TransitFM1 0.1.3 support remain included. The USB
  identity retains FM-1, and the recovery tools include their required runtime
  dependencies.

## Project compatibility and limits

- Every track has **eight patterns of up to 64 steps**. The project shares
  **1,024 recorded notes**; this release does not add 16 banks or 128-step patterns.
- Projects using at most four tracks retain FBKK records. Tracks 5–8 use the
  sparse FBKL format in the same flash slots; older firmware cannot read FBKL.
  A fully dense eight-track project may exceed a saved slot's capacity.
  **PROJECT FULL** refuses an oversized save before replacing the saved copy.
- Recognized earlier Melodee projects, presets and templates retain their
  migration paths; unknown projects remain protected as OLD FORMAT. Templates
  keep the track count and first four parts' settings; extra MIDI tracks start
  with default MIDI settings. Projects save all eight tracks.
- The web editor retains its four-track interface. A DX7 dump received while
  another operation owns the transfer buffer must be resent after that operation.
- Bluetooth MIDI is not included.

## Release validation and downloads

The release pipeline uses the reviewed
[`zvenson/fm1-build` workflow at `v1`](https://github.com/zvenson/fm1-build/tree/v1)
for firmware builds, blocking host/web tests and signed build attestations.
Publication requires verified firmware/app provenance, matching application
bytes, all four native recovery archives and their checksums. The stable
installer and manual are updated only by the final publication step.

Automated checks cover reference audio, CPU/resource and stack budgets, startup
decoding, recording and project roundtrips, MIDI timing/ownership, USB models,
controller profiles, UI layouts, installation and recovery. This release
preparation does not measure physical stack watermarks, sustained hardware audio
deadlines or compatibility with every USB instrument; build provenance does not
establish those hardware results.

Downloads comprise the dual-core firmware, application binary, UBOOT recovery
tools for Windows x64, macOS Apple Silicon, macOS Intel and Linux x64, licence
notices, `BUILD_INFO.json` and `SHA256SUMS`. Verify the firmware with:

```sh
gh attestation verify melodee-1.5.0.fwsc --repo keremimo/melodee \
  --signer-workflow zvenson/fm1-build/.github/workflows/build.yml \
  --source-ref refs/tags/v1.5.0
```

Thanks to the Felucca and SLOOP authors and FM-1 contributors. Retained source
notices and the distributed licence archive document their work; see
[licensing and attribution](../LICENSING.md) and
[SLOOP effect provenance](SLOOP_PUNCH_FX.md).
