# Known limitations before ScottBook 1.0

This list is intentionally release-blocking evidence, not a hidden backlog.

## Product gaps

- The offline library contains three authored pilot articles, not the proposed
  target of 30. The HSK versioning system and final 1.0 content count are not yet
  approved.
- Character, word/phrase, and sentence assistance is available for the three
  authored pilot articles. It is not yet backed by a content-authoring editor
  or an approved import pipeline.
- The authored translation language is Vietnamese. Choosing another target
  language is not implemented yet.
- Reader customization now provides Paper/Night/OLED themes, text size,
  serif/sans type, line spacing, and content width. Uploaded fonts, per-article
  overrides, and automatic device-specific profiles are not implemented.
- “Ôn lại” now keeps character/word/sentence scope, assistance contexts,
  pin/known state, and local filters. It does not yet implement spaced
  repetition, quizzes, or CSV/Anki export.
- Search now covers the authored offline library by Hanzi, pinyin, and
  Vietnamese content. A separate Discover feed and article-detail screen are
  not implemented.

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
