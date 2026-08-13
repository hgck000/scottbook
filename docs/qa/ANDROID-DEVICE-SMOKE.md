# ScottBook Android device smoke test

This check installs a debug APK with `adb install -r`, launches ScottBook on one
explicit Android device, and records local evidence without uploading it.

It never runs `adb uninstall`, `pm clear`, or deletes ScottBook data. If Android
rejects an upgrade because the debug signature changed, the runner stops and
requires a manual backup-first decision.

## One-time Windows setup

1. Install Android SDK Platform-Tools, either through Android Studio or the
   official standalone package.
2. On the phone, enable **Developer options → USB debugging**.
3. Connect by USB, unlock the phone, and accept its debugging authorization.
4. In PowerShell, verify that exactly one line is marked `device`:

```powershell
adb devices -l
```

If `adb` is not on `PATH`, point ScottBook to the executable for this terminal:

```powershell
$env:SCOTTBOOK_ADB_PATH = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
```

## Run against the GitHub Actions APK

Download and extract `ScottBook-v0.29.0-android-debug.apk`, open PowerShell in
the ScottBook repository, then run:

```powershell
npm ci
npm run android:device:smoke -- "C:\Users\vligh\Downloads\ScottBook-v0.29.0-android-debug.apk"
```

When several devices or emulators are attached, choose the serial shown by
`adb devices -l`:

```powershell
npm run android:device:smoke -- "C:\Users\vligh\Downloads\ScottBook-v0.29.0-android-debug.apk" --serial "DEVICE_SERIAL"
```

The default evidence folder is `artifacts/android-device-smoke-<timestamp>/`.
It contains:

- `scottbook-launch.png`: the launched app screen;
- `scottbook-logcat.txt`: at most 400 app-process log lines;
- `device-smoke-report.json`: machine-readable checks; and
- `device-smoke-report.md`: device/OS/app versions plus the remaining manual
  checkboxes.

The report includes model and Android version because they are required QA
evidence. It intentionally excludes the ADB serial. Nothing is uploaded by the
command.

## What the runner proves

- `adb install -r` succeeds without an automatic uninstall;
- the packaged version equals `package.json`;
- the effective installed APK does not request Internet permission;
- `MainActivity` launches, stays foreground, and owns a running process;
- Android accessibility can see ScottBook content inside the WebView; and
- a non-empty PNG screenshot can be captured.

It cannot prove touch layout, visual opacity, airplane-mode reopen, saved
position, or Android Back semantics. Complete those five short checkboxes in
the generated Markdown report on the actual phone.

## Failure handling

- `unauthorized`: unlock the phone and accept the USB-debugging dialog.
- `offline`: reconnect USB, switch cable/port, then rerun `adb devices -l`.
- multiple devices: pass `--serial`; ScottBook never guesses the target.
- `INSTALL_FAILED_UPDATE_INCOMPATIBLE`: export ScottBook's JSON backup first.
  Do not uninstall merely to make the test green.
- accessibility-content failure: inspect `scottbook-launch.png` for a blank or
  stuck WebView and keep the report/log as failure evidence.
