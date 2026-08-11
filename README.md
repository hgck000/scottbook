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
