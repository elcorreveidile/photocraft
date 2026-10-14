# WordNext Photo (fork of PhotoCraft)

WordNext Photo is WordNext's build of [PhotoCraft](https://github.com/storytold/photocraft),
an open-source image editor written in Rust (MIT OR Apache-2.0). This fork exists to ship a
browser build (WebAssembly) under the WordNext name, served from WordNext.

## Rules for this fork

- **Upstream copyright and licence stay.** `LICENSE-MIT`, `LICENSE-APACHE`, `NOTICE` and
  `ATTRIBUTION.md` are not edited, except to add WordNext lines below the upstream ones.
- **ArtCraft marks never ship in our product.** `docs/brand/` is kept only because it is part of
  the upstream repository copy; the name, wordmark and "A" mark must not appear in the web build,
  our pages, installers or marketing. Product name: **WordNext Photo**.
- **Keep the diff small.** Branding changes go in the web shell (`apps/photocraft-web`) and in a
  few constants, so `git merge upstream/main` stays cheap. Crate and binary names stay
  `photocraft-*`.
- **Upstream remote:** `git remote add upstream https://github.com/storytold/photocraft.git`.

## Build the web version

```
rustup target add wasm32-unknown-unknown
cargo install trunk --locked
cd apps/photocraft-web && trunk build --release   # output: dist/web
```

## Status of the rebrand

- [x] Web shell: page title, loading and error text
- [ ] In-app strings ("PhotoCraft", Help menu, About dialog, Discord/ArtCraft links)
- [ ] Icon: replace the upstream app icon with a WordNext one
- [ ] Hosting: static deploy, headers, embed block in the WordNext editor
