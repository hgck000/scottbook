# ScottBook v0.12.0 reader personalization

Date: 2026-08-11
Status: mandatory reader-core work; not a 1.0 Release Candidate

## Outcome

Version 0.12 completes the first reader-personalization slice without adding a
network dependency. A responsive settings panel now controls:

- Paper, Night, and pure-black OLED themes.
- Reader text from 18 px through 38 px.
- Serif or sans-serif Chinese body text.
- Compact, comfortable, or airy line spacing.
- Narrow, balanced, or wide content width.

The desktop panel opens from the reader toolbar; the same control becomes a
mobile bottom sheet. The existing quick text-size and theme actions remain
available. “Đặt lại mặc định” resets only presentation choices and deliberately
keeps the reader's selected `字 / 词 / 句` assistance scope.

## Offline persistence and compatibility

The reader preference record now contains six validated fields: theme, text
size, assistance scope, font family, line height, and content width. Every
choice is stored locally and applied before the next reading session.

Compatibility behavior is explicit:

- Valid v0.10 two-field preferences migrate to word/phrase scope and the new
  presentation defaults.
- Valid v0.11 three-field preferences keep their assistance scope and receive
  the new presentation defaults.
- Backup export, restore preview, confirmed restore, one-level undo,
  pre-update checkpoints, localStorage fallback, and the IndexedDB v3 mirror
  all include the six-field record.
- A malformed new field invalidates that local snapshot instead of overwriting
  a healthy IndexedDB copy.

The IndexedDB database remains schema v3 because no object-store layout
changed. Migration happens through the validated preference payload.

## Interaction and accessibility

Opening settings first closes any visible assistance panel. Focus moves to the
settings surface; Escape, the close action, the scrim, and the “Xong” action all
close it and return focus to the toolbar button. Each choice exposes pressed
state, the font-size control has an accessible value, and the settings surface
keeps a visible live preview.

The content-width presets cap the article rather than forcing a fixed width, so
small screens continue to use their available viewport. Mobile line spacing no
longer overrides the reader's selected value.

## Automated and visual evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Preference validation, v0.10/v0.11 migration, persistence, backup/undo, IndexedDB fallback | 83/83 passed |
| Browser matrix | Seven critical journeys on desktop and mobile Chrome profiles | 14/14 passed |
| New journey | OLED + sans + airy + wide + 38 px, reload persistence, safe reset | Passed on both profiles |
| Offline regression | Precached article reopens with the browser offline | Passed on both profiles |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root artifact | Manifest, service worker, icons, navigation fallback, version | Passed |
| `/scottbook/` artifact | Configured subpath contract | Passed |
| Responsive inspection | Settings drawer/bottom sheet at 1440×1000 and 390×844 | Passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. The physical-device matrix in `SCOTTBOOK-v0.9.0-RC.md` remains pending.

## Still outside this version

- A configurable translation language; the authored pilot translation remains
  Vietnamese.
- An in-app content-authoring editor or approved import pipeline.
- Uploaded fonts, per-article presentation profiles, and automatic device
  presets.
- Spaced repetition, quizzes, CSV/Anki export, Search, and Discover.
- The final 30-article content target.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.
- Paste/TXT/EPUB/PDF/OCR import and automatic annotation.

These items remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.
