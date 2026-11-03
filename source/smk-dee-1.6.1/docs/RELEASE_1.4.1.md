Melodee 1.4.1 fixes **Return to official V15** in the web installer.
It includes the features and compatibility rules of [1.4.0](RELEASE_1.4.0.md).

- **Stock restore accepts Melodee 1.4 backups.** The installer incorrectly required
  the older motion-protocol version before starting a full backup. Melodee 1.4
  reports motion v2 while retaining the same supported backup protocol, so the
  default stock-restore flow stopped before flashing. The installer now checks
  the backup capability independently of motion and UI versions.
- **Existing 1.4.0 users can restore stock directly.** Refresh the web installer,
  open **Return to official V15**, and select the unmodified official M-VAVE
  `FM-1.fwsc`. Installing 1.4.1 first is unnecessary. The installer saves a complete
  backup before asking to flash; the existing explicit **Skip backup** option
  remains available. Stock firmware may overwrite Melodee music, sounds and settings.
- **Device identifiers remain compatible.** Automated update tests cover stock
  restore from development, 1.4.0 and 1.4.1 identities, USB port-name changes, and
  resuming an interrupted update. The returned stock identity is verified as
  `FM-1_015`.

The 1.4.1 firmware and native recovery downloads carry the updated release version.
There are no synthesis, sequencing, storage-format or device-identifier scheme changes.

Validation includes the firmware build and full host suite, the installer regression
that reproduces the 1.4 failure, and the firmware's staging path with the original
SHA-256-verified official V15 package. Stock-loader corruption and mismatched device
flash heads remain rejected. A read-only check of a connected 1.4.0 device confirmed
that the old page rejects its backup capability and the fixed page accepts it.
A physical flash to stock and back was not performed for this release.

Install: https://keremimo.github.io/melodee/
