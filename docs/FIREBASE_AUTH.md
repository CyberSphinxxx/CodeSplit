# Firebase Authentication Setup Guide

This guide explains how to set up GitHub authentication for CodeSplit using Firebase.

## Prerequisites

- Node.js 18+ installed
- A GitHub account
- A Firebase project

## Step 1: Firebase Project Setup

### 1.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name (e.g., `codesplit`)
4. Follow the setup wizard

### 1.2 Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Click **GitHub** and enable it
5. Keep this page open - you'll need the callback URL

## Step 2: GitHub OAuth App Setup

### 2.1 Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the form:

| Field | Value |
|-------|-------|
| Application name | `CodeSplit` |
| Homepage URL | `https://your-domain.vercel.app` |
| Authorization callback URL | `https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler` |

4. Click **Register application**

### 2.2 Get Credentials

1. Copy the **Client ID**
2. Click **Generate a new client secret**
3. Copy the **Client Secret** (only shown once!)

### 2.3 Configure Firebase

1. Go back to Firebase Console → Authentication → Sign-in method → GitHub
2. Paste the **Client ID** and **Client Secret**
3. Click **Save**

## Step 3: Project Configuration

### 3.1 Firebase Config File

Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 3.2 Auth Context

The `src/context/AuthContext.tsx` provides:

- `UserAuthContextProvider` - Wraps the app with auth state
- `useAuth()` hook - Access auth state and functions
- `logInWithGithub()` - Triggers GitHub OAuth popup
- `logOut()` - Signs out the user

### 3.3 Usage Example

```tsx
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { user, loading, logInWithGithub, logOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? (
    <div>
      <img src={user.photoURL} alt="Avatar" />
      <p>Welcome, {user.displayName}!</p>
      <button onClick={logOut}>Sign Out</button>
    </div>
  ) : (
    <button onClick={logInWithGithub}>Sign in with GitHub</button>
  );
}
```

## Step 4: Realtime Database Security Rules

Go to **Firebase Console** → **Build** → **Realtime Database** → **Rules** and paste this:

```json
{
  "rules": {
    "projects": {
      // Allow reading only your own projects via query
      ".read": "auth != null && query.orderByChild == 'ownerId' && query.equalTo == auth.uid",
      ".indexOn": ["ownerId"],
      "$projectId": {
        // Allow write if you are the owner (or creating new)
        ".write": "auth != null && (!data.exists() || data.child('ownerId').val() === auth.uid) && (!newData.exists() || newData.child('ownerId').val() === auth.uid)"
      }
    }
  }
}
```

**Note:** The `.indexOn` rule is crucial for the `getUserProjects` query to work efficiently.

## Step 5: Guest Work Claiming

When a user logs in, the app automatically:

1. Checks `localStorage` for existing code (`ice-files` key)
2. Compares against the default template
3. If custom work exists, shows a claim modal with options:
   - **Save to Cloud** - Saves to Firestore, clears localStorage
   - **Keep Locally** - Dismisses modal, keeps local storage
   - **Discard** - Clears localStorage, starts fresh

## Troubleshooting

### "popup_closed_by_user" Error
- User closed the popup before completing auth
- No action needed, user can try again

### "net::ERR_BLOCKED_BY_CLIENT" Error
- This usually means an Ad Blocker (uBlock, AdGuard, Brave Shield) is blocking Firestore.
- Solution: Disable ad blockers for this site or whitelist `firestore.googleapis.com`.

### "auth/unauthorized-domain" Error
- Add your domain to Firebase Console → Authentication → Settings → Authorized domains

### Firestore Index Required
- When querying projects, Firebase may require a composite index
- Click the link in the console error to auto-create it

## File Structure

```
src/
├── config/
│   └── firebase.ts          # Firebase initialization
├── context/
│   └── AuthContext.tsx      # Auth context & useAuth hook
├── services/
│   └── projectService.ts    # Firestore project CRUD
└── components/
    ├── Header/              # Login/logout UI
    ├── Dashboard/           # Project grid
    └── Layout/              # Claim modal & save logic
```
