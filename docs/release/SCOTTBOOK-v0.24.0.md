# ScottBook v0.24.0 PWA readiness hardening

Date: 2026-08-13
Status: Focused personal-reader milestone; not a 1.0 Release Candidate

## Outcome

Version 0.24 makes two important PWA states explicit and durable without
changing ScottBook's reading or local-data model.

First, the compact status now distinguishes:

- **Có mạng · đang chuẩn bị offline** while the service worker is not ready;
- **Có mạng · sẵn sàng offline** after the app shell is active;
- **Có mạng · offline chưa sẵn sàng** when registration failed or is not
  supported; and
- **Đang ngoại tuyến** after the current device loses its connection.

Readiness is restored from an already controlling or active service worker on
later app opens. It therefore remains visible after the one-time first-cache
notice has been dismissed and after a controlled reload.

Second, a long-running installed PWA now asks its same-origin service-worker
registration to check for a newer build when:

- the app returns to the foreground;
- the device reconnects; or
- the hourly background timer becomes due while the app is visible and online.

Checks are throttled to at most one attempt per hour, skipped while hidden or
offline, and coalesced while one attempt is already running. A failed check is
absorbed so it cannot interrupt reading. Finding a newer worker still enters
ScottBook's existing controlled update flow: the app displays a prompt, writes
a local-data safety point, and reloads only after the reader accepts.

## Local-data and network contract

Version 0.24 adds no local-data field, IndexedDB migration, backup field, cache
store, account, analytics event, score, streak, goal, gamification, or remote
content service. Existing v0.23 data and backups remain compatible.

The periodic request is limited to the deployed ScottBook service-worker file.
It does not send reading content, search terms, progress, vocabulary, device
identity, diagnostics, or other personal data. The nine authored articles stay
inside the precached application bundle.

## Manual verification

1. Open ScottBook online in a clean Chrome or Edge profile and dismiss the
   install invitation if it covers the status chip.
2. Confirm the compact status progresses to **Có mạng · sẵn sàng offline**.
   The first installation may briefly show **đang chuẩn bị offline** first.
3. Dismiss the one-time **ScottBook đã sẵn sàng để đọc khi mất mạng** notice,
   then reload. Confirm the compact status still says **sẵn sàng offline**.
4. Open **Buổi sáng của tôi**, reveal `早上`, and remember the current Reader
   position.
5. In browser DevTools, switch Network to **Offline**, then reload the Reader
   URL. Confirm the article, `zǎoshang`, and authored Vietnamese help remain
   available and the status says **Đang ngoại tuyến**.
6. Restore Network to **Online** and dispatch a normal reconnect by reopening
   the tab if needed. Confirm the status returns to **Có mạng · sẵn sàng
   offline**.
7. Leave ScottBook in a background tab and return to it. Confirm the page does
   not reload, Reader position is unchanged, and no update notice appears when
   no newer deployment exists.
8. On a deployment where a newer ScottBook build is waiting, return to the tab
   or reconnect. Confirm **Có phiên bản ScottBook mới** appears but the page
   does not reload by itself.
9. Choose **Để sau**. Continue reading and confirm the compact **Cập nhật**
   action remains available.
10. Reopen the update notice and choose **Cập nhật bây giờ**. Confirm the app
    checkpoints local data, reloads, and retains the article position,
    favorites, assistance history, and Reader preferences.
11. Repeat steps 2–6 in an installed PWA window at about 390 px width. Confirm
    the longer readiness labels do not cause horizontal overflow.
12. Treat Chrome viewport emulation as UI evidence only; Android Chrome,
    iPhone Safari Home Screen, Windows installed PWA, and macOS installed PWA
    still require their physical-device checks.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Active/controlled worker readiness, unsupported/error states, connection labels, visible/online/hourly update scheduling, throttling, failure isolation, existing PWA update safety | 131/131 passed |
| Lint and type check | React, TypeScript, service-worker lifecycle, and hooks rules | Passed |
| Browser matrix | Controlled reload → persistent readiness → offline/online transition, plus prior journeys | 34 cases defined; local run blocked before launch because this workspace has no Chrome executable |
| Security | Browser API policy, runtime licenses, dependency advisories | Passed; 0 vulnerabilities |
| Root + `/scottbook/` artifacts | Manifest, service worker, navigation fallback, and deployment contracts | Passed |
| Base-branch CI | v0.23 pushed baseline | GitHub Actions #23 passed |

GitHub Actions becomes the authoritative browser evidence after this patch is
applied. Physical-device checks remain pending.

## Still outside this version

- Accounts, cloud sync, scores, streaks, goals, gamification, telemetry, and
  commercial services, by deliberate product choice.
- An approved external-content import pipeline or configurable translation
  language.
- Guaranteed offline behavior before the readiness indicator reaches ready.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.
