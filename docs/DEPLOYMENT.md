# Deployment Guide

This guide explains how to deploy the CodeSplit application to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- The project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

1. **Push to GitHub**
   Ensure your latest code is committed and pushed to your GitHub repository.

2. **Import Project in Vercel**
   - Go to the Vercel Dashboard.
   - Click **"Add New..."** -> **"Project"**.
   - Select your `InteractiveCodeEditor` repository.

3. **Configure Project**
   - **Framework Preset**: Vercel should auto-detect "Vite". If not, select it.
   - **Root Directory**: Ensure this is set to the folder containing your `package.json` (e.g., `Interactive_Code_Editor` if that's your structure).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**
   Currently, the Firebase configuration is hardcoded in `src/config/firebase.ts`. For better security in a production environment, you should move these values to environment variables.

   **In `src/config/firebase.ts`:**
   ```typescript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
     measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
   };
   ```

   **In Vercel Project Settings -> Environment Variables:**
   Add the corresponding keys and values from your Firebase Console.

5. **Deploy**
   - Click **"Deploy"**.
   - Vercel will build your project and provide a URL (e.g., `https://codesplit-ph.vercel.app`).

## Post-Deployment

### Update GitHub OAuth
After deployment, if your Vercel URL has changed (or if you were using a temporary one), update your GitHub OAuth App settings:
- **Homepage URL**: `https://your-new-domain.vercel.app`

### Update Firebase Auth Allowlist
- Go to Firebase Console -> Authentication -> Settings -> Authorized domains.
- Add your Vercel domain (e.g., `your-project.vercel.app`).

## Troubleshooting

- **404 on Refresh**: Since this is a Single Page Application (SPA), you need to ensure Vercel rewrites all routes to `index.html`.
  Ensure you have a `vercel.json` file in your root:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

- **Build Fails**: Check the build logs in Vercel. Common issues include TypeScript errors (run `npm run build` locally to check) or missing dependencies.
