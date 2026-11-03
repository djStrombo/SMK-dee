# Melodee 1.5.1

Hotfix for the web editor connection error introduced with Melodee 1.5.

## Web editor connection

- Fixes **“Error: Invalid favorites reply”** when opening the web editor with
  1.5 firmware. The editor no longer requests factory favorites for MIDI Track,
  which has no favorite storage and rejects that request.
- MIDI Track remains selectable. Its unsupported star control is disabled;
  factory sound favorites and favorites in the shared user library still sync.
- Adds a regression check covering startup with the complete factory lists and
  all 384 shared user slots. The simulated device now enforces the released
  firmware's favorite namespace limits.

The updated [web editor](https://keremimo.github.io/melodee/webapp/editor/) also
works with **1.5.0 firmware**. Refresh the editor to receive the fix; reflashing
is not required. The 1.5.1 firmware and recovery packages carry the new version;
audio processing, device controls and stored project formats are unchanged.
See the [1.5.0 release notes](RELEASE_1.5.0.md) for features and compatibility.

## Release validation and downloads

Firmware is built and attested by the reviewed
[`zvenson/fm1-build` workflow at `v1`](https://github.com/zvenson/fm1-build/tree/v1),
with host and web tests blocking publication. The release pipeline verifies
firmware/application provenance, matching application bytes, all four native
recovery archives and their checksums before publishing the complete release.
Automated checks do not establish physical audio, timing or USB interoperability.

Downloads include the dual-core firmware, application binary, recovery tools
for Windows x64, macOS Apple Silicon, macOS Intel and Linux x64, licence notices,
`BUILD_INFO.json` and `SHA256SUMS`. Verify the firmware with:

```sh
gh attestation verify melodee-1.5.1.fwsc --repo keremimo/melodee \
  --signer-workflow zvenson/fm1-build/.github/workflows/build.yml \
  --source-ref refs/tags/v1.5.1
```
