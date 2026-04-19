# HabitPulse - Professional Habit Tracker

A high-performance, data-driven habit tracking "Operating System" designed to visualize consistency, analyze trends, and stay productive through a modern, high-density interface.

## 🚀 Key Features
- **HabitPulse Dashboard:** A compact, single-screen "Bento Grid" layout designed to show all your data at a glance without scrolling.
- **Advanced Analytics:**
  - **Performance Trend (30D):** Area chart with gradient fills to visualize your consistency over the last month.
  - **Today's Score:** A modern Radial Bar chart showing real-time progress toward your daily goal.
  - **Weekly Activity:** Bar chart comparing completions across the last 7 days.
  - **Consistency Matrix:** A dynamic heatmap to track long-term habit streaks.
  - **Success Ratio:** Pie chart visualizing overall completion vs. missed tasks.
- **Premium UI/UX:**
  - **Modern Dark Theme:** Optimized for focus with a deep slate palette.
  - **Responsive Design:** High-density layout that maximizes screen real estate.
  - **Micro-interactions:** Interactive tooltips on all charts and hover effects on habit items.
- **Smart Notifications:** Daily reminders and 12-hour warning emails for pending tasks.
- **Authentication:** Secure Email/Password auth with JWT.

## 🛠 Tech Stack
- **Frontend:** React 19, TypeScript, Vanilla CSS, Recharts, Lucide React.
- **Backend:** Node.js, Express, TypeScript, Mongoose.
- **Database:** MongoDB Atlas.
- **Email:** Nodemailer (Gmail SMTP).
- **Scheduling:** node-cron.

## 📁 Project Structure
- `client/`: React frontend application.
  - `src/styles/global.css`: The "HabitPulse" design system (Bento Grid, Dark Theme).
  - `src/pages/Dashboard.tsx`: High-density dashboard with unified analytics.
- `server/`: Node.js backend API.
  - `src/services/scheduler.ts`: Manages daily habit resets and notification triggers.

## 🛠 Setup Instructions

### Backend
1. `cd server`
2. `npm install`
3. Configure `.env` with your `MONGODB_URI` and Gmail credentials.
4. `npm run dev`

### Frontend
1. `cd client`
2. `npm install`
3. `npm run dev`

## 📈 Recent Updates
### [2026-04-19] - The "HabitPulse" Overhaul
- **Redesigned UI:** Moved from a basic layout to a professional, high-density Bento Grid.
- **Full-Width Layout:** Maximized screen usage and eliminated vertical scrolling for an "at-a-glance" experience.
- **New Visualizations:** Added Area Charts and Radial Bar Charts for better data storytelling.
- **Interactive Details:** Implemented detailed tooltips across all chart canvases.
- **Theme Optimization:** Refined the dark theme for better accessibility and heatmap visibility.
