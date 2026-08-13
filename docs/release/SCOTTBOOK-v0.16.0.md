# ScottBook v0.16.0 local Review discovery

Date: 2026-08-13
Status: Reader MVP learning-flow milestone; not a 1.0 Release Candidate

## Outcome

Version 0.16 makes the existing device-only Review list practical to revisit as
it grows. It adds four temporary display controls to **Chữ, từ và câu từng cần
trợ giúp**:

- Search authored Hanzi, tone-free pinyin, Vietnamese meanings, and the saved
  sentence context/translation.
- Narrow a current need state to all records, character, word/phrase, or
  sentence assistance.
- Sort visible records by review priority, most recently seen, or Hanzi.
- Show the live number of matched records and an explicit empty result state.

The existing need controls remain the first selection: **Cần cách đọc**, **Chưa
hiểu nghĩa**, and **Đã biết**. “Ưu tiên cần ôn” keeps pinned records first, then
records whose meaning was opened more often, then the most recently seen. This
is a transparent ordering aid, not a spaced-repetition schedule or a claim
about learning mastery.

## Data and offline contract

Search normalization is shared with Library: Vietnamese accents and pinyin tone
marks can be omitted, while Hanzi remains searchable exactly. Search, scope,
and sort are component view state only. They never change assistance evidence,
reader preferences, progress, localStorage, IndexedDB, backups, restore,
update checkpoints, or diagnostics. No new network request, content download,
translation, or annotation generation is introduced.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Review search normalization, combined filters, stable counts, storage regression | 97/97 passed |
| Lint and type check | React, TypeScript, and hooks rules | Passed |
| Browser matrix | Ten critical journeys on desktop and mobile Chrome profiles | 20/20 passed |
| New journey | Character/sentence evidence → Review search → scope → sort | Passed on both profiles |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root + `/scottbook/` artifacts | PWA deployment contracts | Passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. The physical-device matrix in `SCOTTBOOK-v0.9.0-RC.md` remains
pending.

## Still outside this version

- Spaced repetition, quizzes, targets, CSV/Anki export, and cloud sync.
- Saved review searches or cross-device review state.
- An in-app content-authoring editor or approved import pipeline.
- A configurable translation language; authored translation remains Vietnamese.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.
- Paste/TXT/EPUB/PDF/OCR import and automatic annotation.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.
