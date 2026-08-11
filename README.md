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
- Native install prompt plus iPhone/iPad, MacBook, and browser guidance.
- Pre-update data checkpoint that blocks unsafe service-worker reloads.
- Automatic recovery from the previous valid local record.
- Versioned JSON backup export protected by a SHA-256 checksum.
- Validated JSON backup restore with preview, rollback, and one-level undo.
- IndexedDB v2 mirror with migration, corrupt-record quarantine, and fallback.
- On-device storage usage plus an isolated translation-cache clear action.
- Storage-pressure warnings at 80% and 95%, with backup-first recovery guidance.
- Keyboard navigation, route focus, and progressive screen-reader descriptions.
- A redacted local diagnostic download with counts and capability flags only.
- A restrictive content-security policy plus automated API, license, and dependency audits.
- A 20,000-Hanzi reader fixture that guards the long-document render budget.
- Eight production-browser journeys across desktop and mobile Chrome profiles.
- Root and configurable subpath PWA builds with an artifact contract check.
- GitHub Actions builds on Ubuntu, Windows, and macOS and retains QA evidence.
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
npm run audit:security
npm run build
npm run test:e2e
```

`npm run test:e2e` requires a locally installed stable Google Chrome. CI uses
the Chrome installation on its hosted Ubuntu runner.

Build for a project subpath such as GitHub Pages:

```bash
SCOTTBOOK_BASE_PATH=/scottbook/ npm run build
SCOTTBOOK_BASE_PATH=/scottbook/ npm run preview
```

Use the same base for build and local preview. The default remains `/`. The
release verifier rejects manifest, icon, service worker, version, or
deployment-base drift before a build can pass.

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

Reading progress, favorites, and reader settings are device-only records. In
version 0.6 they are mirrored transactionally to IndexedDB v2 while the proven
versioned `localStorage` records remain as a compatibility and browser fallback.
ScottBook stores the last sentence id rather than a scroll offset, so resuming
still works when the window or font size changes.

Version 0.3 adds a v2 local-state schema for reading history and completion.
Existing v1 progress and favorites migrate automatically on first load; the old
key is left untouched as a local fallback. Resetting an article removes its
progress/completion while retaining the fact that it was opened.

No account, cloud sync, analytics, or network request is involved. IndexedDB now
has isolated stores reserved for books, progress, settings, learning events,
translation cache, metadata, and quarantined records. External-book import is
still disabled.

Version 0.4 keeps the previous valid v2 record before replacing the primary
record. If the primary JSON later becomes corrupt, startup falls back to that
local safety copy before trying the legacy v1 key. The Review screen can also
request persistent browser storage and download a versioned JSON backup.

Version 0.5 can restore that backup entirely offline. ScottBook rejects files
larger than 2 MB, malformed JSON, unsupported formats, invalid reading-state
schemas, and checksum mismatches before showing a preview. Nothing is written
until the reader confirms. The confirmed restore writes the reading state,
theme, and font size as one guarded transaction; a failed write rolls every
touched key back to its exact prior value. A successful restore keeps one local
undo record so the previous state can be restored after a refresh as well.

Backup restore is not external-content import: ScottBook still does not accept
TXT, EPUB, pasted books, or unannotated reading content in this version.

Version 0.6 migrates a complete valid v0.5 local snapshot into IndexedDB on the
first open. A v1 database fixture upgrades to v2 without losing valid progress
or settings. Invalid IndexedDB progress/settings records are moved to a
quarantine store instead of being used to overwrite good data; a valid half of
the snapshot is preserved while the damaged half falls back safely. If
IndexedDB is unavailable, ScottBook continues with the existing `localStorage`
path.

Restore and one-level undo now coordinate both storage layers. If the IndexedDB
transaction rejects, all touched `localStorage` keys return to their exact
previous bytes. The Review screen reports origin usage, schema/cache/quarantine
counts, and can clear only the translation-cache store. That action cannot
delete books, progress, favorites, or settings.

## Controlled PWA updates

The generated service worker uses prompt mode. A waiting version displays a
"Có phiên bản ScottBook mới" notice; it cannot reload the page by itself. Even
when another tab activates the worker, the current tab defers reloading until
the user accepts. This keeps the active reader position and local writes safe
from an unexpected mid-session refresh.

Version 0.7 adds a compatibility gate before every accepted update. ScottBook
validates the current library/settings schema, writes the newest state as a
guarded `localStorage` transaction, and waits for queued IndexedDB writes before
activating the waiting service worker. A failed local safety write blocks the
update and keeps the current app running. If IndexedDB alone fails, the complete
local snapshot becomes the next version's migration source.

An update dismissed with “Để sau” remains reachable through a compact update
action; there is no background reload loop. Missing article routes render an
explicit online/offline recovery screen instead of a blank page.

## Accessibility, diagnostics, and security

Version 0.8 gives every route a descriptive document title and moves keyboard
focus to its main content after navigation. A skip link bypasses repeated
navigation without changing the hash route. In the reader, Left/Right Arrow,
Home, and End move between word controls; Escape closes the assistance panel
and restores focus to the selected word. Screen readers receive a progressive
description that matches the current Hanzi → pinyin → meaning interaction.

Long paragraphs use browser content visibility so off-screen work can be
deferred. The test suite also renders a deterministic 20,000-Hanzi fixture under
a two-second processing budget. This is a regression guard for application
work, not a claim that every device will paint or scroll at the same speed;
real-device checks remain part of the release-candidate sprint.

The Review screen can download a diagnostic JSON file entirely on the current
device. It contains app/runtime capability flags, aggregate content and reading
counts, storage pressure, and store counts. It excludes article identifiers,
reading text, titles, user-agent strings, and network destinations, and it is
never uploaded by ScottBook. Origin usage enters warning state at 80% of quota
and critical state at 95%; recovery guidance asks for a backup before any cache
cleanup.

The app shell now declares a restrictive content-security policy. CI rejects
production use of dynamic code evaluation, direct HTML injection, high-severity
runtime dependency advisories, or runtime packages outside the audited
permissive-license set. Development websocket access remains limited to local
Vite hosts. External-content import remains disabled.

## Release qualification

Version 0.9 adds production-browser journeys for reading assistance, persisted
theme/favorites, JSON backup/restore/undo, anonymized v1 migration, and an
offline service-worker reload. Every journey runs in desktop and mobile Chrome
profiles. The test exposed and now guards the mobile reader's accessible back
button name.

CI also verifies the production build on Ubuntu, Windows, and macOS. A separate
root/subpath artifact contract prevents a PWA built for `/scottbook/` from
silently pointing its manifest, icons, or navigation fallback at `/`.

This is release qualification, not a claim that 1.0 is ready. The exact
automated evidence and physical-device matrix are in
[`docs/release/SCOTTBOOK-v0.9.0-RC.md`](docs/release/SCOTTBOOK-v0.9.0-RC.md).
The intentionally visible blockers are in
[`docs/release/KNOWN-LIMITATIONS.md`](docs/release/KNOWN-LIMITATIONS.md).
Android APK signing, the final content count, and Safari/iPhone/Android
real-device evidence remain unresolved. Import remains disabled.

## Install ScottBook

Chromium browsers on Android, Windows, macOS, and Linux can expose ScottBook's
native install dialog directly in the app. The invitation can be dismissed
persistently and reopened from the small “Cài app” action.

On iPhone and iPad, open ScottBook in Safari, choose **Share**, then **Add to Home
Screen**. On macOS Safari, choose **Share → Add to Dock**; Chrome and Edge use
their install action in the address bar. The manifest includes 192 px, 512 px,
maskable, and Apple touch icons.

All three built-in reference articles are compiled into the precached app shell,
so they remain available in airplane mode without a separate download. External
TXT/EPUB content and cache-on-demand imported books remain intentionally
disabled until the import research phase is approved.

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
