# ScottBook v0.20.0 exact reading-context return

Date: 2026-08-13
Status: Focused personal-reader milestone; not a 1.0 Release Candidate

## Outcome

Version 0.20 turns a saved vocabulary context into a direct reading action.
Each item in **Chữ, từ và câu từng cần trợ giúp** now offers **Mở đúng câu**.
The action opens the authored article at a context route, scrolls the exact
saved sentence into the center of Reader, focuses and highlights it, and shows
a compact **Đã mở đúng câu từ Ôn lại** notice.

Both the Reader back action and the notice return directly to Review. Normal
`#/read/{articleId}` links retain their existing saved-position behavior. A
context id that does not belong to the article is ignored safely, and unrelated,
incomplete, or malformed routes are rejected.

## Product-scope decision

ScottBook is a private, single-user reading utility whose only learning purpose
is to improve reading comprehension and vocabulary. The app therefore remains
local-first and does not need an account, cloud sync, score, streak, daily goal,
gamification, telemetry, or a commercial-service layer. Those features are
intentionally excluded rather than postponed milestones.

The exact-context route derives everything from the existing authored article
and assistance record. It adds no persistent field, IndexedDB migration, backup
field, translation provider, generated pinyin, analytics event, or network
request. Existing v0.19 data and backups remain compatible.

## Manual verification

1. Open **Buổi sáng của tôi** and, in the fourth sentence, open `高兴` through
   pinyin or meaning.
2. Return to **Ôn lại**, locate `高兴`, and press **Mở đúng câu**.
3. Confirm the URL ends in `#/read/hsk1-my-morning/context/s4`.
4. Confirm the fourth sentence is centered in the visible reading area,
   highlighted in amber, and shows the notice **Đã mở đúng câu từ Ôn lại**.
5. Tap `高兴` and confirm its authored pinyin and Vietnamese meaning still
   reveal in the normal order.
6. Press **Về Ôn lại** in either the header or the notice. Confirm Review opens
   and the saved `高兴` item is still present.
7. Reload the exact context URL and repeat once while the browser is offline.
   Confirm the article and highlight still appear without a network request.
8. Open a normal article from Library or Discover. Confirm its URL has no
   `/context/` segment and saved reading-position behavior is unchanged.
9. At approximately 390 px width, confirm the target sentence, highlight, and
   return controls remain readable and tappable without horizontal scrolling.
10. Try a context id not contained in the article. Confirm Reader opens the
    article safely without highlighting an unrelated sentence.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Context-route parsing, encoded ids, target markup, Review/Reader rendering | 112/112 passed |
| Lint and type check | React, TypeScript, and hooks rules | Passed |
| Browser matrix | Review item → exact sentence → return + prior journeys | 26/26 passed |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root + `/scottbook/` artifacts | PWA deployment contracts | Passed |
| Responsive inspection | Context Reader at 1440×1000 and 390×844 | Passed |
| Base-branch CI | v0.19 pushed baseline | GitHub Actions #19 passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. Physical-device checks remain pending.

## Still outside this version

- Accounts, cloud sync, scores, streaks, goals, gamification, telemetry, and
  commercial services, by deliberate product choice.
- An approved external-content import pipeline or configurable translation
  language.
- Audio, CSV/Anki export, SRS, and user-authored content tools.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.
