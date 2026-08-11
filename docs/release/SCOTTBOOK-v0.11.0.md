# ScottBook v0.11.0 authored assistance scopes

Date: 2026-08-11
Status: mandatory reader-core work; not a 1.0 Release Candidate

## Outcome

Version 0.11 adds a reader-visible assistance scope without adding a network
dependency:

- `字 · Chữ` reveals authored contextual pinyin and meaning for one Hanzi.
- `词 · Từ/cụm` preserves the existing authored word or phrase behavior.
- `句 · Câu` reveals sentence pinyin assembled from authored word readings,
  followed by the authored Vietnamese sentence translation.

The selector is responsive, keyboard and screen-reader accessible, and sticky
below the reader toolbar. Its last selection survives a reload. Switching scope
closes the previous help panel so hidden state cannot be mistaken for data from
the new scope.

## Offline content contract

Every word token in the three pilot articles now contains one ordered authored
annotation for every character. The production build rejects a missing,
reordered, or empty character annotation. Single-character words reuse their
existing authored word annotation; multi-character entries carry explicit
contextual meanings instead of dictionary guesses.

No runtime transliterator, translation provider, content endpoint, analytics
endpoint, API key, or remote-content URL is present. External TXT/EPUB/paste
import remains disabled.

## Review and persistence

Review records now retain their `character`, `word`, or `sentence` scope. Scope
is part of the stable record identifier, so a one-character word and the same
Hanzi selected in character mode do not overwrite each other. Diagnostics
expose aggregate counts per scope but never include reading text.

Compatibility behavior is explicit:

- Old two-field reader preferences migrate to `word` scope.
- Assistance-history payload v1 migrates to scoped payload v2 with `word`
  records and new stable identifiers.
- Valid older backups without the new preference or assistance history still
  receive safe defaults.
- Backup, restore preview, confirmed restore, one-level undo, pre-update
  checkpoints, localStorage fallback, and the IndexedDB v3 mirror all include
  the selected scope.
- A corrupt scope cannot replace an otherwise healthy IndexedDB snapshot.

The IndexedDB database remains schema v3 because no store layout changed; the
validated assistance-history payload itself advances to version 2.

## Automated and visual evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Content contract, three scopes, accessibility, persistence, migration, backup/undo, diagnostics | 80/80 passed |
| Browser matrix | Six critical journeys on desktop and mobile Chrome profiles | 12/12 passed |
| New journey | Character → word/sentence switch → persisted scope → mixed-scope Review | Passed on both profiles |
| Offline regression | Precached article reopens with the browser offline | Passed on both profiles |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root artifact | Manifest, service worker, icons, navigation fallback, version | Passed |
| `/scottbook/` artifact | Configured subpath contract | Passed |
| Responsive inspection | Reader and sentence help at 1440×1000 and 390×844, including sticky selector | Passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. The physical-device matrix in `SCOTTBOOK-v0.9.0-RC.md` remains pending.

## Still outside this version

- Full reader typography/settings and an in-app content-authoring editor.
- A configurable translation language; the authored pilot translation remains
  Vietnamese in this version.
- Spaced repetition, quizzes, CSV/Anki export, Search, and Discover.
- The final 30-article content target.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.
- Paste/TXT/EPUB/PDF/OCR import and automatic annotation.

These items remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.
