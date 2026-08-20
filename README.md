# ScottBook

ScottBook is an offline-first Chinese reading app. It reveals help gradually:

1. Read the original Hanzi.
2. Choose whether help should follow each character (`字`), word/phrase (`词`),
   or sentence (`句`).
3. Tap a character or word/phrase once to reveal its authored pinyin and
   offline Hán-Việt reading; sentence scope reveals pinyin only.
4. Tap it again to reveal its contextual Vietnamese meaning.
5. Tap a third time to close the help panel.

ScottBook is intentionally a single-user, local reading tool for improving
reading comprehension and vocabulary. Accounts, cloud sync, scores, streaks,
daily goals, gamification, telemetry, and commercial-service features are
outside its product scope.

ScottBook uses one React + TypeScript frontend in two delivery forms: the PWA
for browsers, Windows, macOS, and iPhone/iPad Home Screen; and a Capacitor
Android shell whose debug and owner-signed release APKs bundle the same library
for direct sideloading.

## Current status

- Responsive reference library and reader.
- Twenty-seven medium-to-long articles: nine each for HSK 1, HSK 2, and
  HSK 3. Every article contains ten sentences under two connected section
  headings; every level includes at least three readings about clothing,
  office work, fashion, or design.
- Every built-in character and word already contains contextual pinyin and a
  Vietnamese meaning; every sentence contains a Vietnamese translation.
- An offline Hán-Việt lookup combines Unicode Unihan 17.0.0 with a pinned
  MIT-licensed pinyin-specific wordlist, including simplified-character
  variants and explicit alternatives instead of context-free guessing.
- A persisted `字 / 词 / 句` assistance selector works entirely from that
  authored offline data.
- No translation, pinyin, analytics, or content API call at reading time.
- A full responsive reader-settings panel with Paper, Night, and pure-black
  OLED themes; 18–38 px text; serif/sans type; three line spacings; and three
  content widths.
- Offline library search across authored Hanzi, tone-free pinyin, Vietnamese
  titles, summaries, translations, and word meanings.
- HSK 1–3 plus in-progress, completed, and favorite library filters with live
  result counts.
- Reading position saved as a stable sentence anchor on the current device.
- A continue-reading card, per-article progress, and a local favorites filter.
- An offline learning overview with whole-library and per-HSK progress plus a
  shortcut back to the most recently opened unfinished article.
- Per-article assistance insights that compare distinct authored word/phrase
  coverage, local help opens, active review items, and known items.
- Review items reopen the exact saved sentence in Reader, with a focused
  highlight and a direct return to Review.
- Each Reader exposes a searchable offline **Từ trong bài** index with unique
  authored words/phrases, pinyin, Vietnamese meaning, occurrence counts, and a
  context comparison for repeated words plus a jump to any containing sentence.
- A local reading-history screen with open counts and latest-reading order.
- Assistance history that distinguishes character, word/phrase, and sentence
  scope as well as “needed pinyin” from “needed meaning”.
- Local review filters, search across Hanzi/tone-free pinyin/Vietnamese context,
  scope filtering, sorting, pin, known/relearn, recent contexts, and safe deletion.
- A device-only quick-review route that reveals Hanzi → pinyin → meaning and
  lets the reader keep an item active or mark it known.
- An opt-out switch that stops recording history without disabling assistance.
- Automatic/manual completion status and a reset-progress action.
- An end-of-article continuation card that follows stable offline library order,
  skips completed articles, resumes saved unfinished reading, and only suggests
  a reread after the complete library is finished.
- Offline reading remains the quiet default; only actionable install, update,
  storage, or failure notices appear instead of a persistent connection chip.
- Controlled PWA updates that reload only after the reader accepts.
- Throttled service-worker checks after foregrounding, reconnecting, or one hour.
- Native install prompt plus iPhone/iPad, MacBook, and browser guidance.
- A Capacitor Android project with a fixed app identity, branded launcher/splash
  assets, system-safe insets, hardware Back routing, and no remote server or
  Internet permission.
- A GitHub Actions debug APK artifact for direct Android sideload testing.
- A manual, fail-closed owner-signing workflow that verifies the APK certificate
  fingerprint while keeping the keystore and passwords outside Git and patches.
- A cross-platform ADB device-smoke runner that installs with data-preserving
  `-r`, verifies the effective APK/version/permission/foreground WebView,
  captures local screenshot and app-scoped log evidence, and never auto-uninstalls.
- A fail-before-install signed-upgrade runner that requires a fresh verified
  backup, higher version code, offline package, and matching real certificates.
- Pre-update data checkpoint that blocks unsafe service-worker reloads.
- Automatic recovery from the previous valid local record.
- Versioned JSON backup export protected by a SHA-256 checksum.
- Validated JSON backup restore with preview, rollback, and one-level undo.
- IndexedDB v4 mirror with imported-book transactions, corrupt-record quarantine,
  restore undo, and localStorage fallback for lightweight reader state.
- On-device storage usage plus an isolated translation-cache clear action.
- Storage-pressure warnings at 80% and 95%, with backup-first recovery guidance.
- Keyboard navigation, route focus, and progressive screen-reader descriptions.
- A redacted local diagnostic download with counts and capability flags only.
- A restrictive content-security policy plus automated API, license, and dependency audits.
- A 20,000-Hanzi reader fixture that guards the long-document render budget.
- Thirty-six production-browser journeys across desktop and mobile Chrome profiles.
- Root and configurable subpath PWA builds with an artifact contract check.
- GitHub Actions builds on Ubuntu, Windows, and macOS, builds the Android debug
  APK, and retains QA evidence.
- Generated service worker precaches the complete prototype.
- Offline Paste/TXT import with preview, cancellable worker analysis, pinyin,
  Hán-Việt readings, CVDICT meanings, and explicit automatic-quality labels.

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
npm run audit:security
npm run build
npm run test:e2e
```

`npm run test:e2e` requires a locally installed stable Google Chrome. CI uses
the Chrome installation on its hosted Ubuntu runner.

Build for a project subpath such as GitHub Pages:

```bash
SCOTTBOOK_BASE_PATH=/scottbook/ npm run build
SCOTTBOOK_BASE_PATH=/scottbook/ npm run preview
```

Use the same base for build and local preview. The default remains `/`. The
release verifier rejects manifest, icon, service worker, version, or
deployment-base drift before a build can pass.

Preview the production PWA:

```bash
npm run preview
```

Build the bundled Android shell locally after installing JDK 21 and Android SDK
36 (Android Studio can provide both):

```bash
npm run build:android:web
npm run android:sync
npm run android:build:debug
```

The final command writes `artifacts/ScottBook-v0.32.0-android-debug.apk` and
selects `gradlew.bat` automatically on Windows. `android:sync` proves that the
native bundle contains local assets, has no browser service worker, and has no
remote `server.url`; `android:build:debug` additionally runs Gradle. GitHub
Actions is the authoritative APK builder when the local machine has no Android
SDK.

After downloading or building the APK, connect one USB-debugging Android phone
and run the reusable device check:

```bash
npm run android:device:smoke -- /path/to/ScottBook-v0.32.0-android-debug.apk
```

On Windows, the APK path may be quoted normally. If more than one device is
connected, append `--serial DEVICE_SERIAL`. Evidence stays under `artifacts/`
and deliberately excludes the ADB serial. Full setup and failure handling are
in [`docs/qa/ANDROID-DEVICE-SMOKE.md`](docs/qa/ANDROID-DEVICE-SMOKE.md).

The release build is intentionally separate and never falls back to an
unsigned APK:

```bash
npm run android:build:release
```

It requires the owner-held keystore environment, verifies the resulting
certificate with `apksigner`, and writes
`artifacts/ScottBook-v0.32.0-android-release.apk` plus a checksum/fingerprint
report. Create and configure the key only through
[`docs/qa/ANDROID-RELEASE-SIGNING.md`](docs/qa/ANDROID-RELEASE-SIGNING.md); the
keystore and passwords must never enter the repository or a patch.

After two consecutive versions have eventually been signed with that one key,
verify the in-place update with a fresh JSON backup:

```bash
npm run android:upgrade:smoke -- /path/to/candidate-release.apk \
  --backup /path/to/ScottBook-backup-YYYY-MM-DD.json
```

The command checks backup checksum/freshness, app ID, higher `versionCode`,
offline permission, and both actual APK certificates before it runs
`adb install -r`. It never uninstalls or clears data. Key setup may remain
deferred; see
[`docs/qa/ANDROID-UPGRADE-SMOKE.md`](docs/qa/ANDROID-UPGRADE-SMOKE.md).

## Offline content contract

Reference articles live in `src/content/builtInLibrary.ts` and
`src/content/additionalArticles.ts`; contextual character readings live in
`src/content/characterAnnotations.ts`. They are authored as version-controlled
data, not generated in the browser. A word token is invalid without Hanzi,
tone-marked pinyin, a Vietnamese meaning, and one ordered authored annotation
for every character. A sentence is invalid without a Vietnamese translation.
Sentence pinyin is composed only from the authored word readings; ScottBook
does not guess readings at runtime.

The generated Hán-Việt lookup lives in
`src/content/hanVietReadings.generated.ts`. It is compiled into both PWA and
APK builds and performs no reading-time request. Its pinned sources, checksums,
licenses, and ambiguity limits are recorded in
[`docs/THIRD-PARTY-NOTICES.md`](docs/THIRD-PARTY-NOTICES.md). The generator can
be rerun with:

```bash
npm run data:han-viet -- <Unihan_Readings.txt> <Unihan_Variants.txt> <hanviet.csv>
```

`npm run build` first executes the content validation test. Incomplete reference
content therefore fails both the local production build and GitHub Actions.

## Local reading data

Reading progress, favorites, and reader settings are device-only records. Since
version 0.6 they are mirrored transactionally to IndexedDB while the proven
versioned `localStorage` records remain as a compatibility and browser fallback.
ScottBook stores the last sentence id rather than a scroll offset, so resuming
still works when the window or font size changes.

Version 0.3 adds a v2 local-state schema for reading history and completion.
Existing v1 progress and favorites migrate automatically on first load; the old
key is left untouched as a local fallback. Resetting an article removes its
progress/completion while retaining the fact that it was opened.

No account, cloud sync, analytics, or network request is involved. IndexedDB now
has isolated stores reserved for books, progress, settings, learning events,
translation cache, metadata, restore undo, and quarantined records. Imported
books live only in IndexedDB and reopen without a network connection.

Version 0.4 keeps the previous valid v2 record before replacing the primary
record. If the primary JSON later becomes corrupt, startup falls back to that
local safety copy before trying the legacy v1 key. The Review screen can also
request persistent browser storage and download a versioned JSON backup.

Version 0.5 can restore that backup entirely offline. The current format rejects files
larger than 32 MB, malformed JSON, unsupported formats, invalid reading-state
schemas, and checksum mismatches before showing a preview. Nothing is written
until the reader confirms. The confirmed restore writes the reading state,
theme, and font size as one guarded transaction; a failed write rolls every
touched key back to its exact prior value. A successful restore keeps one local
undo record so the previous state can be restored after a refresh as well.

Backup restore is distinct from content import. Paste/TXT starts from the
Library import flow; backup JSON restores ScottBook state and saved imported books.

Version 0.6 migrates a complete valid v0.5 local snapshot into IndexedDB on the
first open. A v1 database fixture upgrades to v2 without losing valid progress
or settings. Invalid IndexedDB progress/settings records are moved to a
quarantine store instead of being used to overwrite good data; a valid half of
the snapshot is preserved while the damaged half falls back safely. If
IndexedDB is unavailable, ScottBook continues with the existing `localStorage`
path.

Restore and one-level undo now coordinate both storage layers. If the IndexedDB
transaction rejects, all touched `localStorage` keys return to their exact
previous bytes. The Review screen reports origin usage, schema/cache/quarantine
counts, and can clear only the translation-cache store. That action cannot
delete books, progress, favorites, or settings.

Version 0.10 upgrades the local schema to IndexedDB v3 and activates the
reserved learning-events area. Opening pinyin and opening contextual meaning
are recorded as different needs. Repeated encounters aggregate under the same
authored word while retaining up to eight recent sentence contexts. The Review
screen can filter by need, pin an item, mark it known, return it to learning, or
delete it without touching books or reading progress. Recording can be paused;
reader assistance itself continues to work.

Assistance history is included in checksummed backup, restore, one-level undo,
diagnostic counts, and localStorage fallback. Valid v0.9 backups without this
field migrate to an empty assistance history instead of being rejected.

Version 0.11 adds the persisted `字 / 词 / 句` assistance scope. Existing reader
preferences migrate to word/phrase scope, preserving the behavior readers
already had. Existing v1 assistance history also migrates to word/phrase scope;
new history identifiers include the scope so a one-character word and the same
character remain separate review records. Backup, restore, undo, the IndexedDB
mirror, pre-update checkpoints, and redacted diagnostic counts all carry the
new scope without enabling any network service.

Version 0.12 adds a responsive reader-settings panel. Theme, text size,
serif/sans type, line spacing, and content width persist entirely on device.
Existing v0.11 preferences migrate to Paper-compatible typography defaults;
the selected assistance scope remains unchanged. Backup, restore preview,
confirmed restore, one-level undo, pre-update checkpoints, localStorage
fallback, and the IndexedDB mirror all carry the complete six-field reader
preference record. A corrupt new preference cannot replace a healthy local
snapshot.

Version 0.13 adds offline library discovery without changing the local-data
schema. Search removes Vietnamese accents and pinyin tone marks for matching,
while preserving Hanzi lookup. Level and reading-status filters derive their
counts from the existing authored library, progress, completion, and favorite
records. Search text and active filters are temporary view state: they do not
alter reading data, backups, or IndexedDB.

Version 0.14 completes the nine-article pilot content pack defined for the
Reader MVP: three authored articles at each of HSK 1, HSK 2, and HSK 3. The six
new articles add 24 sentences while preserving fully offline character,
word/phrase, and sentence assistance. Content validation now also rejects empty
summaries, invalid reading times, missing ids, and duplicate paragraph ids.
This content-only expansion does not change the local-data schema or invalidate
existing progress, favorites, history, backups, or IndexedDB records.

## Controlled PWA updates

The generated service worker uses prompt mode. A waiting version displays a
"Có phiên bản ScottBook mới" notice; it cannot reload the page by itself. Even
when another tab activates the worker, the current tab defers reloading until
the user accepts. This keeps the active reader position and local writes safe
from an unexpected mid-session refresh.

Version 0.7 adds a compatibility gate before every accepted update. ScottBook
validates the current library/settings schema, writes the newest state as a
guarded `localStorage` transaction, and waits for queued IndexedDB writes before
activating the waiting service worker. A failed local safety write blocks the
update and keeps the current app running. If IndexedDB alone fails, the complete
local snapshot becomes the next version's migration source.

An update dismissed with “Để sau” remains reachable through a compact update
action; there is no background reload loop. Missing article routes render an
explicit online/offline recovery screen instead of a blank page.

## Accessibility, diagnostics, and security

Version 0.8 gives every route a descriptive document title and moves keyboard
focus to its main content after navigation. A skip link bypasses repeated
navigation without changing the hash route. In the reader, Left/Right Arrow,
Home, and End move between the controls for the selected assistance scope;
Escape closes the assistance panel and restores focus to the selected unit.
Screen readers receive a progressive description that names the character,
word/phrase, or sentence and matches the current Hanzi → pinyin → meaning
interaction.

Long paragraphs use browser content visibility so off-screen work can be
deferred. The test suite also renders a deterministic 20,000-Hanzi fixture under
a two-second processing budget. This is a regression guard for application
work, not a claim that every device will paint or scroll at the same speed;
real-device checks remain part of the release-candidate sprint.

The Review screen can download a diagnostic JSON file entirely on the current
device. It contains app/runtime capability flags, aggregate content and reading
counts, storage pressure, and store counts. It excludes article identifiers,
reading text, titles, user-agent strings, and network destinations, and it is
never uploaded by ScottBook. Origin usage enters warning state at 80% of quota
and critical state at 95%; recovery guidance asks for a backup before any cache
cleanup.

The app shell now declares a restrictive content-security policy. CI rejects
production use of dynamic code evaluation, direct HTML injection, high-severity
runtime dependency advisories, or runtime packages outside the audited
permissive-license set. Development websocket access remains limited to local
Vite hosts. Paste/TXT analysis remains on-device and does not add a remote
content endpoint.

## Release qualification

Version 0.9 adds production-browser journeys for reading assistance, persisted
theme/favorites, JSON backup/restore/undo, anonymized v1 migration, and an
offline service-worker reload. Every journey runs in desktop and mobile Chrome
profiles. The test exposed and now guards the mobile reader's accessible back
button name.

CI also verifies the production build on Ubuntu, Windows, and macOS. A separate
root/subpath artifact contract prevents a PWA built for `/scottbook/` from
silently pointing its manifest, icons, or navigation fallback at `/`.

This is release qualification, not a claim that 1.0 is ready. The exact
automated evidence and physical-device matrix are in
[`docs/release/SCOTTBOOK-v0.9.0-RC.md`](docs/release/SCOTTBOOK-v0.9.0-RC.md).
The intentionally visible blockers are in
[`docs/release/KNOWN-LIMITATIONS.md`](docs/release/KNOWN-LIMITATIONS.md).
Owner execution and upgrade evidence for Android signing, the final content
count, and Safari/iPhone/Android real-device evidence remain unresolved. Import
remains disabled.

Version 0.10 adds a fifth critical journey for the editable local Review list,
so the desktop/mobile matrix now runs ten browser cases. Its implementation and
remaining limits are recorded in
[`docs/release/SCOTTBOOK-v0.10.0.md`](docs/release/SCOTTBOOK-v0.10.0.md).

Version 0.11 adds a sixth critical journey for switching between authored
character, word/phrase, and sentence help, persisting the selection, and
reviewing records from different scopes. The desktop/mobile matrix now runs
twelve browser cases. Its implementation, migrations, and evidence are recorded
in [`docs/release/SCOTTBOOK-v0.11.0.md`](docs/release/SCOTTBOOK-v0.11.0.md).

Version 0.12 adds a seventh critical journey for Paper/Night/OLED themes,
reader typography, line spacing, content width, persistence, and safe reset.
The desktop/mobile matrix now runs fourteen browser cases. Its implementation,
migrations, and evidence are recorded in
[`docs/release/SCOTTBOOK-v0.12.0.md`](docs/release/SCOTTBOOK-v0.12.0.md).

Version 0.13 adds an eighth critical journey for accent-insensitive search,
Hanzi lookup, HSK filtering, favorite filtering, live counts, empty results,
and safe reset. The desktop/mobile matrix now runs sixteen browser cases. Its
implementation and evidence are recorded in
[`docs/release/SCOTTBOOK-v0.13.0.md`](docs/release/SCOTTBOOK-v0.13.0.md).

Version 0.14 adds a ninth critical journey that discovers a newly authored HSK
3 article through accent-insensitive Vietnamese search, opens it, and verifies
its pinyin, contextual meaning, and sentence translation. The desktop/mobile
matrix now runs eighteen browser cases. Its content contract and evidence are
recorded in
[`docs/release/SCOTTBOOK-v0.14.0.md`](docs/release/SCOTTBOOK-v0.14.0.md).

Version 0.15 adds a separate offline Discover route and a detail route for each
authored article. Discover combines HSK, topic, and reading-length filters;
the detail page exposes only derived authored metadata and does not mark an
article as opened until the reader chooses **Đọc ngay**. Its tenth critical
journey covers this route from filtering through reading start, so the
desktop/mobile matrix now contains twenty browser cases. The release contract
is recorded in
[`docs/release/SCOTTBOOK-v0.15.0.md`](docs/release/SCOTTBOOK-v0.15.0.md).

Version 0.16 makes the local Review list easier to use once it grows: it can
search authored Hanzi, tone-free pinyin, Vietnamese meanings, and saved reading
contexts; narrow results to character, word/phrase, or sentence records; and
sort them by review priority, recency, or Hanzi. These are temporary display
controls, so no personal-data schema, backup, or migration changes are needed.
The existing assistance-scope journey now covers the controls on both browser
profiles, so the desktop/mobile matrix remains at twenty cases. The release contract
is recorded in
[`docs/release/SCOTTBOOK-v0.16.0.md`](docs/release/SCOTTBOOK-v0.16.0.md).

Version 0.17 adds an offline learning-progress overview to Review. It derives
completed, in-progress, unread, whole-library percentage, and per-HSK
percentage directly from the existing reading state. A continue action chooses
the most recently opened unfinished article even when a completed article was
opened later. No new event, storage, or backup schema is introduced. The
existing browser journey also uses a label-based search locator that is stable
across Chrome accessibility-role changes. Its release contract and manual
checks are recorded in
[`docs/release/SCOTTBOOK-v0.17.0.md`](docs/release/SCOTTBOOK-v0.17.0.md).

Version 0.18 adds a focused quick-review session from existing assistance
history. It selects up to twenty active records, prioritizes pinned and
meaning-heavy evidence, keeps authored help hidden until requested, and saves
only an explicit **Đã nhớ** decision. **Cần ôn lại** leaves the record active.
The session is fully local and intentionally does not pretend to be an SRS
algorithm or scored quiz. Its eleventh critical journey brings the
desktop/mobile browser matrix to twenty-two cases. The release contract and
manual checks are recorded in
[`docs/release/SCOTTBOOK-v0.18.0.md`](docs/release/SCOTTBOOK-v0.18.0.md).

Version 0.19 completes the lightweight learning-insight slice of Review. It
groups existing assistance contexts by authored article, compares distinct
word/phrase records with the article's distinct authored vocabulary, shows
local help opens and active/known review counts, and provides a direct read-again
action. The result is deliberately a reading trace rather than a score,
recommendation engine, streak, or SRS signal. No storage schema or network
provider is added. Its twelfth critical journey brings the desktop/mobile
browser matrix to twenty-four cases. The release contract and manual checks are
recorded in
[`docs/release/SCOTTBOOK-v0.19.0.md`](docs/release/SCOTTBOOK-v0.19.0.md).

Version 0.20 makes saved vocabulary context immediately useful again. Each
Review item can reopen its exact authored sentence, center and highlight that
sentence in Reader, then return directly to Review. Existing article links and
saved reading-position behavior remain compatible, and malformed context links
fall back safely. No persistent schema, account, network provider, score,
streak, goal, or gamification layer is introduced. Its thirteenth critical
journey brings the desktop/mobile browser matrix to twenty-six cases. The
release contract and manual checks are recorded in
[`docs/release/SCOTTBOOK-v0.20.0.md`](docs/release/SCOTTBOOK-v0.20.0.md).

Version 0.21 adds **Từ trong bài** directly to Reader. It derives a unique
word/phrase index from the article's authored offline annotations, shows pinyin,
Vietnamese meaning, and occurrence count, and searches Hanzi, tone-free or
compact pinyin, and accent-insensitive Vietnamese. Choosing a row closes the
panel and highlights its first sentence without changing the route. Browsing
the index does not create assistance history, and no storage schema or network
provider is introduced. Its fourteenth critical journey brings the
desktop/mobile browser matrix to twenty-eight cases. The release contract and
manual checks are recorded in
[`docs/release/SCOTTBOOK-v0.21.0.md`](docs/release/SCOTTBOOK-v0.21.0.md).

Version 0.22 makes repeated vocabulary useful for contextual comparison. A word
that occurs more than once now opens every authored sentence and Vietnamese
translation in reading order, highlights the word inside each Hanzi sentence,
and lets the reader jump to any chosen occurrence. Single-occurrence words keep
the direct **Tới câu** action. The comparison is temporary derived UI state, so
opening it creates no assistance record, schema migration, or network request.
Its fifteenth critical journey brings the desktop/mobile browser matrix to
thirty cases. The release contract and manual checks are recorded in
[`docs/release/SCOTTBOOK-v0.22.0.md`](docs/release/SCOTTBOOK-v0.22.0.md).

Version 0.23 extends that comparison across the complete offline library. Exact
authored Hanzi, pinyin, and meaning identities can switch between contexts in
the current article and every matching context grouped by article. Selecting a
sentence in another article opens and highlights that exact Reader location;
the vocabulary-specific route preserves a safe **Về bài trước** action without
being confused with Review. Single-current words that repeat elsewhere open the
library view directly, while globally unique words keep **Tới câu**. The feature
derives everything from the nine bundled articles and adds no persistent schema
or network provider. Its sixteenth critical journey brings the desktop/mobile
browser matrix to thirty-two cases. The release contract and manual checks are
recorded in
[`docs/release/SCOTTBOOK-v0.23.0.md`](docs/release/SCOTTBOOK-v0.23.0.md).

Version 0.24 hardens the installed PWA lifecycle. Its compact status preserves
the difference between preparing, ready, unavailable, and currently offline
even after the first-cache notice has been dismissed or the app has reloaded.
An open installation also checks its same-origin service worker after returning
to the foreground, reconnecting, or reaching an hourly interval. Checks are
visible/online-only and throttled; they never reload the Reader directly. A
newer build still uses the existing user-approved update and local checkpoint
flow. No reading data or personal content enters the request. Its seventeenth
critical journey brings the desktop/mobile browser matrix to thirty-four cases.
The release contract and manual checks are recorded in
[`docs/release/SCOTTBOOK-v0.24.0.md`](docs/release/SCOTTBOOK-v0.24.0.md).

Version 0.25 adds the first real Android package. Capacitor 8.5 wraps a separate
native build of the same frontend under `io.github.hgck000.scottbook`; the nine
articles, pinyin, and Vietnamese meanings are copied into the APK instead of
being fetched from a web host. Native startup skips browser installation and
service-worker update UI because the bundle is already offline. The committed
Android project uses ScottBook launcher/splash assets, safe-area variables,
Android version code 25, no Internet permission, and no OS cloud backup. CI
assembles an installable debug APK artifact. The v0.24 browser failure is also
corrected by selecting the connection chip directly rather than the page's
multiple live status regions. This debug artifact is for fresh-install testing,
not a stable upgrade channel; release signing still waits for an owner-held key.
The release contract and manual checks are recorded in
[`docs/release/SCOTTBOOK-v0.25.0.md`](docs/release/SCOTTBOOK-v0.25.0.md).

Version 0.26 removes persistent connectivity chrome from the reading flow and
makes fixed mobile surfaces fully opaque. Reader controls now cover the safe
top inset, the mobile navigation docks to the bottom edge, and the assistance
scope contracts to a three-glyph control after scrolling. Sentence selection
uses a wrappable inline control, preserving the authored paragraph layout.
Character and word/phrase help now exposes offline Hán-Việt readings from
20,254 pinyin-specific and 9,573 general character entries. Android's system
Back closes an open reader sheet first, navigates ScottBook history second, and
exits only from the library root. Import remains disabled. The release contract
and manual checks are recorded in
[`docs/release/SCOTTBOOK-v0.26.0.md`](docs/release/SCOTTBOOK-v0.26.0.md).

Version 0.27 turns the Android real-device gate into a repeatable local test
instead of a memory-based checklist. One cross-platform Node command selects
exactly one authorized ADB target, installs the APK with `install -r`, starts
the fixed MainActivity, verifies the installed version and absence of Internet
permission, rejects blank/inaccessible WebView startup, and records a local
screenshot, app-scoped log, JSON result, and five-item manual report. It never
uninstalls or clears app data when a runner-generated debug signature differs.
The release contract is recorded in
[`docs/release/SCOTTBOOK-v0.27.0.md`](docs/release/SCOTTBOOK-v0.27.0.md).

Version 0.28 fixes the Browser journeys failure exposed by v0.27: a new Reader
without saved progress now starts at the top instead of inheriting the library
scroll offset, while saved sentence restoration remains unchanged. It also adds
a manual owner-signing workflow and local release builder. Both fail when the
keystore is missing or stored inside the repository, verify the assembled APK
certificate against a pinned public SHA-256 fingerprint, and retain a public
APK checksum/fingerprint report. No private key or password is generated or
committed. Owner setup and a future two-version signed upgrade proof remain manual.
The release contract is recorded in
[`docs/release/SCOTTBOOK-v0.28.0.md`](docs/release/SCOTTBOOK-v0.28.0.md).

Version 0.29 makes that future proof data-safe without forcing key creation now.
Its ADB runner accepts only a fresh, checksum-valid backup from the currently
installed version, extracts the real installed/candidate certificate
fingerprints, requires a higher candidate version, and stops before install on
any mismatch. A passing preflight uses only `adb install -r`, then records the
new version, launch/accessibility state, and a manual local-data retention
checklist. It contains no uninstall, data-clear, downgrade, or automatic
rollback path. The first version signed later can be the baseline; the next
signed version becomes the candidate. The release contract is recorded in
[`docs/release/SCOTTBOOK-v0.29.0.md`](docs/release/SCOTTBOOK-v0.29.0.md).

Version 0.30 removes the library round trip after reaching the end of an
article. A compact continuation card follows the authored offline order, wraps
once through the nine-article catalog, skips completed articles, and identifies
whether the destination is new or already in progress. It offers a deterministic
reread only after every article is complete. Opening the card uses the existing
reading-history and saved-position path; it adds no recommendation service,
score, goal, account, or schema migration. The release contract is recorded in
[`docs/release/SCOTTBOOK-v0.30.0.md`](docs/release/SCOTTBOOK-v0.30.0.md).

Version 0.31 adds the complete local Paste/TXT path. It validates UTF-8, shows a
normalized preview, analyzes Chinese in a cancellable Web Worker, and stores the
result only after analysis succeeds. `pinyin-pro` supplies contextual pinyin;
the pinned CVDICT snapshot supplies Vietnamese word/character meanings; existing
Hán-Việt data remains available in Reader. Automatic annotations are labeled and
sentence translation is deliberately reported unavailable instead of fabricated.
Imported books participate in reading progress, favorites, review contexts,
transactional delete, backup v2, restore, and one-level undo. EPUB remains deferred;
PDF/OCR remain excluded. See
[`docs/release/SCOTTBOOK-v0.31.0.md`](docs/release/SCOTTBOOK-v0.31.0.md).

Version 0.32 expands the built-in graded library from nine short pilot articles
to twenty-seven medium-to-long readings: nine each for HSK 1, HSK 2, and HSK 3.
Every reading has ten sentences grouped under two connected headings. HSK 1 is
consistently jade, HSK 2 amber, and HSK 3 coral throughout filters, cards,
progress, and Reader. The texts are original standards-informed adaptations,
not copies of official test passages; grammar and core vocabulary were checked
against the official HSK 1–3 exam and vocabulary resources. Contextual pinyin,
Vietnamese word/phrase meanings, sentence translations, and offline Hán-Việt
remain available. Source policy and the release contract are recorded in
[`docs/data/HSK-READING-PROVENANCE.md`](docs/data/HSK-READING-PROVENANCE.md)
and
[`docs/release/SCOTTBOOK-v0.32.0.md`](docs/release/SCOTTBOOK-v0.32.0.md).

## Install ScottBook

Chromium browsers on Android, Windows, macOS, and Linux can expose ScottBook's
native install dialog directly in the app. The invitation can be dismissed
persistently and reopened from the small “Cài app” action.

On iPhone and iPad, open ScottBook in Safari, choose **Share**, then **Add to Home
Screen**. On macOS Safari, choose **Share → Add to Dock**; Chrome and Edge use
their install action in the address bar. The manifest includes 192 px, 512 px,
maskable, and Apple touch icons.

All twenty-seven built-in reference articles and the pinned import dictionary are
pre-cached. Paste/TXT books are analyzed once and stored in IndexedDB, so they
reopen in airplane mode. EPUB remains deferred.

For a direct Android test install, open the successful **ScottBook CI** run for
the v0.32 commits, download the `ScottBook-Android-debug-…` artifact, extract it,
and install `ScottBook-v0.32.0-android-debug.apk`. Android may ask permission to
install apps from the browser or file manager used to open it. The debug APK is
not Play Store signed and its runner-generated debug key is not a durable
upgrade identity: if a later debug artifact reports a signature conflict,
export a ScottBook JSON backup before uninstalling the old build. A future
release keystore must remain owner-held and outside Git, patches, and CI logs.

After the owner signing configuration is complete, the manual **ScottBook
signed Android release** workflow produces
`ScottBook-v<version>-android-release.apk`. A debug installation cannot be updated
directly by this differently signed release APK: export JSON first, then follow
the signing guide's backup/uninstall/restore boundary. Key creation is deferred
without blocking normal builds; keep the first signed installation so the next
higher signed version can pass the upgrade smoke test.

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
