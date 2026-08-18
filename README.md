# dsh-file-manager — Right-panel file manager + `@` file references for the DSH web GUI

[English](README.md) | 中文 ([README.zh.md](README.zh.md))

> A plugin for the DeepSeek Harness desktop shell (`dsh web`): an **Explorer file panel + Preview panel** on the right of the chat area (a pixel-faithful re-implementation of FileManager, Apache-2.0 reference, not a copy), plus **`@` file references** in the composer (tree multi-select modal + in-composer chips with line numbers). Everything is driven by the real filesystem and real git — no mocks.

## Features

### Right panels

- **Explorer (rightmost column)**: `Files / Changes` tabs.
  - File tree: click to expand/collapse folders, open files; filename search on top (150ms debounce, click-to-locate).
  - Git changes: real `git status` (porcelain v1 -z) with stage / unstage / discard (untracked → delete, tracked → restore; batch discard requires confirmation).
  - Tree context menu: copy path, copy name, reveal in file manager, open with default app, rename, new file, new folder, delete (double-confirmed).
  - Drag a file row into the composer to insert its relative path into the draft.
- **Preview (second-right column)**: multi-tab preview for markdown / html / code / diff / csv / pdf / word / excel / ppt / image / text / url. Source/preview toggle, split editing (persisted ratio), save (mtime conflict detection), download, refresh, middle-click close, right-click batch close.
- **Mermaid**: ```mermaid blocks in markdown preview render as charts; the runtime ships inside the plugin (same-origin, offline-capable, follows the theme).
- Dark/light themes, per-project persisted preferences, master switch (Settings → Web UI plugins).

### `@` file references (highlight)

Typing `@` in the composer opens a **pi-desktop-style tree multi-select modal** (lazy directory tree + filename search + checkboxes):

- Picked files/directories land as **in-composer chips** (green `</>` glyph + basename + line range); the reference text stays hidden and is only serialized to `@<relative-path>:<lines>` plain text on send.
- **Line numbers**: a full-file reference carries the file's line count (`@path:1-N`); selecting a code range in the preview and clicking **Add to chat** produces a chip with just that range (`@path:start-end`).
- Chips are native dsh reference objects (not text decoration): Backspace deletes the whole chip, copy/paste keeps semantics, submit serializes through the plugin's registered `file` reference codec.
- Directory references use plain `@path/ ` text (no line concept).

## Install

```sh
# From npm (once published)
dsh plugin --profile web add @lijian-ui/dsh-file-manager

# Direct link from this repo (dev/onboarding; lib/ is committed, clone-and-use)
git clone https://github.com/lijian-ui/dsh-file-manager.git
cd dsh-file-manager
dsh plugin --profile web add link:$(pwd)
```

Restart `dsh web` after installing; open a project session to see the panels, and type `@` in the composer for file references.

> The desktop shell (dsh-desktop) develops against this via a local symlink (`node_modules/@lijian-ui/dsh-file-manager → extensions/file-manager`); after editing the source, `npm run build` regenerates `lib/`, then restart dev.

## Architecture

- **Host half** (`src/index.ts` + `src/host/`): a cordis plugin exposing `/filemgr/*` HTTP routes — directory listing, file read (80k char text cap / image data URLs), write (mtime conflict detection), filename search, git status / stage / unstage / discard, and an SSE change stream. Every operation passes a **workspace gate** (realpath normalization + prefix check) and is **loopback-only**.
- **Browser half** (`src/client/`): framework-free state core (`store.ts`), drag engine (`drag.ts`), DOM layout controller (`layout.ts` — appends panel tracks to the shell's 3-column grid), React components (explorer / scm / preview / picker).
  - `picker/FilePickerModal.tsx` — the `@` tree multi-select modal (bridge + modal; opens on a bare `@` in the composer).
  - `file-source.ts` — registers the `file` input-trigger source (codec only; inert in the trigger menu).
  - `reference.ts` — chip insertion (`slash/input-insert-reference` bail; `@path:lines` serialization).
  - `preview/selection.ts` — preview selection → line-range mapping.
  - `styles/chip.module.css` — chip visuals (muted rounded pill + green `</>` glyph, global override of `[data-decoration="chip"]`).
- **Workflow**: after editing, `npm run build` (regenerates `lib/`) AND a dev restart are both required — neither substitutes for the other.

## Build

```sh
npm install
npm run build      # tsc -b + tsdown → lib/
npm run test       # vitest
```

## Attribution

This project is a re-implementation of FileManager (iOfficeAI/FileManager, Apache-2.0): dimensions, colors, motion, and interaction parameters were measured from v2.1.53; the implementation is new code and does not reproduce upstream source. Upstream copyright belongs to the FileManager project; this project retains attribution per the Apache-2.0 license.
