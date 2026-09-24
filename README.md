# ShopSphere 🌐🛒
**Next-Generation Spatial 3D Multi-Vendor eCommerce Platform**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/PavanTeja077/shop-sphere)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPavanTeja077%2Fshop-sphere&root-directory=frontend&env=VITE_API_URL&envDescription=URL%20of%20your%20Render%20backend%20API)

ShopSphere is a full-stack, enterprise-ready multi-vendor eCommerce ecosystem featuring spatial 3D interactive product rendering, intelligent vendor cart splitting, real-time logistics tracking, AI shopping copilot, customer-support live desk, Google 1-click registration/authentication, and dual high-contrast visual themes (**Luxe Light** & **Cyber Dark**).

---

## 🚀 Architecture & Tech Stack

* **Frontend**: React 19, Vite, Tailwind CSS, Three.js, Framer Motion, Lucide Icons.
* **Backend**: Node.js, Express 5, MongoDB (Mongoose), JSON Web Tokens (JWT), Multer.
* **Themes**: Unified dual-mode system (☀️ Luxe Light & 🌙 Cyber Dark) with 1-click navbar toggle.
* **Auth**: Role-based access control (Customer, Seller, Delivery Partner, Platform Admin) + Google OAuth Social Sign-in/Registration.

---

## 📦 Deployment Guide

### 1. Backend Deployment (Render)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `https://github.com/PavanTeja077/shop-sphere`.
3. Configure the following settings:
   * **Root Directory**: `backend`
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Add the following **Environment Variables** in Render:
   * `PORT`: `5000`
   * `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   * `JWT_SECRET`: `<Your secure secret string>`
   * `GEMINI_API_KEY`: `<Your Gemini API key (optional)>`
5. Click **Create Web Service**. Once deployed, copy your Render service URL (e.g. `https://shopsphere-backend.onrender.com`).

---

### 2. Frontend Deployment (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New** -> **Project**.
2. Import the GitHub repository: `https://github.com/PavanTeja077/shop-sphere`.
3. Configure the build settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. In the **Environment Variables** section, add:
   * `VITE_API_URL`: `<Your Render Backend URL>` (e.g. `https://shopsphere-backend.onrender.com`)
5. Click **Deploy**.

---

## 💻 Local Development Setup

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.
