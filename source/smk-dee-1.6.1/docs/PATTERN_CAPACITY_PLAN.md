# Nightly capacity: eight patterns, 64 steps

Nightly retains eight patterns per track, 64 steps and 1,024 precise recorded
notes across the project. The 16-pattern, 128-step and 2,048-note experiments
are withdrawn from this branch. No experimental build switches, expanded
project schema, larger note store or shared-spare project layout are enabled.

Keep the independent RAM optimizations: shared main-loop scratch, recording
release-queue storage, compact event and step snapshots, sparse undo,
banded display rendering, streamed A/B project staging, exclusive FX state,
optional USB capture lanes, bounded audio batches and SRAM-tail allocation.
Take Taker still pauses globally while a recording is active. Implementation
measurements are in `RAM_OPTIMIZATION_PROGRESS.md`.

The normal FBKK/FUN22 saved formats and four A/B project slots remain intact.
Archives from the later FBKL/FBKM/FBKN experiments are not silently truncated
into eight-bank projects. The experimental source and build artifacts remain
archived locally for recovery; this change does not rewrite saved device data.
