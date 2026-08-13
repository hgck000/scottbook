# ScottBook v0.9.0 release qualification

Date: 2026-08-11
Status: qualification build, not yet the 1.0 Release Candidate

## Decision

Version 0.9.0 establishes repeatable release evidence for the current PWA. It
must not be tagged 1.0 yet. Automated browser journeys pass for desktop and
mobile Chromium profiles, while real Safari, installed PWA, and Android APK
checks remain explicit manual or product blockers.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Content, state, backup, restore, IndexedDB, PWA lifecycle, accessibility helpers, diagnostics | 62/62 passed |
| Browser journey | Read, pinyin, contextual meaning, theme, favorite persistence | Passed on desktop and mobile Chromium profiles |
| Browser journey | JSON backup, checksum preview, restore, one-level undo | Passed on desktop and mobile Chromium profiles |
| Browser journey | Anonymized local schema v1 migration to v2 | Passed on desktop and mobile Chromium profiles |
| Browser journey | Service-worker-controlled offline reload of a built-in article | Passed on desktop and mobile Chromium profiles |
| Artifact contract | Manifest, icons, CSP, service worker, app version, no test dependency in bundle | Passed for `/` and `/scottbook/` bases |
| Security | Dangerous API scan, runtime licenses, high-severity runtime audit | Passed locally; required again by CI |

The eight browser cases run against the production build rather than the Vite
development server. The local evidence used Chromium 149 in headless mode. CI
uses the stable Google Chrome already present on the GitHub-hosted runner.
Subpath preview smoke also returned HTTP 200 for the page, manifest, and service
worker when build and preview both used `SCOTTBOOK_BASE_PATH=/scottbook/`.

## GitHub Actions evidence

Every push and pull request now creates three independent signals:

1. Core quality on Ubuntu: audit, lint, typecheck, unit tests, root build, and
   `/scottbook/` subpath build.
2. Production browser journeys in desktop and mobile Chrome profiles, with a
   Playwright report retained for 14 days.
3. Typecheck, tests, and production builds on current Windows and macOS runners.

The subpath build is uploaded as `ScottBook-PWA-<commit>` for QA. It is a static
web artifact, not an APK and not a desktop executable.

## Manual device matrix

These rows require physical or vendor-native browsers. Do not mark a row passed
from viewport emulation alone.

| ID | Target | Required journey | Status |
| --- | --- | --- | --- |
| M-01 | Windows 11 Chrome | Install PWA, read, close/reopen, offline reload, backup download | Pending real device |
| M-02 | Windows 11 Edge | Install PWA, update prompt, retain progress after update | Pending real device |
| M-03 | macOS Safari | Add to Dock, reader keyboard/focus, offline reopen | Pending real device |
| M-04 | macOS Chrome | Install PWA, backup/restore, controlled update | Pending real device |
| M-05 | Android Chrome | Install PWA, touch assistance, airplane-mode reopen, safe area | Pending real device |
| M-06 | iPhone Safari Home Screen | Add to Home Screen, touch assistance, offline reopen, safe area | Pending real device |
| M-07 | Android APK | Fresh install, offline use, Back, upgrade retaining data | Owner-signing path ready; key setup, real-device run, and v0.28 → v0.29 upgrade evidence pending |

For each manual run record device model, OS/browser version, install mode,
result, screenshot/video evidence, and any issue ID. A failure that loses data
or prevents opening/updating is Blocker; a security/privacy failure is Critical.

## Release decision rules

The current PWA may move from v0.9 qualification to a named 1.0 RC only when:

- GitHub Actions is green on the exact candidate commit.
- M-01 through M-06 have evidence or an explicitly accepted platform exclusion.
- No Blocker or Critical issue remains.
- The content-count target and HSK system are approved, or the smaller content
  scope is explicitly accepted for 1.0.
- Android distribution is either completed with a durable signing key or
  explicitly removed from the 1.0 promise.
- The known limitations document matches the shipped behavior.

External Paste/TXT/EPUB import remains outside this gate until separately
re-approved.
