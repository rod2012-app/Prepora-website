# Android Build Configuration Guide for Prepora

## ✅ Package Name Fixed

Your `app.json` has been updated with the correct Android package name:
```json
"android": {
  "package": "co.median.android.odmaeyb"
}
```

---

## 🔧 What Was Changed

### Updated in `/app/frontend/app.json`:

1. **App Name**: Changed from "frontend" to "Prepora"
2. **Android Package**: Set to `co.median.android.odmaeyb`
3. **Android Version Code**: Set to 1
4. **iOS Bundle Identifier**: Set to `com.prepora.app`
5. **Primary Color**: Set to coral `#FF9B85`
6. **Description**: Added app description
7. **Permissions**: Added necessary Android permissions
8. **Splash Screen**: Updated background color to match brand

---

## 📱 Building Your Android App

### Option 1: Using EAS Build (Recommended)

**Step 1: Install EAS CLI**
```bash
npm install -g eas-cli
```

**Step 2: Login to Expo**
```bash
eas login
```

**Step 3: Configure EAS**
```bash
cd /app/frontend
eas build:configure
```

**Step 4: Build Android APK/AAB**

For APK (for testing):
```bash
eas build --platform android --profile preview
```

For AAB (for Google Play Store):
```bash
eas build --platform android --profile production
```

**Step 5: Download the Build**
Once complete, EAS will provide a download link for your APK/AAB.

---

### Option 2: Local Build (Alternative)

**Requirements:**
- Android Studio installed
- Android SDK configured
- Java JDK 11+

**Steps:**
```bash
cd /app/frontend

# Generate Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
```

---

## 🏪 Google Play Store Submission

### 1. Create App Bundle (AAB)
```bash
eas build --platform android --profile production
```

### 2. Prepare Store Listing
- **App Name**: Prepora
- **Short Description**: AI-powered meal planning. Plan smart. Eat better. Live easier.
- **Full Description**: Use the content from `/app/RELEASE_NOTES.md`
- **Package Name**: `co.median.android.odmaeyb` ✓
- **Category**: Food & Drink
- **Content Rating**: Everyone

### 3. Required Assets
- ✅ **Icon**: 512x512 PNG (already in assets)
- ✅ **Feature Graphic**: 1024x500 (already created)
- ✅ **Screenshots**: Phone screenshots (already generated)
- ✅ **Screenshots**: Tablet screenshots (already generated)

### 4. Upload to Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app (if not created)
3. Upload your AAB file
4. Fill in store listing details
5. Set content rating
6. Set pricing (Free)
7. Submit for review

---

## 🔐 App Signing

### For Production (Recommended):
Use **Google Play App Signing** (automatic with EAS Build)

### For Manual Signing:
```bash
# Generate keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore prepora-release-key.keystore \
  -alias prepora-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000

# Store credentials securely
```

---

## ⚙️ EAS Build Configuration

Create `/app/frontend/eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 📋 Pre-Build Checklist

Before building, ensure:
- [x] Package name set: `co.median.android.odmaeyb`
- [x] Version code: 1
- [x] Version name: 1.0.0
- [x] App name: Prepora
- [x] Icon ready (512x512)
- [x] Adaptive icon configured
- [x] Splash screen configured
- [x] Permissions declared
- [x] Color scheme set

---

## 🎨 App Icons

Your app uses these icons:
- **Icon**: `./assets/images/icon.png` (512x512)
- **Adaptive Icon**: `./assets/images/adaptive-icon.png`
- **Splash Icon**: `./assets/images/splash-icon.png`

Make sure these files exist and are properly sized!

---

## 🔍 Verify Package Name

After building, verify your package name:
```bash
# For APK
aapt dump badging app-release.apk | grep package

# Should show: package: name='co.median.android.odmaeyb'
```

---

## 🐛 Troubleshooting

### "Package name mismatch"
- Check `app.json` → `expo.android.package`
- Rebuild the app after changing package name
- Clear Expo cache: `npx expo start -c`

### "Build failed"
- Run `npx expo-doctor` to check for issues
- Ensure all dependencies are up to date
- Check EAS build logs for specific errors

### "App not installing"
- Enable "Install unknown apps" on Android
- Check if APK is signed properly
- Verify minimum SDK version compatibility

---

## 📱 Testing on Device

### Install APK on Android:
1. Enable "Developer Options" on device
2. Enable "USB Debugging"
3. Connect device via USB
4. Install APK:
   ```bash
   adb install app-release.apk
   ```

### Test via Expo Go (Development):
1. Open Expo Go app
2. Scan QR code from `expo start`
3. App will load with your package configuration

---

## 🚀 Release Process

1. **Update version** in `app.json`
2. **Build** APK/AAB using EAS
3. **Test** thoroughly on multiple devices
4. **Upload** to Google Play Console
5. **Submit** for review
6. **Monitor** release rollout

---

## 📊 Version Management

Current version:
- **Version Name**: 1.0.0
- **Version Code**: 1

For future updates:
- Increment `versionCode` for each new build
- Update `version` for user-facing releases
- Keep track in release notes

---

## ✅ Summary

Your Android app is now configured with:
- ✅ Package name: `co.median.android.odmaeyb`
- ✅ Proper branding (Prepora)
- ✅ Required permissions
- ✅ Splash screen & icons
- ✅ Production-ready settings

**Ready to build and deploy to Google Play Store!** 🎉

---

## 🆘 Need Help?

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Google Play Console**: https://play.google.com/console
- **Expo Forums**: https://forums.expo.dev/

---

**Next Steps:**
1. Run `eas build --platform android --profile production`
2. Wait for build to complete (~15-20 minutes)
3. Download AAB file
4. Upload to Google Play Console
5. Submit for review!
