# Known limitations before ScottBook 1.0

This list is intentionally release-blocking evidence, not a hidden backlog.

## Product gaps

- The offline library contains three authored pilot articles, not the proposed
  target of 30. The HSK versioning system and final 1.0 content count are not yet
  approved.
- Assistance selects authored word tokens. A user-facing `字 / 词 / 句` scope
  switch is not implemented.
- Reader customization currently provides Paper/Night themes and font size;
  line height, margins, content width, OLED, and a full settings screen are not
  implemented.
- “Ôn lại” currently summarizes reading history. It is not yet the planned
  assistance-event vocabulary review screen.
- Search, Discover, and a separate article-detail screen are not implemented.

## Platform gaps

- ScottBook is a PWA only. There is no Capacitor Android project or APK in the
  repository.
- A signed APK upgrade path cannot be promised until the owner creates and
  safely retains one release key. That private key must never enter the repo or
  a `git am` patch.
- Safari/iPhone Home Screen and installed Android PWA behavior require real
  device verification; Chrome viewport emulation is not equivalent.
- The generated artifact supports root hosting and configured subpath hosting,
  but production HTTPS hosting and cache headers are deployment responsibilities.

## Deliberately deferred

- Paste, TXT, EPUB, external translation, PDF, and OCR import remain disabled.
- There is no account, cloud sync, telemetry, audio, SRS, or native iOS app.

None of these limitations should be silently described as complete in release
notes. Update this file when evidence changes.
