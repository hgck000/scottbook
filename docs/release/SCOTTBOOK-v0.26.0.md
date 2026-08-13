# ScottBook v0.26.0 mobile reader UX and offline Hán-Việt

Date: 2026-08-13
Status: Focused personal-reader milestone; import remains disabled

## Outcome

Version 0.26 removes visual chrome that competed with the text and makes the
reader behave like one coherent local app on narrow screens.

- The persistent **Có mạng / sẵn sàng offline** chip is removed. ScottBook
  remains offline-first, while actionable install, update, storage, and failure
  notices retain their existing controlled behavior.
- The Reader toolbar now starts at the top edge, paints behind the safe inset,
  and uses an opaque theme surface without backdrop blur. The mobile
  Library/Discover/Review navigation is also opaque and docked to the bottom
  edge, including its safe inset.
- **Phạm vi trợ giúp** starts with its explanatory copy, then smoothly contracts
  to the three `字 / 词 / 句` glyphs after the reader scrolls 260 px. Scrolling
  back to the article introduction restores the full selector.
- Sentence scope uses a focusable inline control rather than one atomic HTML
  button. Long sentences can wrap naturally and retain the exact paragraph
  flow used by character and word scope.
- Reader jumps to vocabulary context use smooth scrolling unless the device
  requests reduced motion. Buttons, fixed navigation, scope contraction,
  toolbar entry, context notices, and selection feedback receive short motion
  transitions with the existing reduced-motion override.

## Offline Hán-Việt data

The first assistance reveal for a character or word/phrase now shows **Pinyin**
and **Âm Hán-Việt** together. Sentence scope remains pinyin plus authored
translation because a whole sentence is not one Hán-Việt lexical unit.

The compiled lookup contains:

- 9,573 general character readings derived from Unicode Unihan 17.0.0
  `kVietnamese`, including propagated simplified/traditional variants; and
- 20,254 exact or tone-free pinyin keys derived from the MIT-licensed
  `ph0ngp/hanviet-pinyin-wordlist`, also propagated to compatible variants.

Pinyin-specific entries take priority. When the source has several legitimate
readings and the current pinyin cannot disambiguate them, ScottBook displays all
possibilities in parentheses. It never sends Hanzi or pinyin to a provider.
All built-in words and their character annotations are covered by an automated
offline-data test. Source hashes and notices are in `docs/THIRD-PARTY-NOTICES.md`.

This is reusable lookup infrastructure for a future approved import parser. It
does not unlock paste, TXT, EPUB, PDF, OCR, or remote analysis in v0.26.

## Android Back behavior

The Android shell now includes `@capacitor/app` and owns the system Back event:

1. an open assistance panel, Reader settings, or **Từ trong bài** sheet closes;
2. otherwise an existing ScottBook WebView history entry is used;
3. a directly opened internal deep link returns to `#/`; and
4. only Back from the library root exits the app.

Browser PWAs do not register this native listener and retain normal browser
history behavior.

## Local-data and privacy contract

Version 0.26 adds no local-data field, IndexedDB migration, backup field,
account, cloud sync, telemetry, score, streak, goal, gamification, remote
translation, or content import. Existing v0.25 browser/Android state and JSON
backups remain compatible. The Android manifest still has no Internet
permission and OS cloud backup remains disabled.

## Manual verification

1. Apply both v0.26 commits, push `main`, and confirm all jobs in the new
   **ScottBook CI** run pass. Download the Android debug artifact and extract
   `ScottBook-v0.26.0-android-debug.apk`.
2. At a phone-width viewport, open Library, Discover, and Review. Scroll content
   behind the bottom navigation and confirm the bar is fully opaque, touches the
   bottom/safe inset, and no text shows through it.
3. Open **Buổi sáng của tôi**. Confirm the top Reader toolbar covers the whole
   top/safe-inset area with an opaque Paper/Night/OLED color; text must not be
   visible through the toolbar and no connection chip may cover **Về thư viện**
   or a context return action.
4. At the article introduction, confirm **Phạm vi trợ giúp** shows its title,
   offline note, and three labeled choices. Scroll down past 260 px: it should
   smoothly become only `字 / 词 / 句`. Scroll back to the top and confirm the
   full copy returns.
5. In **Từ/cụm**, tap `早上` once. Confirm `zǎoshang` and `tảo thượng` appear
   together without connectivity. Tap again for **buổi sáng**, then a third time
   to close.
6. Switch to **Chữ**, tap `早`, and confirm `zǎo`, `tảo`, and then the authored
   contextual meaning. Inspect a reading displayed in parentheses and confirm
   the alternatives are readable rather than silently reduced to one guess.
7. Switch to **Câu** at 38 px text and the narrowest content width. Select a long
   sentence near a line break. Confirm the original paragraph wrapping and
   sentence order do not reflow merely because it becomes selectable; reveal
   pinyin and translation as before.
8. Open assistance, Reader settings, and **Từ trong bài** one at a time. On the
   Android APK, press system Back for each and confirm only the open surface
   closes while the Reader stays visible.
9. From a normal Reader route, press Android Back and confirm it returns to the
   previous ScottBook screen. Open a Reader deep link directly and confirm Back
   reaches Library. Press Back once more at Library and confirm the app exits.
10. In **Từ trong bài**, choose a containing sentence. Confirm the move is
    smooth, the target highlight is visible, and reduced-motion mode changes it
    to an immediate jump.
11. Enable airplane mode, force-stop the APK, reopen it, and repeat steps 3–8.
    Hán-Việt, pinyin, meanings, themes, favorites, and saved position must work
    without a first-run download or online/offline status chip.
12. Confirm paste/TXT/EPUB/PDF/OCR controls have not appeared. The new lookup is
    data infrastructure only; import is still intentionally locked.

## Automated evidence

| Gate | Coverage expected from the patch | Local result |
| --- | --- | --- |
| Unit/integration | Hán-Việt lookup/variants/coverage, sentence inline layout, Android Back decision, plus existing storage/reader/review/PWA behavior | 138/138 passed |
| Lint and type check | React, TypeScript, generated data access, native listener, and reduced-motion-safe UI | Passed |
| Browser matrix | Hán-Việt reveal, compact scope, native-back surface event, removed chip, offline reopen, plus prior journeys | 34 cases defined; local launch unavailable because this workspace has no Chrome executable |
| Security | CSP/browser API audit, runtime licenses, dependency advisories, no Android Internet permission | Passed; 0 vulnerabilities |
| Root + `/scottbook/` PWA artifacts | Manifest, service worker, navigation fallback, and deployment contracts | Passed |
| Native web + Android sync | Local bundle, App plugin, version code 26/name 0.26.0, no remote server/service worker | Passed |
| Android APK/device | Gradle build plus real Back/safe-inset/airplane-mode evidence | Pending pushed CI and owner device check |

## Still outside this version

- Approved external-content import or configurable translation language.
- Context-sensitive Hán-Việt morphological analysis; alternatives remain visible
  where the pinned sources cannot choose safely.
- A stable signed APK/AAB upgrade channel or Play Store publishing.
- Accounts, cloud sync, scores, streaks, goals, gamification, telemetry, and
  commercial services, by deliberate product choice.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.
