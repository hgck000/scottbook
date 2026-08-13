# ScottBook v0.25.0 Android debug APK baseline

Date: 2026-08-13
Status: Installable Android debug milestone; not a signed release channel

## Outcome

Version 0.25 adds the first real Android package without forking ScottBook's
reader or introducing a web server. Capacitor 8.5 wraps the existing React
frontend under the fixed Android identity `io.github.hgck000.scottbook`.

The Android build is deliberately separate from the PWA build:

- `vite build --mode native` disables manifest and service-worker generation;
- `cap sync android` copies the complete generated frontend into the Android
  project's packaged assets;
- native startup treats that bundle as offline-ready and suppresses browser
  install/update UI; and
- automated verifiers reject a remote `server.url`, cleartext development
  server, missing local entrypoint, browser service worker, or version drift.

The nine authored HSK 1–3 articles, character annotations, pinyin, and
Vietnamese meanings therefore ship inside the APK and need no first-run
download. The Android manifest requests no Internet permission and disables OS
cloud backup. ScottBook's manual checksummed JSON export remains the explicit
way to move or protect local reading data.

The native project also includes:

- Android application version code 25 and version name 0.25.0;
- minimum SDK 24 and target/compile SDK 36 from the Capacitor template;
- ScottBook launcher, adaptive icon, and launch-screen artwork;
- Capacitor SystemBars safe-inset injection with CSS fallbacks for browser PWAs;
  and
- a cross-platform Node wrapper that runs `gradlew.bat` on Windows or
  `./gradlew` elsewhere and copies the finished APK to
  `artifacts/ScottBook-v0.25.0-android-debug.apk`.

GitHub Actions now builds and retains that APK as
`ScottBook-Android-debug-<commit>`. The existing Ubuntu, Windows, macOS, unit,
security, PWA artifact, and browser-journey gates remain in the same workflow.

## v0.24 CI correction

The pushed v0.24 application displayed the correct persistent connection chip,
but its final browser journey selected the whole page with `getByRole("status")`.
The page legitimately contains more than one live status region, so Playwright
strict mode rejected the ambiguous locator in desktop and mobile Chrome.

Version 0.25 assigns a stable test id to the connection chip and uses that
specific element in both offline journeys. This changes no reader behavior or
accessibility role; it repairs the test's ownership of the status it asserts.

## Local-data and privacy contract

Version 0.25 adds no reading-data field, IndexedDB migration, backup field,
account, cloud sync, analytics, score, streak, goal, gamification, remote
translation, or content import. Existing v0.24 browser data and backups remain
compatible.

Android WebView storage is a separate local app origin. PWA/browser data is not
silently copied into the APK, and uninstalling the APK can delete its local
data. Use ScottBook's JSON export before uninstalling once meaningful Android
reading state exists.

## Debug-signing boundary

The CI artifact uses Android's debug signing path. It is installable after the
user permits sideloading from the chosen browser or file manager, but it is not
a durable release identity. Different machines or clean GitHub runners can use
different debug keys, so a later debug APK may require uninstalling the old
one before installation.

A stable in-place upgrade channel requires one release keystore created and
retained by `hgck000`. The private keystore and passwords must never be
committed, embedded in a `git am` patch, printed in logs, or generated anew for
each release. Version 0.25 intentionally does not invent that credential.

## Manual verification

1. Apply both v0.25 commits, push `main`, and open the resulting **ScottBook CI**
   run. Confirm **Core quality and portable PWA**, **Browser journeys**, Windows,
   macOS, and **Build Android debug APK** all pass.
2. Download the `ScottBook-Android-debug-…` workflow artifact and extract
   `ScottBook-v0.25.0-android-debug.apk` from its ZIP container.
3. On an Android 7.0 or newer test device, allow installation from the browser
   or file manager used to open the APK, then install it. Confirm Android labels
   the app **ScottBook** and shows the ScottBook book icon rather than a
   Capacitor logo.
4. Turn on airplane mode before the first app launch. Open ScottBook and confirm
   the branded launch screen leads to the complete nine-article library without
   a blank page, host error, sign-in, download request, or browser **Cài app**
   prompt.
5. Open **Buổi sáng của tôi**. Tap `早上` once for `zǎoshang`, a second time for
   its authored Vietnamese meaning, and a third time to close assistance.
   Confirm all three steps work while airplane mode remains enabled.
6. Change to Night or OLED, adjust text size and line spacing, favorite the
   article, and reveal at least one word. Force-stop ScottBook, reopen it still
   in airplane mode, and confirm those local choices and reading position remain.
7. Inspect portrait mode and, if the device supports it, landscape/cutout mode.
   Confirm the toolbar, connection chip, bottom navigation, settings sheet, and
   assistance sheet do not sit under system bars or the display cutout.
8. Use Android's hardware/system Back action from Reader. Confirm navigation
   returns to the previous ScottBook route rather than leaving a blank WebView.
9. Confirm the native app never shows a browser service-worker update notice.
   The APK changes only when another APK is installed.
10. Re-enable connectivity and repeat library search, cross-article vocabulary
    context, Review, and Reader assistance. Confirm the bundled library behaves
    identically and no account or remote content appears.
11. Export a ScottBook JSON backup and keep the file outside the app before any
    uninstall test. Record separately whether download and restore work on the
    chosen Android WebView/file picker; physical-device evidence is still
    pending in this milestone.
12. Do not treat installing a later CI debug artifact over this build as release
    evidence. If Android reports an incompatible signature, preserve the JSON
    backup, uninstall the old debug build, and make a fresh install.

## Automated evidence

| Gate | Coverage expected from the patch | Local result |
| --- | --- | --- |
| Unit/integration | Native offline-ready state plus all existing reader, storage, review, backup, and PWA behavior | 132/132 passed |
| Lint and type check | React, TypeScript, Capacitor runtime branch, verifiers, and workflows | Passed |
| Browser matrix | Specific connection chip across the prior 34 desktop/mobile production cases | 34 cases defined; local launch blocked because this workspace has no Chrome executable |
| Security | Runtime licenses, dependency advisories, no Android Internet permission, disabled Android cloud backup | Passed for 6 runtime packages; 0 vulnerabilities |
| PWA artifacts | Root and `/scottbook/` manifest/service-worker contract remains unchanged | Both passed |
| Native web bundle | Local entrypoint, fixed identity/version, no PWA manifest/service worker, no remote server URL | Passed through `android:sync` |
| Android APK | Gradle unit test, lint, `assembleDebug`, and retained GitHub Actions artifact | Pending pushed CI and device install |

## Still outside this version

- A release keystore, signed release APK/AAB, Play Store publishing, and stable
  in-place Android upgrades.
- Confirmed behavior on a physical Android device; CI proves the build, not the
  device experience.
- Separate Windows, macOS, or native iOS wrappers. Their current supported path
  remains the installable PWA/Home Screen app.
- An approved external-content import pipeline or configurable translation
  language.
- Accounts, cloud sync, scores, streaks, goals, gamification, telemetry, and
  commercial services, by deliberate product choice.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.
