Melodee 1.4.4 adds signed build provenance to the
[1.4.3 release](RELEASE_1.4.3.md). The synthesizer, controls, audio configuration
and project format are unchanged from 1.4.3.

- **Shared FM-1 builder:** release firmware is built and tested by
  [zvenson/fm1-build](https://github.com/zvenson/fm1-build) at its reviewed `v1` tag.
  GitHub signs an attestation for the firmware package and application binary,
  tying their hashes to this release's public source commit and builder.
- **Verified publication:** host/web tests block the build. The complete release
  stays in draft until the firmware attestations and all four native recovery
  archives pass validation. Stable installer and manual publication are retained.
- **Compatibility:** use the same projects, templates and presets as 1.4.3.
  The compatibility limits described in the 1.4.3 notes still apply.

Verify the downloaded firmware with the GitHub CLI:

```sh
gh attestation verify melodee-1.4.4.fwsc --repo keremimo/melodee \
  --signer-workflow zvenson/fm1-build/.github/workflows/build.yml \
  --source-ref refs/tags/v1.4.4
```

Downloads include firmware, the application binary, native UBOOT recovery tools
for Windows x64, macOS Apple Silicon, macOS Intel and Linux x64, and licence
notices. `BUILD_INFO.json` and `SHA256SUMS` remain available alongside the signed
GitHub attestations. Build provenance does not establish physical audio, control
or hardware safety validation.
