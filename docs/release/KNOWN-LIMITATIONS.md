# Known limitations before ScottBook 1.0

This list is intentionally release-blocking evidence, not a hidden backlog.

## Product gaps

- The offline library contains nine authored pilot articles, balanced at three
  each for HSK 1–3, not the proposed target of 30. The HSK versioning system and
  final 1.0 content count are not yet approved.
- Character, word/phrase, and sentence assistance is available for the nine
  authored pilot articles. It is not yet backed by a content-authoring editor
  or an approved import pipeline.
- Reader now derives a searchable **Từ trong bài** index from each authored
  article. Identical Hanzi are distinct entries when their contextual pinyin or
  meaning differs. Repeated entries can compare and jump to every exact authored
  occurrence in the current article or across all nine offline articles. There
  is no custom vocabulary editor, saved personal word list, or fuzzy identity
  merging.
- The authored translation language is Vietnamese. Choosing another target
  language is not implemented yet.
- Reader customization now provides Paper/Night/OLED themes, text size,
  serif/sans type, line spacing, and content width. Uploaded fonts, per-article
  overrides, and automatic device-specific profiles are not implemented.
- “Ôn lại” now keeps character/word/sentence scope, assistance contexts,
  pin/known state, local need/scope filters, offline search, sorting, and an
  unscored quick-review session. Scores, streaks, daily goals, graded quizzes,
  and gamification are intentionally excluded. Spaced-repetition scheduling
  and CSV/Anki export remain outside the current scope. A quick session is
  capped at twenty active items.
- Search and Discover cover the authored offline library only. Discover does
  not use personalized recommendations or a remote content feed. A saved
  reading queue and user-authored topic taxonomy are not implemented.
- The learning overview derives lifetime progress from the current nine-article
  pack. Its per-article assistance insight uses the recent contexts retained by
  each local review record and distinct authored word/phrase coverage; it is not
  a complete lifetime analytics log or a difficulty score. Assistance records
  retain at most eight recent contexts. ScottBook intentionally does not keep
  scores, streaks, time-spent targets, daily/weekly goals, or cross-device
  progress.

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

## Deferred or intentionally excluded

- Paste, TXT, EPUB, external translation, PDF, and OCR import remain disabled.
- Accounts, cloud sync, telemetry, scoring, streaks, goals, gamification, and
  commercial services are intentionally outside the product scope.
- Audio, SRS, and a native iOS app are not part of the current reader baseline.

None of these limitations should be silently described as complete in release
notes. Update this file when evidence changes.
