#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
SDK="$(xcrun --sdk iphonesimulator --show-sdk-path)"
OUT="$PWD/.private/NeoDirector.app"
mkdir -p "$OUT" "$PWD/.private/ios-module-cache"
xcrun swiftc -parse-as-library -target arm64-apple-ios26.0-simulator -sdk "$SDK" -module-cache-path "$PWD/.private/ios-module-cache" ios/PlanCore.swift ios/NeoDirectorApp.swift -o "$OUT/NeoDirector"
cp fixtures/synthetic-campsite.png "$OUT/"
cat > "$OUT/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleIdentifier</key><string>dev.neodirector.simulator</string>
<key>CFBundleName</key><string>Neo Director</string>
<key>CFBundleExecutable</key><string>NeoDirector</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>0.1</string>
<key>CFBundleVersion</key><string>1</string>
<key>MinimumOSVersion</key><string>26.0</string>
<key>UIDeviceFamily</key><array><integer>1</integer></array>
<key>UILaunchScreen</key><dict/>
<key>UISupportedInterfaceOrientations</key><array><string>UIInterfaceOrientationPortrait</string></array>
</dict></plist>
PLIST
echo "$OUT"
