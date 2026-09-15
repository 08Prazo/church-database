# Netlify Deployment Guide for The NewBrook New Souls Database

This project is configured for one-click deployment on [Netlify](https://www.netlify.com).

## 🚀 Quick Deployment Steps

### Option A: Deploy via GitHub (Recommended)
1. Push this project to your GitHub account (via AI Studio's **Export to GitHub** or manual git push).
2. Go to [Netlify Dashboard](https://app.netlify.com) and click **"Add new site"** > **"Import an existing project"**.
3. Choose **GitHub** and select your repository.
4. Netlify will auto-detect the build settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `20`
5. Click **"Deploy site"**.

---

### Option B: Deploy via Netlify Drag & Drop / CLI
1. Run `npm run build` locally.
2. Drag and drop the generated `dist` folder into the Netlify manual deploy area, or use:
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

---

## 🔑 Crucial Step: Authorize your Netlify Domain in Firebase

Firebase Authentication requires each web domain to be on its authorized list before allowing Google Sign-In:

1. Open your [Firebase Console](https://console.firebase.google.com).
2. Select project: **`resonant-anagram-5zp2g`** (or your custom Firebase project).
3. Navigate to **Authentication** > **Settings** (tab) > **Authorized domains**.
4. Click **"Add domain"** and enter your Netlify domain (for example, `your-site-name.netlify.app` or your custom church domain like `souls.thenewbrook.org`).
5. Click **Save**. Google Sign-In will immediately work on your Netlify deployment!

---

## ⚙️ Optional Environment Variables in Netlify

If you wish to override the embedded configuration with custom variables, you can set these in **Netlify Site Configuration** > **Environment variables**:

- `VITE_FIREBASE_API_KEY`: `AIzaSyCQdalJmiKWLxYFUQr_brJZOqY8_FcsOIc`
- `VITE_FIREBASE_AUTH_DOMAIN`: `resonant-anagram-5zp2g.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID`: `resonant-anagram-5zp2g`
- `VITE_FIREBASE_DATABASE_ID`: `ai-studio-5ba0fae2-6fe9-4bee-be86-0ae4612e16b0`
- `VITE_FIREBASE_STORAGE_BUCKET`: `resonant-anagram-5zp2g.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: `1068026986772`
- `VITE_FIREBASE_APP_ID`: `1:1068026986772:web:1d36241bbb608a25ff0201`
