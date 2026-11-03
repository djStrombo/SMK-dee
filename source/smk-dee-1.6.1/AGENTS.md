# Source attribution

- New Melodee code is credited to `Kerem Kilic (Ellic Studio)`; do not copy Leo Kuroshita's copyright header into independently written files.
- Preserve the applicable SPDX licence identifier and all actual third-party notices.
- For mixed files, credit Melodee's work and identify retained Felucca code with `Portions Copyright (C) 2026 Leo Kuroshita (@kurogedelic), Hügelton Instruments`.
- Check source history and provenance when moving, extracting, porting or replacing code. A shared licence, include, protocol, or generic boilerplate does not establish authorship.
- Keep original notices on unchanged upstream code. Do not remove attribution merely because a derived file has extensive modifications.

# UI status placement

- Follow `docs/design/README.md` → “Status indicators” for new or changed indicators.
- Ongoing state belongs in the shared header and follows the state lifetime; reserve toasts for brief explanations and dialogs for decisions.

# Releases

- Release firmware must be built and attested by `zvenson/fm1-build/.github/workflows/build.yml@v1`, following its [README](https://github.com/zvenson/fm1-build#readme). Use a new reviewed version tag when upgrading the shared workflow.
- Keep host/web tests blocking, verify the firmware attestations, and publish the draft only after the complete recovery set and checksums pass validation. Do not substitute a local build for the attested packages.
- Follow [BUILDING.md → Releases](BUILDING.md#releases) for the release process and verification command.
