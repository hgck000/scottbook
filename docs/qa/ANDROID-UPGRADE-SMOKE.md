# ScottBook safe Android signed-upgrade smoke test

This command proves an in-place Android upgrade only after two consecutive APK
versions have been signed by the same owner-held key. It is intentionally
usable later: creating the key is not required to build, test, or apply the
current unsigned/debug milestone.

The runner never invokes `adb uninstall`, `pm clear`, downgrade flags, or any
command that deliberately removes app data.

## Required state

- One older owner-signed ScottBook APK is already installed.
- The candidate APK has a strictly higher `versionCode`.
- Both APKs use the same signing certificate.
- A ScottBook JSON backup was exported from the installed version within the
  last 24 hours and remains outside the app.
- Android SDK Platform-Tools and Build-Tools are installed.

Do not use independently generated GitHub debug APKs as the two versions. Their
debug certificates may differ, and the preflight will correctly stop.

## Run on Windows

Connect and authorize exactly one USB-debugging phone, then open PowerShell in
the ScottBook repository:

```powershell
adb devices -l
npm ci
npm run android:upgrade:smoke -- `
  "C:\Users\vligh\Downloads\ScottBook-candidate-android-release.apk" `
  --backup "C:\Users\vligh\Downloads\ScottBook-backup-YYYY-MM-DD.json"
```

When several devices are connected, append:

```powershell
--serial "DEVICE_SERIAL"
```

ScottBook resolves tools from the Android SDK. Individual executable overrides
are available when the SDK is installed in a nonstandard location:

```powershell
$env:SCOTTBOOK_ADB_PATH = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$env:SCOTTBOOK_AAPT_PATH = "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.0.0\aapt.exe"
$env:SCOTTBOOK_APKSIGNER_PATH = "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.0.0\apksigner.bat"
```

If `SCOTTBOOK_ANDROID_CERT_SHA256` is set, both installed and candidate APKs
must also match that public owner fingerprint. Without it, the runner still
requires the two actual APK certificates to match each other.

## Preflight before any install

The command stops before `adb install` unless all checks pass:

1. backup schema and SHA-256 checksum are valid;
2. backup is no more than 24 hours old;
3. backup app version equals the installed app version;
4. the candidate package is exactly `io.github.hgck000.scottbook`;
5. candidate `versionCode` is higher than the installed value;
6. neither installed nor candidate package requests Internet permission; and
7. installed and candidate certificate SHA-256 fingerprints are identical.

To compare the installed certificate, the runner pulls only its base APK into a
random local temporary directory, verifies it, and immediately removes that
temporary copy. It does not read WebView storage or backup contents.

## Upgrade and evidence

After preflight, the runner uses only `adb install -r`. It then launches the
fixed MainActivity and verifies the candidate version, offline permission
boundary, process, foreground Activity, accessibility-visible ScottBook
content, and screenshot capture.

Evidence is written locally under `artifacts/android-upgrade-<timestamp>/`:

- `android-upgrade-report.json`
- `android-upgrade-report.md`
- `scottbook-after-upgrade.png`

The report excludes the ADB serial, backup contents, installed APK bytes, and
all private signing material. Complete its five manual checkboxes only after
confirming preferences, favorites, reading position, Review state, and offline
reading survived.

If a post-install check fails, keep the verified backup and evidence. Do not
uninstall merely to make the report green.
