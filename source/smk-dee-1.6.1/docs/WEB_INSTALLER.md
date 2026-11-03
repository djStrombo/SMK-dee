# Web installer

The installer uses Saadet's actual page, styles and controller from
`keremimo/saadet` at `f358c01` (introduced in `036b97e`): connect, choose the
optional recovery bootloader, confirm the checks, then install in its own
progress screen. It includes the same bootloader-only plan, partial-success
screen, recovery advice, English/Japanese language selection and simulated
`?demo` mode. Melodee adds its stable/history, RC and nightly choices in the
installation card and retains its checked stock/Transit backup paths.

Original MPL-2.0 notices remain on the ported files. The page combines MPL
layout with retained GPL Melodee sections; the existing leaving-firmware
adapter and its session are GPL-3.0-only. See `LICENSING.md`.

`web/make_site.py` checks and inlines the libraries, styles, controller and
package SHA-256 metadata. The result is self-contained, including the demo;
there are no runtime dependencies on Saadet or an external JavaScript service.

- Timestamped MIDI responses avoid throttled page timers between a device
  request and its answer. The original CHECK HEAD address is retained for
  diagnostics. Application packages go only to their expected update loader.
- A Web Lock excludes other installer tabs during discovery, writes and crash
  readout. Worker timers, screen wake locks, visibility feedback and an unload
  warning keep the transfer running and explain its state. Lock errors stop
  an attempt; a wake lock granted after cleanup is released.
- Preflight requires a backup acknowledgement for application updates; cancel
  releases the lock without writing. Interrupted writes retain the selected
  version, commit and package hash. A different build cannot resume them.
- Pinned stock V15 and TransitFM1 checks, automatic backup, explicit backup
  opt-out and separate loader restrictions remain. Open firmware is blocked.

## m-bootloader

The unchecked option uses Julius Vitkauskas's unmodified MIT-licensed FM-1
m-bootloader v1.2 release, source `22e2559906f9fc4e077f2d6aee20bf332300439e`.
`web/mboot.py` pins the installer, plain boot container and original licence;
publication fails before writing anything if a copy differs. The full MIT
notice travels beside the published files. See `web/m-bootloader/README.md`.

The application is updated and its returned identity checked first. The boot
installer then runs as a separate staging transaction, without a MIDI loader
phase. A matching installed release can use the bootloader-only plan. Nightly
always updates the app first: `FM-1_900` cannot identify a particular build
and is also used by other firmware. Older applications refuse the boot package
without writing the boot area; install the current nightly first.

Melodee accepts only the pinned boot writer: it checks its load address and
size, streams it to the staging area, verifies CRC16 and a pinned SHA-256 on
flash readback, then writes its staging header and waits for host confirmation.
All existing app and official-loader restrictions remain. Staging writes only
`0xE0000..0xE4FFF`; the upstream installer later replaces the boot area while
preserving the application and user data. Losing power during that boot-area
write can require hardware recovery, as the page explains.

The browser distinguishes a bootloader refusal after a completed app update
from an interrupted app write. A bootloader failure never offers app-loader
resume. Missing or mismatched firmware after restart remains unverified.
Application return confirms restart; hold PLAY at power-on to verify that the
recovery menu is installed. No physical bootloader installation was performed
as part of this port.

## Crash report and validation

The same Report a problem section reads Saadet's `F0 7D 4C 47 F7` framing.
Melodee implements a read-only response using its retained CPU0 and CPU1 fault
records, ending with `end`. It does not clear records, reset or write flash.

After building, run `npm ci --prefix web` and `tests/run_tests.sh`. Focused
checks: `node web/test_install_safety.mjs`, `node web/test_installer.mjs`,
`node web/test_transit.mjs` and `python3 tests/nightly_site_test.py`.
The browser suite executes the actual published bundle with real DOM elements
and simulated MIDI, covering firmware plus boot, boot-only, refusal, altered
packages, wrong return identity, loader isolation, cancellation, background
timers, tab exclusion and same-build recovery. Native tests exercise actual
staging, a modified writer with repaired CRCs, lost confirmation and bounded
read-only crash replies.

An offline ASan/UBSan check of m-bootloader v1.2's actual `core.c` mounts
Melodee's generated app at `0x4000`, entry `0x02000120`, accepts all app file
checksums and rejects a deliberately damaged app. The synthetic package head
is not a raw-flash boot-replacement fixture; normal Melodee app updates preserve
the device's existing boot head. Software checks do not establish physical USB,
audio, power-cut or recovery-menu behavior on this hardware.
