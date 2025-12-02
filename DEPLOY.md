# Deployment Guide

Since your project has a separate **Client (Frontend)** and **Server (Backend)**, the best free way to publish it is using **Vercel** for the frontend and **Render** for the backend.

## Part 1: Deploy Backend (Server) to Render

1.  Push your code to a GitHub repository.
2.  Go to [Render.com](https://render.com) and create a free account.
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  Configure the service:
    *   **Name**: `print3d-api` (or similar)
    *   **Root Directory**: `server`
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
    *   **Instance Type**: Free
6.  Click **Create Web Service**.
7.  Wait for it to deploy. Once done, copy the **URL** (e.g., `https://print3d-api.onrender.com`). You will need this for Part 2.

## Part 2: Deploy Frontend (Client) to Vercel

1.  Go to [Vercel.com](https://vercel.com) and create a free account.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    *   **Framework Preset**: Vite (should detect automatically)
    *   **Root Directory**: Click `Edit` and select `client`.
5.  **Environment Variables**:
    *   Click to expand the Environment Variables section.
    *   Add a new variable:
        *   **Key**: `VITE_API_URL`
        *   **Value**: Paste your Render Backend URL from Part 1 (e.g., `https://print3d-api.onrender.com`).
        *   *Important: Do not add a trailing slash `/` at the end.*
6.  Click **Deploy**.

## Part 3: Final Setup

1.  Once Vercel finishes, your site is live!
2.  **Note**: The free tier of Render spins down after 15 minutes of inactivity. The first request might take 30-60 seconds to wake up the backend. This is normal for the free tier.

## Firebase Configuration
Since you are using Firebase for Authentication and Database directly from the client, you need to ensure your Firebase Console allows the new Vercel domain.
1.  Go to [Firebase Console](https://console.firebase.google.com).
2.  Go to **Authentication** -> **Settings** -> **Authorized Domains**.
3.  Add your new Vercel domain (e.g., `your-project.vercel.app`).

Enjoy your free published site!
