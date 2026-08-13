# ScottBook v0.30.0 continuous offline reading

Date: 2026-08-13
Status: Focused personal-reader milestone; import and owner key remain deferred

## Outcome

Version 0.30 removes the unnecessary trip back through Library after reaching
the end of an article. Reader now presents one compact **bài tiếp theo** card
using only the authored offline catalog and existing device-local reading state.

The choice is deterministic:

1. start immediately after the open article in authored library order;
2. wrap at the end of the nine-article catalog;
3. skip every completed article;
4. label a saved unfinished destination as **Tiếp tục một bài còn dang dở**;
5. label a never-opened destination as **Bài chưa đọc tiếp theo**; and
6. offer the next authored article as a reread only when every article,
   including the current one, is complete.

The card shows Chinese title, authored pinyin, Vietnamese title, HSK level,
topic, estimated length, and one explicit action. Opening it goes through the
existing article-open path, so normal reading history and saved-position
behavior remain authoritative.

## Why this belongs in ScottBook

ScottBook is a local reading app, not a lesson dashboard. Reaching the end of a
short article should make another suitable offline article immediately
available without introducing a feed, ranking model, score, streak, or remote
recommendation service.

The v0.30 rule is intentionally transparent and testable. It does not infer
difficulty from assistance taps and does not claim personalization that the
local data cannot support.

## Safety and data boundary

- No storage schema or backup schema changes.
- No automatic completion when the next article is opened.
- No history, favorite, progress, or assistance record is deleted.
- No network request, account, telemetry, recommendation feed, or new package.
- Import remains locked and Android owner-key setup remains deferred.
- A one-article or invalid catalog returns no continuation instead of looping.

## Manual verification

1. Open **Buổi sáng của tôi** and scroll to the article end.
2. Confirm the card shows **Bài chưa đọc tiếp theo**, `我的家`, `Wǒ de jiā`,
   and **Gia đình tôi**.
3. Press **Đọc tiếp** and confirm Reader opens `我的家` without returning to
   Library.
4. Return to Library and confirm **Gia đình tôi** now appears in local history.
5. Mark **Gia đình tôi** complete, reopen **Buổi sáng của tôi**, and confirm the
   card skips it and offers **Người bạn ở trường**.
6. On a narrow phone viewport, confirm the card becomes one full-width action
   without horizontal scrolling or covering Reader controls.
7. With airplane mode enabled after installation, repeat steps 1–3 and confirm
   the next article still opens.

## Automated evidence

| Gate | v0.30 coverage | Local result before patch handoff |
| --- | --- | --- |
| Unit/integration | Stable order, completed skip, saved unfinished label, wrap, full-library reread, invalid/single-item safety, rendered accessible card | 168/168 passed |
| Lint/typecheck/security | App and sequence helper without runtime network expansion | Passed; 7 runtime licenses audited, 0 vulnerabilities |
| PWA root/subpath | Offline artifact contracts at version 0.30.0 | Both sequential builds passed |
| Android native | Version code 30, local assets, Back plugin, no remote server | `android:sync` passed |
| Browser matrix | New end-of-article journey plus all prior desktop/mobile production journeys | 36 cases defined; GitHub Actions authoritative |

## Product boundary unchanged

- The built-in library remains the existing nine authored HSK 1–3 articles.
- Paste/TXT/EPUB, external translation, PDF, and OCR remain disabled.
- There is no account, cloud sync, telemetry, score, streak, goal,
  gamification, personalized feed, or commercial service.
- Owner release-key creation and two-version signed-device evidence remain
  intentionally deferred.
