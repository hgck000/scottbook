# ScottBook owner-held Android release signing

ScottBook can build a release APK only when one complete, owner-held signing
identity is supplied. The repository, `git am` patches, build logs, and uploaded
artifacts must never contain the private keystore or either password.

The public certificate SHA-256 fingerprint is deliberately checked on every
release build. This makes an accidental replacement key fail before an APK is
published under the wrong upgrade identity.

## 1. Create the key once on Windows

Install JDK 21, open PowerShell, and create a directory outside the ScottBook
repository:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.scottbook-signing"
keytool -genkeypair -v `
  -keystore "$env:USERPROFILE\.scottbook-signing\scottbook-release.jks" `
  -alias scottbook `
  -keyalg RSA `
  -keysize 4096 `
  -validity 10000 `
  -storetype JKS
```

Choose the passwords yourself at the prompts. Do not paste them into chat,
commit them, put them in a `.env` file inside ScottBook, or include them in a
screenshot. Losing this keystore or its passwords means future APKs cannot
update installations signed by it. Keep an encrypted offline backup in a
second physical location.

## 2. Record the public certificate fingerprint

```powershell
keytool -list -v `
  -keystore "$env:USERPROFILE\.scottbook-signing\scottbook-release.jks" `
  -alias scottbook
```

Copy only the 64-hex-character `SHA256` certificate fingerprint. Colons and
letter case do not matter to ScottBook. The fingerprint is public identity
evidence, not a private signing secret.

## 3. Configure GitHub Actions

Open **Repository → Settings → Secrets and variables → Actions**.

Create these repository **secrets**:

- `SCOTTBOOK_ANDROID_KEYSTORE_BASE64`
- `SCOTTBOOK_ANDROID_KEYSTORE_PASSWORD`
- `SCOTTBOOK_ANDROID_KEY_ALIAS`
- `SCOTTBOOK_ANDROID_KEY_PASSWORD`

Copy the keystore bytes to the clipboard for the first secret:

```powershell
[Convert]::ToBase64String(
  [IO.File]::ReadAllBytes(
    "$env:USERPROFILE\.scottbook-signing\scottbook-release.jks"
  )
) | Set-Clipboard
```

Create this repository **variable** with the public fingerprint from step 2:

- `SCOTTBOOK_ANDROID_CERT_SHA256`

The manual workflow decodes the keystore only into GitHub runner temporary
storage, builds and verifies the APK, then removes that temporary file even
after failure. It never echoes the base64 payload or passwords.

## 4. Run the signed build

Open **Actions → ScottBook signed Android release → Run workflow** when you are
ready to establish the first signed baseline. A successful run uploads one
artifact containing:

- `ScottBook-v<version>-android-release.apk`; and
- `ScottBook-v<version>-android-release-signing.json`.

The JSON report contains the APK SHA-256 and public certificate SHA-256. Compare
its certificate value with the repository variable before installing.

`npm run android:build:release` fails closed when a signing value is missing,
the keystore is inside the repository, `apksigner` rejects the APK, or the
certificate fingerprint differs. It does not fall back to an unsigned release.

## 5. Establish the upgrade baseline safely when ready

The existing CI debug APK has a different signature. Android cannot install the
new release-signed build over it.

1. Export ScottBook's JSON backup from the current debug app.
2. Verify that the backup file exists outside the app.
3. Uninstall the debug build only after that backup is safe.
4. Install the first owner-signed release APK and restore the JSON backup.
5. Run the Android device smoke test and complete its manual checklist.
6. Keep this installation for the next higher owner-signed version.

Reinstalling one APK with `adb install -r` does not prove a version upgrade.
Use `npm run android:upgrade:smoke` when the next higher version is signed with
the same key. The key may be created in a later milestone; normal CI does not
depend on it.
