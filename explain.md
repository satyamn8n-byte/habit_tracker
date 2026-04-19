# HabitPulse: System Architecture & Data Workflow

This document explains how **HabitPulse** works under the hood, how the files are connected, and exactly how your data is stored in the database.

---

## 🏗️ 1. High-Level Architecture
HabitPulse follows a **Client-Server** architecture using the **MERN** stack:
- **Frontend (Client):** React with TypeScript. It's the "Face" of the app.
- **Backend (Server):** Node.js with Express. It's the "Brain" that handles logic.
- **Database (MongoDB):** The "Memory" where all your habits and logs live.
- **Communication:** The Frontend talks to the Backend using **REST API** calls (JSON data).

---

## 🔄 2. The Core Workflow

### A. Authentication (The Security Gate)
1. You enter your email/password in `Login.tsx`.
2. The frontend sends this to the server's `/auth/login` route.
3. The server checks the database, generates a **JWT (JSON Web Token)**, and sends it back.
4. `AuthContext.tsx` saves this token. Every future request from the frontend "proves" who you are by sending this token in the header.

### B. Habit Creation & Tracking
1. When you add a habit in the Navbar, it creates a new record in the **Habits** collection.
2. When you click (toggle) a habit on the dashboard, the frontend calls `/habits/toggle-log`.
3. The server looks for a **HabitLog** for "Today" + "That Habit".
   - If it doesn't exist: It creates one with `completed: true`.
   - If it exists: It flips the `completed` status (true <-> false).

### C. The Analytics Engine (Dashboard)
The `Dashboard.tsx` file is the most complex. It does the following:
1. **Fetches Data:** Downloads all your Habits and all Logs for the last 365 days.
2. **Processes Data:** Uses `useMemo` (a React tool for efficiency) to transform raw logs into chart-ready data:
   - **Heatmap:** Groups logs by date and counts completions.
   - **Trend Chart:** Filters logs for the last 30 days and maps them to a timeline.
   - **Weekly Bar:** Groups logs by day of the week (Mon, Tue, etc.).

---

## 📊 3. Data Storage (Database Schemas)

Here is exactly how your data looks inside MongoDB.

### 👤 User Model (`User.ts`)
Stores who you are and when you want to be reminded.
| Key | Type | Description |
| :--- | :--- | :--- |
| `email` | String | Your unique login ID. |
| `password` | String | A **hashed** version of your password (we never store plain text). |
| `reminderTime` | String | The time (e.g., "09:00") you want your daily reminder email. |
| `timezone` | String | Your local timezone (e.g., "America/New_York") to ensure emails arrive on time. |
| `lastReminderSent` | Date | Tracks the last time we sent you a reminder to avoid duplicates. |
| `createdAt` | Date | Automatically set when you register. |

### 📝 Habit Model (`Habit.ts`)
Stores the "Template" for a habit you want to build.
| Key | Type | Description |
| :--- | :--- | :--- |
| `name` | String | The title of your habit (e.g., "Drink Water"). |
| `user` | ObjectID | A "Link" (reference) to the User who owns this habit. |
| `frequency` | String | "daily" or "specific_days" (tells the app how often to expect logs). |
| `active` | Boolean | If `false`, the habit is hidden but the history is kept. |

### ✅ HabitLog Model (`HabitLog.ts`)
Stores the actual "Check-ins" for your habits. This is where the charts get their data.
| Key | Type | Description |
| :--- | :--- | :--- |
| `habit` | ObjectID | A "Link" to the Habit being logged. |
| `user` | ObjectID | A "Link" to the User who performed the action. |
| `date` | Date | The specific calendar day for this log. |
| `completed` | Boolean | `true` if you checked it off, `false` otherwise. |

---

## 📂 4. Key File Connections

- **`client/src/services/api.ts`**: The "Postman" of the app. Every time the frontend needs data, it uses this file to talk to the server.
- **`server/src/services/scheduler.ts`**: The "Clock". It runs every minute, checks which users have hit their `reminderTime`, and triggers the Email Service.
- **`server/src/services/emailService.ts`**: The "Messenger". Uses Nodemailer to send actual emails through Gmail.
- **`client/src/styles/global.css`**: The "Artist". It defines the Bento Grid, the Dark Theme colors, and the "Glassmorphism" look you see on the screen.

---

## 💡 Summary
When you use HabitPulse, you are moving data through a loop:
**UI (React)** → **API (Express)** → **Database (MongoDB)** → **Logic (Scheduler/Charts)** → **Back to UI**.
