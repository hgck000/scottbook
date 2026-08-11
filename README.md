# ScottBook

ScottBook is an offline-first Chinese reading app. It reveals help gradually:

1. Read the original Hanzi.
2. Tap a word once to reveal its authored pinyin.
3. Tap it again to reveal its contextual Vietnamese meaning and sentence translation.
4. Tap a third time to close the help panel.

The first vertical slice is a React + TypeScript PWA. Android packaging with
Capacitor will use the same frontend in a later sprint.

## Current status

- Responsive reference library and reader.
- Three pilot articles covering HSK 1, HSK 2, and HSK 3.
- Every built-in word already contains pinyin and a Vietnamese meaning.
- Every built-in sentence already contains a Vietnamese translation.
- No translation, pinyin, analytics, or content API call at reading time.
- Paper/night themes and adjustable reader text size.
- Reading position saved as a stable sentence anchor on the current device.
- A continue-reading card, per-article progress, and a local favorites filter.
- A local reading-history screen with open counts and latest-reading order.
- Automatic/manual completion status and a reset-progress action.
- Explicit online/offline and first-install offline-ready notices.
- Controlled PWA updates that reload only after the reader accepts.
- Automatic recovery from the previous valid local record.
- Versioned JSON backup export protected by a SHA-256 checksum.
- Generated service worker precaches the complete prototype.
- Import is intentionally deferred while its language-processing design is evaluated.

## Run locally

Requirements: Node.js 24 and npm 11 or newer.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Preview the production PWA:

```bash
npm run preview
```

## Offline content contract

Reference articles live in `src/content/builtInLibrary.ts`. They are authored as
version-controlled data, not generated in the browser. A word token is invalid
without Hanzi, tone-marked pinyin, and a Vietnamese meaning. A sentence is
invalid without a Vietnamese translation.

`npm run build` first executes the content validation test. Incomplete reference
content therefore fails both the local production build and GitHub Actions.

## Local reading data

Reading progress and favorites are small, device-only records stored in
`localStorage` under a versioned key. ScottBook stores the last sentence id rather
than a scroll offset, so resuming still works when the window or font size
changes. Invalid or outdated stored JSON falls back safely to a clean state.

Version 0.3 adds a v2 local-state schema for reading history and completion.
Existing v1 progress and favorites migrate automatically on first load; the old
key is left untouched as a local fallback. Resetting an article removes its
progress/completion while retaining the fact that it was opened.

No account, cloud sync, analytics, or network request is involved. Larger book
content and future imports will use a separate IndexedDB layer when that sprint
starts.

Version 0.4 keeps the previous valid v2 record before replacing the primary
record. If the primary JSON later becomes corrupt, startup falls back to that
local safety copy before trying the legacy v1 key. The Review screen can also
request persistent browser storage and download a versioned JSON backup. Backup
restore/import remains disabled until file validation and rollback are designed.

## Controlled PWA updates

The generated service worker uses prompt mode. A waiting version displays a
"Có phiên bản ScottBook mới" notice; it cannot reload the page by itself. Even
when another tab activates the worker, the current tab defers reloading until
the user accepts. This keeps the active reader position and local writes safe
from an unexpected mid-session refresh.

## GitHub linking

Create an empty GitHub repository named `scottbook` under `hgck000`. Do not add a
README, license, or `.gitignore` in the GitHub form because this local repository
already contains them. Then run:

```bash
git remote add origin https://github.com/hgck000/scottbook.git
git push -u origin main
```

This repository is configured locally with:

```text
user.name  = hgck000
user.email = 126417436+hgck000@users.noreply.github.com
```

Commits intentionally contain no assistant/bot co-author trailer. The noreply
address protects the account email while allowing GitHub to associate commits
with `hgck000`.
