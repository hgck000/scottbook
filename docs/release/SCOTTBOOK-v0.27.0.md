# ScottBook v0.27.0 repeatable Android device QA

Date: 2026-08-13
Status: Device-validation tooling milestone; real-phone result still pending

## Outcome

Version 0.27 turns the Android manual gate into a repeatable, evidence-producing
command without pretending that a real phone has already passed.

`npm run android:device:smoke -- <apk>` now:

1. resolves `adb` from `SCOTTBOOK_ADB_PATH`, the configured Android SDK, or
   `PATH`;
2. requires exactly one authorized target unless `--serial` names one;
3. installs with `adb install -r`, preserving the app-data boundary;
4. stops and launches `io.github.hgck000.scottbook/.MainActivity`;
5. verifies the running process, resumed Activity, package version, and absence
   of the effective `android.permission.INTERNET` request;
6. uses Android UI Automator accessibility output to reject an Activity whose
   WebView never exposes ScottBook content;
7. captures one PNG plus at most 400 app-process log lines; and
8. writes JSON evidence plus a short Markdown checklist for the interactions
   that automation cannot honestly certify.

The report records manufacturer, model, Android version, SDK version, and app
version. It excludes the ADB serial and is stored only in the gitignored local
`artifacts/` directory. The command uploads nothing.

## Data-safety boundary

The runner never calls `adb uninstall`, `pm clear`, or any ScottBook storage
API. When `INSTALL_FAILED_UPDATE_INCOMPATIBLE` reveals that a GitHub runner used
a different debug key, the command stops, explains the signature boundary, and
requires a JSON backup before the owner makes any uninstall decision.

This preserves the v0.25–v0.26 rule that debug APKs are test artifacts rather
than a durable upgrade identity. A stable signed upgrade still belongs to the
owner-held keystore milestone; no key or password is generated, committed, or
requested by v0.27.

## Product boundary

Version 0.27 changes no Reader behavior, local-data schema, backup schema, Hán-
Việt data, content, account boundary, or import state. The remaining UI polish
reported after v0.26 can be applied from concrete device evidence without
mixing it into this reusable validation tool.

## Manual verification

1. Apply/push v0.26 before v0.27, then wait for the v0.27 **ScottBook CI** run.
   Confirm all jobs pass and download/extract
   `ScottBook-v0.27.0-android-debug.apk`.
2. Install official Android SDK Platform-Tools, enable USB debugging, connect
   and unlock the target phone, accept its authorization, then run
   `adb devices -l`. Exactly one target should show `device`.
3. From the ScottBook repository on Windows, run:

   ```powershell
   npm ci
   npm run android:device:smoke -- "C:\Users\vligh\Downloads\ScottBook-v0.27.0-android-debug.apk"
   ```

4. Open the generated `artifacts/android-device-smoke-…/device-smoke-report.md`.
   Confirm every automated row is checked and inspect
   `scottbook-launch.png` for the actual library rather than a blank/stuck
   WebView.
5. Turn on airplane mode, force-stop, reopen, and confirm the complete library,
   pinyin, Hán-Việt, and Vietnamese meanings remain available.
6. In Reader, confirm the toolbar/footer are opaque and the assistance selector
   contracts to `字 / 词 / 句` after scrolling.
7. Open assistance, settings, and **Từ trong bài** separately. Press Android
   Back and confirm the open surface closes before route navigation; Back at
   the library root may exit.
8. Change theme/size, favorite an article, reveal a word, and remember the
   reading position. Force-stop/reopen and confirm all state remains.
9. Check all five manual rows in the Markdown report only after observing them.
   Keep the folder as local evidence; do not commit device logs/screenshots.
10. If installation reports an incompatible signature, export JSON first. Do
    not uninstall simply to turn this milestone green.

## Automated evidence

| Gate | Coverage expected from the patch | Local result |
| --- | --- | --- |
| Unit/integration | Seven ADB parser/selection/version/resumed-Activity/path/signature-safety tests plus all existing application behavior | 145/145 passed |
| Lint and type check | Application, package version, and existing TypeScript contracts | Passed |
| Security | CSP/browser API audit, seven runtime licenses, dependency advisories, source and installed-APK Internet-permission checks | Passed locally except installed-APK device check, which requires the phone |
| Root + `/scottbook/` PWA | Existing manifest/service-worker/deployment contracts | Passed |
| Android native bundle | Version code 27/name 0.27.0, local assets, App Back plugin, no remote server | Passed through sync |
| Browser matrix | Existing 34 desktop/mobile Chrome cases | Defined; GitHub Actions is authoritative because this workspace has no Chrome executable |
| Physical Android | ADB command, evidence schema, and manual checklist | Runner ready; owner device execution pending |

## Still outside this version

- A claim that any specific phone passed; only the owner can record that result.
- A stable release keystore, signed release APK/AAB, and upgrade proof.
- Approved Paste/TXT import; EPUB remains later, and PDF/OCR remain excluded.
- Accounts, cloud sync, scores, streaks, goals, gamification, telemetry, and
  commercial services.
