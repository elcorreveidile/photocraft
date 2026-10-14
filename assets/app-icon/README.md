# WordNext Photo app icon

The **WordNext monogram**: a white "W" inside an octagonal frame on a green rounded square (the
WordNext brand, `#008a4b` to `#38b06a`). It replaces the upstream PhotoCraft icon (a kitsune) in this
fork.

## Files

- `photocraft.svg` and `photocraft-small.svg`: the monogram (the same artwork; also the hicolor
  scalable icon).
- `photocraft-1024.png`: 1024 px render.
- `photocraft.icns`: macOS bundle icon (PNG chunks 128, 256, 512 and 1024 px).
- `photocraft.ico`: Windows icon, 16 to 256 px, embedded in the `.exe` by `apps/photocraft/build.rs`.
- `hicolor/<size>/apps/ai.storyteller.photocraft.png` (16 to 512) and `hicolor/scalable/...svg`:
  Linux icon theme and the in-app brand mark (`crates/ui-egui/src/brand.rs`).

File names are kept from upstream so packaging and code do not change. License: see `LICENSE.txt`.
