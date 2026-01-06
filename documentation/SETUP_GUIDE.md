# Outage Tracker Setup Guide

Complete guide to set up the Outage Tracker application with GitHub, Firebase, and Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [GitHub Setup](#github-setup)
4. [Local Development](#local-development)
5. [Vercel Deployment](#vercel-deployment)
6. [Environment Configuration](#environment-configuration)

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- GitHub account
- Google account (for Firebase)
- Vercel account

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter project name: `outage-tracker` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click **Create project**

### 2. Enable Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose a Cloud Firestore location closest to your users
5. Click **Enable**

### 3. Configure Firestore Security Rules

Go to **Firestore Database > Rules** and set the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Categories collection
    match /categories/{categoryId} {
      allow read, write: if true;  // For development - restrict in production
    }
    
    // Applications collection
    match /applications/{applicationId} {
      allow read, write: if true;  // For development - restrict in production
    }
    
    // Outages collection
    match /outages/{outageId} {
      allow read, write: if true;  // For development - restrict in production
    }
  }
}
```

**Note:** For production, implement proper authentication and restrict rules accordingly.

### 4. Create Firestore Indexes

Go to **Firestore Database > Indexes** and create these composite indexes:

| Collection | Fields Indexed | Query Scope |
|------------|----------------|-------------|
| `outages` | `year` (Asc), `month` (Asc) | Collection |
| `outages` | `applicationId` (Asc), `year` (Asc), `month` (Asc), `day` (Asc) | Collection |

### 5. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Under **Your apps**, click the web icon `</>`
3. Register your app with nickname: `outage-tracker-web`
4. Copy the `firebaseConfig` object

---

## GitHub Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in
2. Click **New repository**
3. Enter repository name: `outage-tracker`
4. Set to **Private** or **Public** as needed
5. Do NOT initialize with README (we have local files)
6. Click **Create repository**

### 2. Initialize Local Git and Push

```bash
# In the project root directory
git init
git add .
git commit -m "Initial commit: Outage Tracker application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/outage-tracker.git
git push -u origin main
```

---

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `src/environments/environment.ts` with your Firebase config:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID'
  }
};
```

### 3. Run Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`

---

## Vercel Deployment

### 1. Connect to Vercel

1. Go to [Vercel](https://vercel.com/) and sign in with GitHub
2. Click **Add New... > Project**
3. Import your `outage-tracker` repository
4. Vercel will auto-detect Angular

### 2. Configure Build Settings

Vercel should auto-detect these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Angular |
| Build Command | `npm run build` |
| Output Directory | `dist/outage-tracker/browser` |
| Install Command | `npm install` |

### 3. Set Environment Variables

In Vercel project settings, add these environment variables:

| Variable | Value |
|----------|-------|
| `FIREBASE_API_KEY` | Your Firebase API Key |
| `FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com |
| `FIREBASE_PROJECT_ID` | your-project-id |
| `FIREBASE_STORAGE_BUCKET` | your-project.appspot.com |
| `FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `FIREBASE_APP_ID` | Your app ID |

### 4. Deploy

Click **Deploy** and wait for the build to complete.

---

## Environment Configuration

### Development vs Production

The app uses Angular's environment system:

- `src/environments/environment.ts` - Development
- `src/environments/environment.prod.ts` - Production

Update both files with your Firebase configuration.

### Firebase Security (Production)

For production deployments, update Firestore rules to require authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Data Model

### Collections Structure

**categories**
```json
{
  "id": "auto-generated",
  "name": "Servicing Core",
  "order": 0,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**applications**
```json
{
  "id": "auto-generated",
  "categoryId": "category-doc-id",
  "name": "Spectrum",
  "order": 0,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**outages**
```json
{
  "id": "auto-generated",
  "applicationId": "application-doc-id",
  "year": 2025,
  "month": 1,
  "day": 15,
  "status": "partial|full",
  "notes": "Optional notes about the outage",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## Troubleshooting

### Firebase Connection Issues

1. Verify Firebase config is correct
2. Check Firestore rules allow read/write
3. Ensure Firestore database is created

### Build Errors

1. Run `npm install` to ensure all dependencies are installed
2. Clear Angular cache: `ng cache clean`
3. Delete `node_modules` and reinstall

### Vercel Deployment Fails

1. Check build logs for specific errors
2. Verify environment variables are set
3. Ensure output directory matches: `dist/outage-tracker/browser`

---

## Support

For issues or feature requests, create a GitHub issue in the repository.

