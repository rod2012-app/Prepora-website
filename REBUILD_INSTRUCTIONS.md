# 🔄 How to Rebuild with New Package Name

## ⚠️ IMPORTANT
Your `app.json` already has the correct package name: **`co.median.android.odmaeyb`**

However, you MUST rebuild the app for this change to take effect!

---

## 🚀 Step-by-Step Rebuild Instructions

### Option 1: EAS Build (Recommended - Easiest)

**Step 1: Install EAS CLI**
```bash
npm install -g eas-cli
```

**Step 2: Navigate to frontend directory**
```bash
cd /app/frontend
```

**Step 3: Login to Expo**
```bash
eas login
```
*Enter your Expo credentials*

**Step 4: Configure EAS (First time only)**
```bash
eas build:configure
```
*Press Enter to accept defaults*

**Step 5: Build Android App**

For **APK** (for testing):
```bash
eas build --platform android --profile preview
```

For **AAB** (for Google Play Store):
```bash
eas build --platform android --profile production
```

**Step 6: Wait for Build**
- Build takes 15-20 minutes
- You'll get a download link when complete
- Download and install the APK/AAB

**Step 7: Verify Package Name**
After downloading the APK:
```bash
aapt dump badging prepora.apk | grep package
```
Should show: `package: name='co.median.android.odmaeyb'`

---

### Option 2: Local Build (Advanced)

**Requirements:**
- Android Studio installed
- Android SDK configured
- Java JDK 11+

**Steps:**

1. **Clean previous builds**
```bash
cd /app/frontend
rm -rf android/
rm -rf .expo/
```

2. **Generate Android project with new config**
```bash
npx expo prebuild --platform android --clean
```

3. **Build the APK**
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

4. **Find your APK**
```bash
ls -la app/build/outputs/apk/release/
```

---

## 📋 Verification Checklist

Before building, verify:
- [x] Package name in app.json: `co.median.android.odmaeyb`
- [x] App name: "Prepora"
- [x] Version code: 1
- [x] All icons present

After building, verify:
- [ ] Downloaded APK/AAB file
- [ ] Package name matches (use `aapt dump badging`)
- [ ] App installs on device
- [ ] App shows "Prepora" name
- [ ] All features work

---

## 🎯 Quick Command Reference

**Check current package name in app.json:**
```bash
grep -A 1 '"package"' /app/frontend/app.json
```

**Build for production:**
```bash
eas build --platform android --profile production
```

**Build for testing:**
```bash
eas build --platform android --profile preview
```

**Check build status:**
```bash
eas build:list
```

---

## 🐛 Troubleshooting

### "Package name still wrong after build"
❌ You're using an old build
✅ Solution: Rebuild the app using EAS or expo prebuild

### "eas: command not found"
❌ EAS CLI not installed
✅ Solution: `npm install -g eas-cli`

### "Not logged in"
❌ Need to authenticate
✅ Solution: `eas login`

### "Build failed"
❌ Check build logs
✅ Solution: `eas build:view` or check email for error details

---

## ✅ Current Configuration Status

Your app.json is correctly configured:
```json
{
  "expo": {
    "name": "Prepora",
    "slug": "prepora",
    "android": {
      "package": "co.median.android.odmaeyb",  ✅ CORRECT
      "versionCode": 1
    }
  }
}
```

**The configuration is READY. You just need to BUILD!**

---

## 🎬 What Happens Next

1. **Run build command** → EAS starts building
2. **Wait 15-20 minutes** → Build completes in cloud
3. **Get download link** → Via email or CLI
4. **Download APK/AAB** → Save to your device
5. **Test or publish** → Install for testing or upload to Play Store

---

## 📱 After Building

### For Testing (APK):
1. Enable "Install unknown apps" on Android
2. Transfer APK to device
3. Install and test

### For Play Store (AAB):
1. Go to Google Play Console
2. Create new release
3. Upload AAB file
4. Fill in release notes
5. Submit for review

---

## 💡 Pro Tips

- **First build**: Use `--profile preview` to get APK for quick testing
- **Production build**: Use `--profile production` for Play Store AAB
- **Save time**: EAS builds in the cloud, no local setup needed
- **Track builds**: Check status anytime with `eas build:list`

---

## 🆘 Need Help?

Still seeing the error? Make sure you:
1. ✅ Updated app.json (already done)
2. ✅ **Rebuilt the app** (this is the key step!)
3. ✅ Downloaded the NEW build
4. ✅ Not using an old cached build

**The package name is already set correctly. You just need to rebuild!**

---

## 🚀 Ready to Build?

Run this command now:
```bash
cd /app/frontend && eas build --platform android --profile production
```

Or if you don't have EAS setup yet:
```bash
npm install -g eas-cli && cd /app/frontend && eas login && eas build:configure && eas build --platform android --profile production
```

---

**Your package name is configured. Now rebuild the app to make it active!** ✅
