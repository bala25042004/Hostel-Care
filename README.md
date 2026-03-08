# HostelCare - Complaint Management System 🏨

A professional, full-stack hostel complaint management system built with **React**, **Node.js**, and **Firebase**.

## 🚀 Setup & Local Development

### 1. Firebase Preparation
- Create a project at [Firebase Console](https://console.firebase.google.com/).
- Enable **Authentication** (Email/Password & Google).
- Enable **Firestore Database** (Start in Test Mode).
- Paste your config keys into `frontend/.env`.

### 2. Environment Variables
Check `.env.example` in both folders.
- **Frontend**: Add Firebase keys.
- **Backend**: Add `EMAIL_USER` and `EMAIL_PASS` (Gmail App Password).

### 3. Quick Start (Root)
```bash
npm install
npm start
```
This starts both the frontend (Port 5173) and backend (Port 5000) using `concurrently`.

---

## 🌍 Hosting Guide

### Frontend (v6/Vercel/Netlify)
1. Set the **Build Command**: `npm run build`
2. Set **Output Directory**: `dist`
3. **Environment Variables**: Add all `VITE_FIREBASE_*` variables from your `.env`.
4. **VITE_BACKEND_URL**: Add your hosted backend URL (e.g., `https://api.yourdomain.com`).

### Backend (Railway/Render/Render)
1. **Root Directory**: Select the `backend` folder.
2. **Build/Start Command**: `npm start`
3. **Environment Variables**: Add `PORT`, `EMAIL_USER`, `EMAIL_PASS`.

---

## 🛠 Features
- **Smart Dashboard**: Real-time analytics with charts for Wardens.
- **Complaint History**: Students can track every stage of their complaint.
- **Role-Based Access**: Secure routes for Students vs Admins.
- **Profile Image Support**: Upload profile pictures for free (converted to Base64).
- **Automated Emails**: Students get notified instantly when a Warden updates their complaint.

## 📁 Tech Stack
- **Frontend**: Vite + React, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, Nodemailer.
- **Database**: Cloud Firestore.

&copy; 2026 HostelCare Management Team.

