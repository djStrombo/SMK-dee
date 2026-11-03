# Interrupted firmware updates

Melodee's boot protection is adapted from [ChoralRoot FM-1 v0.16](https://github.com/Quixotic7/ChoralRootFM1/tree/v0.16),
commit `9c7445cdd7b767c779741d28654fb59cca3acd97`, under GPL-3.0-only.
The shared `CRSTUB` entry signature and `CRBM` marker format are retained.
This applies to builds containing `firmware/stub/`; existing published releases
without the stub do not gain protection until one of these builds is installed.

## Recovery

If an application update is interrupted, switch the FM-1 on again. Three short
key-light flashes mean the USB MIDI update loader is starting. Reconnect the USB
cable, open the installer and install the same package again. Sectors that already
match the package are skipped; this restarts the transfer and finishes the flash
write rather than continuing a saved transfer position.

Hold **OCT− alone** while switching on to request update mode even with a complete
application. OCT− and OCT+ together remain the application's calibration gesture.
One long flash means the loader was unavailable or the handover failed, and the
stub requested ROM UBOOT instead. Follow [USB recovery](../BUILDING.md#recover-a-black-screen-fm-1).

## Flash layout and commit

| Flash range | Purpose |
| --- | --- |
| `0x00000..0x03FFF` | SDK SPL and chip configuration; never written by our updater |
| `0x04000..0x0411F` | Application directory |
| `0x04120..0x04FFF` | Boot stub; entered before the application |
| `0x05000..0x90FFF` | Application body, linked at XIP `0x02001000` |
| `0x91000..0x91FFF` | Completion-marker sector; marker at `0x91FE0` |
| `0x92000..0x92FFF` | Configuration files and application-slot padding |
| `0xE0000..0xE3FFF` | Retained USB update loader |
| `0xE4000..0xE4FFF` | Separate update-record sector |

The 20-byte marker stores magic, format, aligned body length, body CRC-32 and
marker CRC-32. At each boot the stub checks the marker and recomputes the body
checksum before entering application code. Its key scan powers the panel rail
(PA2 low) and samples OCT−, OCT+ and an idle row over approximately 48 ms, using
the final 12 samples to allow settling and reject bounce or a stuck row.

Before the first changed application sector is erased, the loader erases the
marker sector and verifies that it is blank. It then writes sector `0x4000` only
if different, verifies all remaining sectors, and writes the marker sector last,
with the marker in its last programmed page. A malformed marker in a stub image
is rejected before any erase. Legacy packages keep their original write order.

Four compensation bytes following the marker fix the application directory's
CRC-16 at `0x4352`. The directory and the boot stub therefore remain identical
across builds with the same stub and SDK layout, despite different body sizes,
checksums and build options. Ordinary updates skip the entire boot sector.

The stub verifies staged-loader headers, ownership signature, sizes and compressed
block-chain structure before writing the RAM `UPDATA_PARM` record and resetting
into the SPL. Compressed payloads are not decompressed/checksummed by the stub;
the application's staging path checks the package loader CRC and verifies its
flash writes. A retained rescue word permits one loader handover; another arrival
without a successful boot requests ROM UBOOT instead of looping indefinitely.
Cold-boot recovery does **not** depend on the flash copy of `UPDATA_PARM`: ChoralRoot's
hardware investigation found that copy did not recover an interrupted application.

Successful application boots keep a complete Melodee loader. Cleanup erases only
the separate record sector, retaining existing progress/error/retry handling.
Damaged or foreign staging is erased. Presets, projects, samples and settings
outside the update windows are untouched. The stub reserves 32 bytes at RAM
`0x01C7C000`; application retained state begins at `0x01C7C020`.

## First-boot data compatibility

The 1.3.5 storage safeguards also apply on the development line. Before USB
starts or a BOOT project/template loads, the complete settings envelope must
match Melodee's layout. Foreign or invalid settings replace retained RAM with
sane defaults and commit once through the A/B save, with visible progress and
retry after failure. A fork's longer PER5 object cannot be truncated into our
USB/global preferences. Validated settings receive an MDS version marker in
unused bytes of the retired DIGITAL favorites row, retaining the PER5 layout.
Compatible legacy settings and supported templates survive; unknown future
markers and recognizable but unreadable templates stay protected for backup.
Legacy layout compatibility does not prove which firmware last ran.

Projects and templates require known layout, parameter count, selection and
engine IDs. Unknown engines cannot wrap into existing ones. Rejected projects
remain OLD FORMAT and cannot auto-load or be automatically overwritten.
Settings cleanup does not format musical data. The development line retains
its tagged shared workload-budget preference; cleanup defaults it to the
standard budget. A settings-repair error also prevents preset migration from
replacing its failure screen.

## Preset reset policy from 1.3.6

Startup resets unsupported preset banks to empty defaults and clears unreadable
entries in otherwise readable banks. Compatible records survive; recognized
legacy Melodee banks still convert normally, including FM6 sidecars and Prophet
spill records. This deliberately discards unsupported preset contents. Backup
before updating if another firmware may need them. Projects keep OLD FORMAT
protection, and live writes remain guarded until boot or explicit replacement.

Each repair is displayed before its A/B write. Failure retains the prior
committed copy and stops further migration with a visible error. Restart retries
unfinished repairs; successful repairs do not repeat. Migration may then perform
its normal writes for the remaining recognized legacy banks.

Validation: the target build and full host suite pass, including reset/cut/retry
checks, preservation of good entries in partially readable legacy banks, multiple
FM6 sidecars across shared-cache reuse, and the existing 384-slot conversions.
Physical device validation remains pending.

## Limits and verification

The first installation of the stub, a stub change, or a directory/SDK layout change
must rewrite the boot sector. A power cut while that sector is erased or partially
written can still require hardware recovery. Keep the battery charged, connect
USB directly, and keep the computer awake. Installing older Melodee, stock firmware
or another package without a compatible stub removes this protection.

`firmware/stub/stub.lock` pins the stub version and SHA-256. A release build refuses
an unexpected stub; an intentional change requires a version bump, rebuilding with
`FM1_STUB_LOCK=update`, and release notes explaining the boot-sector rewrite.
The stub is compiled independently of application options, with no RAM data or
BSS and no application/HAL dependency. The build caps compressed loader size below
the separate record sector and caps the body below the marker sector.

Automated coverage:

- `tests/boot_stub_test.c`: CRCs against independent references; torn/invalid markers;
  loader-header and block-chain damage; rescue-key bounce, calibration and stuck rows;
  RAM requests, retry fallback, and exact SPL handover record.
- `tests/boot_stub_pkg_test.py`: varied body lengths, maximum size, overflow rejection,
  independent directory CRCs, and identical boot sectors across different bodies.
- `tests/loader_powercut_test.c` with `tests/boot_fixtures.py`: power cut after every
  erase and programmed page; boot decision from each state; bit-exact reinstall;
  first install, same-stub update, changed-stub update and mixed legacy firmware.
- `tests/ota_test.c`, `tests/ldr_test.c`, Python/JavaScript installer tests: retained
  loader, cleanup failures/retry, chip-key refusal, bounded writes and data preservation.

Synthetic fixtures live under `build/host/boot-fixtures` and must never be installed.
The host model does not prove physical boot behavior, USB enumeration after a cold
start, or power loss during a NOR operation. Hardware validation remains required:
normal warm/cold boots, OCT− rescue, both-key calibration, interrupted ordinary
updates followed by cold-boot recovery and reinstall, and preservation of musical
data. Do interruption testing only with an independent recovery route available.

Validation on 2026-10-14: default, resident-audio dual-core and resident-audio
single-core target builds passed; both release configurations produced identical
sector `0x4000`. The host suite with `SOUND=0` passed. The four synthetic update
scenarios exercised 8,555 cut points, including 2,126 with an unchanged stub and
no unprotected state. An additional single-core to dual-core update exercised
2,126 cut points with no unprotected state. Stub tests passed 16,143 checks,
package tests passed 265 checks, and the two staged-loader checkers agreed on
20,480 damaged copies. These are automated results; no device was flashed or
physically power-cycled for this change.
