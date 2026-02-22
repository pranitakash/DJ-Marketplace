# 🎧 DJ Night - Premium DJ Booking Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

**Elevate your events with the perfect beat.** DJ Night is a high-performance booking platform designed to connect event organizers with top-tier DJs. Built with scalability and security in mind.

---

## 🔥 Key Features

- **🚀 Smart DJ Discovery**: advanced filtering by location, price range, and ratings.
- **📅 Robust Booking System**: Complete lifecycle management from request to completion.
- **🔒 Enterprise-Grade Security**:
    - **Firebase Authentication**: Secure user and DJ identity management.
    - **Intelligent Rate Limiting**: Global and Auth-specific protection against DDoS and brute-force attacks.
- **📊 DJ Analytics Dashboard**: Real-time tracking of bookings, revenue, and customer feedback.
- **⭐ Performance-Driven Reviews**: Integrated rating system to build trust and quality.

---

## 🛠️ Tech Stack

- **Core**: [Node.js](https://nodejs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database & Auth**: [Google Firebase (Firestore & Admin SDK)](https://firebase.google.com/)
- **Security**: [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)
- **Environment**: [Dotenv](https://github.com/motdotla/dotenv)

---

## ⚡ Quick Start

### 1. Installation
```bash
git clone https://github.com/NITESH-DANGI/DJ-night.git
cd DJ-night/backend
npm install
```

### 2. Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=5000
# Add your environment variables here
```
Place your Firebase `serviceAccountKey.json` in the root of the `backend` folder.

### 3. Development
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 📡 API Architecture

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| **POST** | `/api/auth/register` | User/DJ Registration | No |
| **GET** | `/api/auth/profile` | View Profile | Yes |
| **GET** | `/api/djs` | List & Filter DJs | No |
| **POST** | `/api/bookings` | Create New Booking | Yes |
| **GET** | `/api/djs/analytics` | DJ Performance Metrics | Yes (DJ) |

---

## 🛡️ Security Implementation

This project implements advanced safety layers:
- **Global Limiter**: 100 requests every 15 minutes.
- **Auth Limiter**: Strict limit of 5 authentication attempts per hour.
- **Role-Based Access**: Granular control for `User` and `DJ` roles.

---

## 📜 License

This project is licensed under the **ISC License**.

---

Designed with ❤️ for the music community.
