# ScottBook v0.44.0 — interface completion

## Release contract

This release completes the simplified ScottBook interface without adding
content, accounts, scores, study mechanics, or network dependencies.

- Keep all 75 built-in articles, 2,550 sentences, annotations, imports,
  progress, favorites, history, and local learning records unchanged.
- Preserve the Paste/TXT/EPUB `invalid gzip data` fix and v0.43 lifecycle fixes.
- Keep whole sentences out of Review.
- Remove UI and supporting code that existed only for redundant instructions,
  discovery decoration, end-of-article messaging, and next-reading promotion.
- Retain backup/restore implementation while keeping its advanced Review card
  hidden for now.

## Interface changes

- The Library hero is shorter and uses a balanced two-line Chinese title.
- The second title line receives a deliberate offset and amber emphasis instead
  of relying on an accidental width wrap.
- The hero is now the positioning boundary for its decorative glyph, fixing the
  mobile layout while reducing its visual weight.
- Review assistance counts now sit directly beneath the compact reading summary.
- Redundant hero, instruction, privacy-note, article-end, and next-reading blocks
  are absent together with their unused styles and selection module.

## Verification

- All 34 test files and 191 unit/integration tests pass.
- ESLint, TypeScript, security policy, runtime license audit, and `npm audit`
  pass with zero reported vulnerabilities.
- Root and `/scottbook/` PWA builds pass release verification with all 75
  readings precached; the Android web bundle syncs at `0.44.0` with local assets
  and no remote server.
- All 38 desktop/mobile Browser journeys load, including the assertion that the
  retained advanced local-data card is not exposed in the simplified Review
  interface. GitHub Actions remains authoritative for execution in real Chrome.
- Local APK compilation reaches the verified native bundle but cannot download
  Gradle in this restricted environment; the GitHub Android job remains the
  authoritative debug APK builder.
- Owner-signed Android release remains optional until an owner-held keystore is
  configured outside the repository.

## Version

- Web/package: `0.44.0`
- Android: `versionCode 44`, `versionName 0.44.0`
