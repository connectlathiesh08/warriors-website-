# Rotaract Bangalore Warriors - "Echoes of the Warriors" Memory Globe App

A premium web application built using **Next.js**, **React**, **Three.js** (`@react-three/fiber`), **Framer Motion**, and **Tailwind CSS**, integrated with **Firebase** (Firestore + Storage) for dynamic CMS image publishing.

---

## 🚀 Tech Stack Details
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Animations**: Framer Motion
- **Database & Storage**: Firebase (Firestore & Storage)

---

## 📁 Clean Folder Structure
```text
rotaract-warriors-nextjs/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx         # Admin Portal CMS Dashboard & Upload Forms
│   │   ├── globals.css          # Styling tokens, radial lights, custom animations
│   │   ├── layout.tsx           # Google Fonts and HTML shell metadata wrapper
│   │   └── page.tsx             # Interactive Homepage with 3D Globe Canvas
│   ├── components/
│   │   ├── Lightbox.tsx         # Fullscreen Zoom/Download/Nav Lightbox
│   │   └── MemoryGlobe.tsx      # 3D Fibonacci Sphere Globe & Gesture Damping
│   └── lib/
│       └── firebase.ts          # Storage and Database connector
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript configurations
├── tailwind.config.ts           # Custom Burgundy and font styling tokens
└── next.config.mjs              # Webpack loader permissions for firebase images
```

---

## 🛠️ Step-by-Step Setup Guide

Follow these simple instructions to launch the application:

### Step 1: Install Node.js
If you haven't already, download and install **Node.js** (LTS version recommended) from [nodejs.org](https://nodejs.org/).

### Step 2: Install Project Dependencies
Open your terminal (PowerShell, Command Prompt, or VS Code terminal), navigate to this project folder, and run:
```bash
npm install
```

### Step 3: Connect Firebase (Firestore & Storage)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project (e.g., `Rotaract Warriors Globe`).
3. Under the Project overview, add a new **Web App** to register it.
4. Copy your project configuration object.
5. Open `src/lib/firebase.ts` and replace the placeholder credentials inside the `firebaseConfig` object:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
6. **Set up Firestore**: In the Firebase sidebar, go to **Cloud Firestore** and click **Create Database** (start in Test mode or configure permissions).
7. **Set up Storage**: In the Firebase sidebar, go to **Storage** and click **Get Started** (enable rules allowing public reads and authenticated/base64 uploads).

### Step 4: Run the Development Server
Launch the local Next.js dev server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the interactive homepage.

### Step 5: Open the CMS Portal
Navigate to **[http://localhost:3000/admin](http://localhost:3000/admin)** to access your publishing dashboard. Drag or select an event photo, fill in details, and hit **Publish Memory**. It will immediately save to Firebase and render on your rotating 3D globe in real time!
