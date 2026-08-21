# Known limitations before ScottBook 1.0

This list is intentionally release-blocking evidence, not a hidden backlog.

## Product gaps

- The offline library contains 105 standards-informed readings: 39 for HSK 1,
  24 each for HSK 2 and HSK 3, and nine each for HSK 4–5. It does not yet cover HSK 6. The texts are original
  adaptations aligned to the official HSK 1–5 resources rather than copied test
  passages; a small number of topic-specific words go beyond the core level but
  retain complete offline assistance. The v0.41 audit removes known irrelevant
  dictionary senses and fixes reviewed pinyin/phrasing; v0.42 packs the same
  annotations more compactly and caches derived indexes without changing their
  content. v0.43 makes the generated payload reproducible across supported CI
  operating systems, and v0.44 keeps that content unchanged while simplifying
  the surrounding interface. v0.45 adds fifteen seventy-sentence stories to
  each of HSK 2 and HSK 3 with the same authored offline assistance. Concise automatic dictionary assistance is still
  not a replacement for a full edited lexicon.
- Character, word/phrase, and sentence assistance is available for all 105
  built-in readings. Paste/TXT/EPUB imports receive automatic offline pinyin
  and word/character meanings, not authored sentence translations.
- Character and word/phrase assistance now derives Hán-Việt readings entirely
  offline from pinned Unicode Unihan and MIT-licensed pinyin-specific data.
  Some characters legitimately expose several readings; ScottBook shows the
  alternatives instead of claiming context-sensitive certainty. The same
  lookup is reused when reading imported content.
- Reader now derives a searchable **Từ trong bài** index from each authored
  article. Identical Hanzi are distinct entries when their contextual pinyin or
  meaning differs. Repeated entries can compare and jump to every exact authored
  occurrence in the current article or across all 105 offline articles. There
  is no custom vocabulary editor, saved personal word list, or fuzzy identity
  merging.
- The authored translation language is Vietnamese. Choosing another target
  language is not implemented yet.
- Reader customization now provides Paper/Night/OLED themes, text size,
  serif/sans type, line spacing, and content width. Uploaded fonts, per-article
  overrides, and automatic device-specific profiles are not implemented.
- “Ôn lại” deliberately keeps only character and word/phrase items. Sentence
  assistance remains available in Reader, but whole sentences are not stored as
  review cards; earlier sentence cards are removed during local-data and backup
  validation. Sentence examples attached to character/word contexts remain.
  Pin/known state, local need/scope filters, offline search, sorting, and an
  unscored quick-review session are supported. Scores, streaks, daily goals,
  graded quizzes, gamification, spaced-repetition scheduling, and CSV/Anki
  export remain outside the current scope. A quick session is capped at twenty
  active items.
- Search and Discover filters cover the authored offline library only. Imported
  books appear in their own Library section and are not mixed into HSK filters. Discover does
  not use personalized recommendations or a remote content feed. A saved
  reading queue, user-authored topic taxonomy, and automatic next-reading card
  are not implemented.
- The learning overview derives lifetime progress from the current 105-article
  pack. Its per-article assistance insight uses the recent contexts retained by
  each local review record and distinct authored word/phrase coverage; it is not
  a complete lifetime analytics log or a difficulty score. Assistance records
  retain at most eight recent contexts. ScottBook intentionally does not keep
  scores, streaks, time-spent targets, daily/weekly goals, or cross-device
  progress.

## Platform gaps

- ScottBook now has a Capacitor Android project and CI-built debug APK. Android
  Back handling is implemented for reader sheets, internal history, direct deep
  links, root exit, and protected imported-book commits. A repeatable ADB runner can verify data-preserving debug
  installation, app/version/permissions, foreground MainActivity, accessible
  WebView content, and screenshot capture. A clean physical-device run,
  airplane-mode launch, WebView persistence, Back behavior, and system-inset
  behavior still need owner evidence. Backup/restore code remains retained but
  its advanced Review card is intentionally hidden in v0.44 while the interface
  is being simplified.
- GitHub-hosted runners may generate different debug signing keys. Debug APKs
  remain fresh-install test artifacts; uninstalling without first exporting a
  JSON backup can remove the Android WebView's local ScottBook data.
- The fail-closed owner-signing workflow is implemented, but it cannot produce
  evidence until the owner creates, backs up, and configures exactly one release
  key outside Git. The key and passwords must never enter the repo or a `git am`
  patch. The safe-upgrade runner is ready, but durable evidence remains pending
  until the first owner-signed baseline is updated by the next higher version
  without losing local data. Key creation is intentionally deferred for now.
- Safari/iPhone Home Screen and installed Android PWA behavior still require
  real-device verification; Chrome viewport emulation is not equivalent
  evidence.
- There is no separate Windows, macOS, or native iOS wrapper. Those platforms
  continue to use the installable PWA/Home Screen path.
- The generated artifact supports root hosting and configured subpath hosting,
  but production HTTPS hosting and cache headers are deployment responsibilities.

## Deferred or intentionally excluded

- External machine translation remains deferred. PDF and OCR import are
  intentionally excluded.
- Paste/TXT accepts UTF-8 Chinese text up to 120,000 normalized characters per
  book. EPUB accepts archives up to 20 MB and keeps text, package metadata,
  spine order, and EPUB 3 navigation or EPUB 2 NCX chapter labels. Expanded
  archives are capped at 40 MB, with additional entry/chapter/document limits.
  Images, CSS, SVG, MathML, audio, video, encrypted content, and DRM are not
  imported. Automatic CVDICT definitions may contain errors, sentence
  translation is unavailable offline, and imported metadata cannot yet be
  edited after save.
- Accounts, cloud sync, telemetry, scoring, streaks, goals, gamification, and
  commercial services are intentionally outside the product scope.
- Audio, SRS, and a native iOS app are not part of the current reader baseline.

None of these limitations should be silently described as complete in release
notes. Update this file when evidence changes.
