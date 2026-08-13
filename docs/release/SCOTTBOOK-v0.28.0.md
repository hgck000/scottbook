# ScottBook v0.28.0 owner-held Android signing foundation

Date: 2026-08-13
Status: Signing path ready; owner key configuration and v0.28 → v0.29 upgrade evidence pending

## Outcome

Version 0.28 adds a fail-closed Android release-signing path without creating,
storing, or requesting the owner's private credentials in source control.

`npm run android:build:release` now requires a keystore outside the repository,
all four Gradle signing values, and the expected public certificate SHA-256. It
runs release unit tests and lint, assembles the APK, verifies its signature with
Android `apksigner`, compares the actual certificate fingerprint, and writes an
APK checksum/fingerprint report next to the artifact.

A separate manual GitHub Actions workflow reconstructs the owner-provided
keystore only in runner temporary storage, uploads the signed APK plus public
evidence, and removes the temporary key file with an `always()` cleanup step.
Normal pushes continue building the disposable debug APK and never require or
read release-signing secrets.

## Browser CI correction

The v0.27 push had one failing **Browser journeys** case. The desktop Reader
inherited the library route's scroll offset, so its assistance selector mounted
compact before the test's first assertion. The Reader now resets to the top
when an article has no saved position, while an article with a saved sentence
continues to restore that exact anchor. The E2E case deliberately enters from a
scrolled library page and checks expanded → compact → expanded behavior.

This fixes the product navigation state that the test exposed; retries and
longer timeouts are not used to conceal it.

## Security boundary

- The private keystore and passwords stay owner-held and outside Git.
- A partial signing configuration fails; no unsigned release is emitted.
- A keystore path inside the repository fails in both Node and Gradle guards.
- The expected certificate fingerprint is checked after APK assembly.
- GitHub receives secrets only through repository Actions configuration.
- The public APK certificate fingerprint and APK checksum may be retained as
  release evidence.

The workflow cannot prove that the owner has backed up the key. That remains a
manual responsibility described in
[`../qa/ANDROID-RELEASE-SIGNING.md`](../qa/ANDROID-RELEASE-SIGNING.md).

## Manual verification

1. Confirm the normal **ScottBook CI** run is fully green, including all 34
   browser journeys and **Build Android debug APK**.
2. Create exactly one release keystore outside the repository and keep a second
   encrypted offline backup. Never send the passwords through chat.
3. Configure the four repository secrets and one public fingerprint variable
   listed in the signing guide.
4. Manually run **ScottBook signed Android release**. Confirm the uploaded ZIP
   contains the v0.28 APK and signing JSON but no `.jks` or `.keystore` file.
5. Compare `certificateSha256` in the JSON with the repository variable.
6. Export a JSON data backup from any installed debug build before uninstalling
   it, because debug and release signatures cannot update each other.
7. Install the release APK, restore the backup, enable airplane mode, and run
   the v0.27 ADB smoke command against the release APK.
8. Confirm pinyin, Hán-Việt, meaning, Android Back, opaque fixed controls,
   preferences, favorite, and reading position on the phone.
9. Run the signed workflow a second time without replacing the secrets. Confirm
   its certificate fingerprint remains identical and `adb install -r` succeeds.
10. Retain that installation for the v0.29 higher-version upgrade test.

## Automated evidence expected

| Gate | v0.28 coverage | Local result before patch handoff |
| --- | --- | --- |
| Unit/integration | Signing config, fingerprint parsing, external-key boundary, SDK tool selection plus existing behavior | 153/153 passed |
| Browser matrix | Scrolled-library entry plus all existing desktop/mobile journeys | Defined; GitHub Actions authoritative |
| Lint/typecheck/security | App, scripts, dependency audit, no runtime network expansion | Passed; 7 runtime licenses, 0 vulnerabilities |
| PWA root/subpath | Existing offline artifact contracts at version 0.28.0 | Both passed sequentially |
| Android debug | Version code 28, native local bundle, CI debug APK | Native sync passed; APK build remains authoritative in pushed CI |
| Android release | Fail-closed Gradle/Node/workflow contract | Static/tests locally; real signed build requires owner key |

## Still outside this version

- A claim that an owner-signed v0.28 APK was built; only the owner workflow run
  can supply that evidence after secret configuration.
- A proven v0.28 → v0.29 in-place signed upgrade retaining WebView data.
- Play Store/AAB publishing or public distribution.
- Approved Paste/TXT import; EPUB remains later, PDF/OCR remain excluded.
- Accounts, sync, telemetry, scores, streaks, goals, gamification, or commerce.
