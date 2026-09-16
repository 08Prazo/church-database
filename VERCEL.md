# Vercel Deployment Guide for The NewBrook New Souls Database

This project is configured for seamless one-click deployment on [Vercel](https://vercel.com).

## 🚀 Quick Deployment Steps

### Step 1: Push to GitHub
1. Export or push this project to your GitHub account (via **Export to GitHub** in the top menu or standard git push).

### Step 2: Import into Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** > **"Project"**.
2. Select your GitHub repository.
3. Vercel automatically detects the Vite framework settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **"Deploy"**.

---

## 🔑 Crucial Step: Authorize your Vercel Domain in Firebase

Google Sign-In requires your live Vercel domain to be added to Firebase Authorized Domains:

1. Open your [Firebase Console](https://console.firebase.google.com).
2. Select project: **`resonant-anagram-5zp2g`** (or your custom Firebase project).
3. Navigate to **Authentication** > **Settings** (tab) > **Authorized domains**.
4. Click **"Add domain"** and enter your Vercel domain (e.g. `your-app-name.vercel.app` or your custom church domain like `souls.thenewbrook.org`).
5. Click **Save**. Google Sign-In will now work instantly!

---

## ⚙️ Optional Environment Variables in Vercel

The app has embedded defaults so it builds and works out of the box. If you wish to specify custom Firebase variables, go to **Project Settings** > **Environment Variables** in Vercel:

- `VITE_FIREBASE_API_KEY`: `AIzaSyCQdalJmiKWLxYFUQr_brJZOqY8_FcsOIc`
- `VITE_FIREBASE_AUTH_DOMAIN`: `resonant-anagram-5zp2g.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID`: `resonant-anagram-5zp2g`
- `VITE_FIREBASE_DATABASE_ID`: `ai-studio-5ba0fae2-6fe9-4bee-be86-0ae4612e16b0`
- `VITE_FIREBASE_STORAGE_BUCKET`: `resonant-anagram-5zp2g.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: `1068026986772`
- `VITE_FIREBASE_APP_ID`: `1:1068026986772:web:1d36241bbb608a25ff0201`
