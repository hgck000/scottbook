# ScottBook v0.22.0 repeated-word context comparison

Date: 2026-08-13
Status: Focused personal-reader milestone; not a 1.0 Release Candidate

## Outcome

Version 0.22 extends **Từ trong bài** for words and phrases that occur more than
once. Their list action now opens an authored context view instead of jumping
immediately to the first sentence. The view presents every occurrence in
reading order with:

- its position, such as **Ngữ cảnh 2/4**;
- the complete Hanzi sentence with the selected word highlighted;
- the sentence's authored Vietnamese translation; and
- a **Tới câu** action for returning to that exact sentence in Reader.

The context view keeps the selected word's Hanzi, pinyin, and meaning visible.
Its back action returns to the filtered vocabulary list and restores keyboard
focus. Choosing a context closes the panel, leaves the normal Reader URL
unchanged, centers and highlights the selected sentence, and preserves the
standard progressive assistance interaction. Words with one occurrence retain
the v0.21 direct-jump behavior.

## Local-data and compatibility contract

Every context comes from the built-in article annotation already present in
v0.21. Viewing or comparing contexts does not create assistance history,
reading events, scores, or a new local record. Progress continues to follow the
Reader's normal visible-sentence behavior after a jump.

Version 0.22 adds no persistent field, IndexedDB migration, backup field,
account, analytics event, translation provider, generated pinyin, score,
streak, goal, gamification, or network request. Existing v0.21 data and backups
remain compatible.

## Manual verification

1. Open **Buổi sáng của tôi**, open **Từ trong bài**, and search `wo`.
2. Confirm `我 · wǒ · tôi` appears once with the action **4 ngữ cảnh** rather
   than four duplicate vocabulary rows.
3. Open it and confirm the header reports **4 ngữ cảnh trong bài** and keyboard
   focus moves to **Danh sách từ**.
4. Confirm four context cards appear in order from **Ngữ cảnh 1/4** through
   **Ngữ cảnh 4/4**. Each must show its full Hanzi sentence, highlight `我`, and
   show the matching authored Vietnamese translation.
5. Press **Danh sách từ**. Confirm the `wo` search and its one-result list are
   preserved, then reopen the four contexts.
6. Press **Tới câu** on context 4. Confirm the panel closes, the URL remains
   `#/read/hsk1-my-morning`, and the fourth sentence is centered and highlighted.
7. Tap `我` in that sentence. Confirm normal assistance reveals `wǒ` first and
   `tôi` second.
8. Reopen **Từ trong bài**, search `gaoxing`, and confirm the single-occurrence
   `高兴` still uses the direct **Tới câu** action without an unnecessary detail
   screen.
9. In a clean browser profile, compare contexts without tapping a word in
   Reader, then visit **Ôn lại**. Confirm no assistance record was created.
10. Repeat the comparison and fourth-context jump offline and at approximately
    390 px width. Confirm the bottom sheet scrolls, all four cards remain
    readable, and every **Tới câu** control is tappable without horizontal
    scrolling.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Authored context order/text/translation, existing vocabulary behavior, Reader compatibility | 118/118 passed |
| Lint and type check | React, TypeScript, and hooks rules | Passed |
| Browser matrix | Repeated word → all contexts → fourth sentence → normal assistance + prior journeys | 30/30 passed |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root + `/scottbook/` artifacts | PWA deployment contracts | Passed |
| Responsive inspection | Context comparison at 1440×1000 and Pixel 7 width | Passed |
| Base-branch CI | v0.21 pushed baseline | GitHub Actions #21 passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. Physical-device checks remain pending.

## Still outside this version

- Accounts, cloud sync, scores, streaks, goals, gamification, telemetry, and
  commercial services, by deliberate product choice.
- Cross-article occurrence comparison or a custom vocabulary editor.
- An approved external-content import pipeline or configurable translation
  language.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.
