# SilverConnect  
**A Secure Geriatric Care Coordination Platform**

SilverConnect is a production-grade, full-stack geriatric care coordination platform designed as a **registry and matchmaking protocol**, not a traditional medical website.  
It connects families with **verified care providers** through a secure, governed, and professionally moderated digital ecosystem.

This system emphasizes **trust, compliance, and operational clarity**, delivering a SaaS-level experience for a traditionally fragmented sector.

---

## 🌐 Live Deployment

### Frontend (Vercel)
👉 https://silver-connect-blush.vercel.app/

### Backend (Render)
👉 https://backend-minor-project.onrender.com

### Backend Repository
👉 https://github.com/BatoolAmina/backend-minor-project

---

## 🚀 Core Vision

**Problem**  
Finding reliable elderly care is difficult due to unverified providers, lack of accountability, and fragmented communication.

**Solution**  
SilverConnect functions as a **central registry** where:
- Helpers are verified and approved
- Services are transparently logged
- Payments follow an escrow-style confirmation model
- Admins actively govern the platform

> SilverConnect treats caregiving with the same precision as a modern enterprise SaaS system.

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB Atlas
- **Authentication:** JWT

---

## 🔄 State Management

- Real-time session synchronization using:
  - `localStorage`
  - Custom browser events (`userUpdated`)
- UI updates instantly on login, logout, and role changes

---

## 🧠 Admin Override Console

The Admin Dashboard is the **governance core** of the platform.

### Admin Capabilities
- **User Directory**
  - View all users
  - Assign roles: User / Helper / Admin
- **Care Provider Management**
  - Approve or reject pending helpers
  - Edit professional credentials
- **Service Logs**
  - Transparent booking records
- **Inquiry Inbox**
  - Centralized contact message handling
- **Review Moderation**
  - Edit or remove feedback

This transforms SilverConnect from a website into a **managed system**.

---

## 🔐 Security Protocols

- JWT-based authentication
- Role-protected routes
- AES-256 encryption for sensitive data
- Visible trust indicators:
  - “Protected by Cloudflare” badge

Security is both functional **and visible**.

---

## ⚙️ Environment Configuration

### Frontend Environment (`.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=https://backend-minor-project.onrender.com

## 🛠️ Local Setup (Frontend)

### Clone the repository
```bash
git clone https://github.com/BatoolAmina/silver_connect.git
cd silver_connect
```

## Install Dependencies

```bash
npm install
```

## Start the Development Server

```bash
npm run dev
```

The app will be available at:  
👉 http://localhost:3000
