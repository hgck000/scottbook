# ScottBook v0.29.0 safe signed-upgrade gate

Date: 2026-08-13
Status: Upgrade tooling ready; owner key and two-version physical-device evidence intentionally deferred

## Outcome

Version 0.29 prepares a data-preserving Android upgrade gate without requiring
the owner to create the release key now. The key can be created later; the first
version signed at that time becomes the baseline, and the next higher signed
version becomes the candidate.

`npm run android:upgrade:smoke -- <candidate> --backup <json>` verifies a fresh
ScottBook backup, reads the installed and candidate versions, compares their
real APK signing certificates, rejects Internet permission, and stops before
installation on any mismatch. Only after all preflight checks pass does it use
`adb install -r`.

After installation it verifies the expected version, launches MainActivity,
checks process/foreground/accessibility state, captures a screenshot, and
writes local JSON/Markdown evidence with manual data-retention checkboxes.

## Safety boundary

- No `adb uninstall`, `pm clear`, downgrade flag, rollback, or automatic data
  deletion exists in the runner.
- The backup must have a valid SHA-256 checksum, match the installed app
  version, and be at most 24 hours old.
- Candidate `versionCode` must be strictly higher.
- Installed and candidate certificate SHA-256 values must match.
- The optional configured owner fingerprint adds another equality check.
- Temporary installed-APK bytes are removed immediately after certificate
  inspection.
- Reports exclude device serial, backup contents, and signing secrets.

## Deferred key decision

Version 0.28 described v0.28 → v0.29 as the first possible signed upgrade.
Because the owner chose not to create the key yet, that exact version pair is
no longer required. Nothing is broken and normal CI remains secret-free.

When signing is enabled later:

1. build/install the first owner-signed version and keep it installed;
2. export a fresh JSON backup from that version;
3. build the next higher version with the same key; and
4. run the v0.29 upgrade command to produce evidence.

## v0.28 CI follow-up

The previously failing **Browser journeys** job passed after the Reader stopped
inheriting a library scroll offset for articles without saved progress. Core,
Windows, macOS, the 34-case browser matrix, and Android debug APK build all
passed on the pushed v0.28 commit.

## Manual verification

For now:

1. Apply/push v0.29 and confirm normal **ScottBook CI** remains fully green.
2. Confirm the debug artifact is named `ScottBook-v0.29.0-android-debug.apk`.
3. Run `npm run android:upgrade:smoke` without arguments and confirm it refuses
   to proceed instead of touching ADB.
4. Do not run the signed workflow or upgrade command until a stable key and two
   consecutive signed versions exist.

Later, follow
[`../qa/ANDROID-UPGRADE-SMOKE.md`](../qa/ANDROID-UPGRADE-SMOKE.md), complete all
manual retention rows, and keep the report outside Git.

## Automated evidence

| Gate | v0.29 coverage | Local result before patch handoff |
| --- | --- | --- |
| Unit/integration | Backup checksum/freshness, AAPT metadata, package paths, version/certificate preflight, destructive-command exclusion plus existing behavior | 161/161 passed |
| Lint/typecheck/security | App and Node tooling without runtime network expansion | Passed; 7 runtime licenses audited, 0 vulnerabilities |
| PWA root/subpath | Offline artifact contracts at version 0.29.0 | Both sequential builds passed |
| Android native | Version code 29, local assets, Back plugin, no remote server | `android:sync` passed |
| Browser matrix | Existing 34 desktop/mobile production journeys | Defined; GitHub Actions authoritative |
| Signed upgrade | Runner and evidence contract | Automated logic tested; owner device execution deferred |

## Product boundary unchanged

- Import remains locked: Paste/TXT requires later approval, EPUB remains later,
  and PDF/OCR remain excluded.
- There is no account, cloud sync, telemetry, scoring, streak, goal,
  gamification, or commercial service.
- The upgrade runner changes no Reader UI, local-data schema, library content,
  pinyin, Hán-Việt, or backup schema.
