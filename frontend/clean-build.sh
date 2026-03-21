#!/bin/bash

# Prepora - Clean Build Script for Android
# This ensures the new package name takes effect

echo "🧹 Cleaning Expo cache..."
cd /app/frontend

# Clear Metro cache
rm -rf .expo
rm -rf .metro-cache
rm -rf node_modules/.cache

# Clear any existing Android build folders
rm -rf android/
rm -rf ios/

# Clear Expo cache
npx expo start -c --clear

echo "✅ Cache cleared!"
echo ""
echo "📱 Next steps to build Android with package name: co.median.android.odmaeyb"
echo ""
echo "Option 1 - EAS Build (Recommended):"
echo "  1. npm install -g eas-cli"
echo "  2. eas login"
echo "  3. eas build:configure"
echo "  4. eas build --platform android --profile production"
echo ""
echo "Option 2 - Local Build:"
echo "  1. npx expo prebuild --platform android --clean"
echo "  2. cd android && ./gradlew assembleRelease"
echo ""
echo "⚠️  Important: You MUST rebuild the app after changing package name!"
echo "    The old build will not have the new package name."
