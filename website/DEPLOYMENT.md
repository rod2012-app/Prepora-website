# GitHub Deployment Guide for Prepora Website

## 📋 Pre-Deployment Checklist

✅ Website files ready in `/app/website/`:
- index.html
- styles.css
- script.js
- README.md
- .gitignore

## 🚀 Deployment Steps

### Method 1: Using Emergent's GitHub Integration (Recommended)

#### Step 1: Connect GitHub Account
1. Go to your Emergent dashboard
2. Navigate to **Settings** → **Integrations**
3. Click **"Connect GitHub"**
4. Authorize Emergent to access your GitHub account

#### Step 2: Push to GitHub
1. In your Emergent project interface, look for **"Save to GitHub"** or **"Push to GitHub"** button
2. Create a new repository:
   - Repository name: `prepora-website` (or your preferred name)
   - Description: "Marketing website for Prepora meal planning app"
   - Public or Private: Choose **Public** (required for GitHub Pages free tier)
3. Click **"Create & Push"**

#### Step 3: Enable GitHub Pages
1. Go to your new GitHub repository: `https://github.com/YOUR_USERNAME/prepora-website`
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**:
   - Branch: Select `main`
   - Folder: Select `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for deployment

#### Step 4: Access Your Live Website
Your website will be available at:
```
https://YOUR_USERNAME.github.io/prepora-website/
```

---

### Method 2: Manual Git Push (Alternative)

If you prefer using Git commands:

```bash
# Navigate to website directory
cd /app/website

# Initialize Git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Prepora website"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/prepora-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Then follow **Step 3** from Method 1 to enable GitHub Pages.

---

## 🎨 Custom Domain Setup (Optional)

If you want a custom domain (e.g., `www.prepora.com`):

1. In your GitHub repository → Settings → Pages
2. Under **Custom domain**, enter your domain
3. Add DNS records at your domain registrar:
   ```
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```
4. Wait for DNS propagation (up to 24 hours)

---

## 🔧 Post-Deployment

### Verify Website
- [ ] Check all navigation links work
- [ ] Test responsive design on mobile
- [ ] Verify smooth scrolling
- [ ] Test "Try the App" button links to correct URL

### Update Links (if needed)
If you change the app's preview URL, update in `index.html`:
```html
<!-- Line ~323 -->
<a href="https://YOUR_NEW_URL.preview.emergentagent.com">
```

---

## 📊 Analytics Setup (Optional)

Add Google Analytics to track visitors:

1. Get your GA4 tracking code
2. Add before `</head>` in `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🐛 Troubleshooting

### Website not showing up?
- Wait 2-3 minutes after enabling Pages
- Check repository is **Public**
- Verify GitHub Pages is enabled in Settings

### CSS not loading?
- Clear browser cache
- Check file paths are relative (should be working by default)

### 404 Error?
- Ensure `index.html` is in the root of selected folder
- Check branch and folder selection in Pages settings

---

## 🔄 Updating the Website

To update your website after initial deployment:

1. Make changes to files in `/app/website/`
2. Use Emergent's "Save to GitHub" again
3. Or use Git commands:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push
   ```
4. Changes will be live in 1-2 minutes

---

## 📱 Alternative: Deploy to Other Platforms

### Netlify (Drag & Drop)
1. Go to [netlify.com](https://netlify.com)
2. Drag `/app/website` folder to Netlify drop zone
3. Get instant live URL

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `cd /app/website && vercel`
3. Follow prompts

---

## ✅ Success Checklist

After deployment, verify:
- [ ] Website is live and accessible
- [ ] All sections display correctly
- [ ] Navigation works smoothly
- [ ] Mobile responsive design looks good
- [ ] App preview link works
- [ ] Contact/social links updated (if applicable)

---

## 🎉 You're Done!

Your Prepora marketing website is now live on GitHub Pages!

**Share your website:**
- Tweet about it
- Add to your LinkedIn
- Share in communities
- Submit to product directories (Product Hunt, BetaList, etc.)

**Next Steps:**
- Set up analytics
- Add custom domain
- Create social media posts
- Start driving traffic to your app!

---

Need help? Check [GitHub Pages Documentation](https://docs.github.com/en/pages)
