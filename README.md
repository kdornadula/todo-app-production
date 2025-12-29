# 📝 ToDo Manager - Intelligent Task & Analytics Dashboard

A modern, full-stack task management application designed for productivity enthusiasts. Built with a mobile-first approach, it features secure authentication, real-time analytics, and a beautiful dark-mode interface.

![Project Banner](https://img.shields.io/badge/Status-Production%20Ready-success) 
![Tech Stack](https://img.shields.io/badge/Stack-React%20|%20Node.js%20|%20PostgreSQL-blue)

## 🚀 Live Demo

- **Frontend (Vercel)**: [https://todo-app-production-six.vercel.app](https://todo-app-production-six.vercel.app)
- **Backend (Render)**: [https://todo-app-production-9w1f.onrender.com/api](https://todo-app-production-9w1f.onrender.com/api)

---

## ✨ Key Features

### 🔒 Secure & Private
- **User Authentication**: Secure Signup/Login using JWT tokens and bcrypt password hashing.
- **Data Privacy**: Every user has their own isolated task list; data is never shared.

### 📱 Mobile Optimized
- **Touch-Friendly**: Large buttons, responsive layout, and mobile-specific input handling.
- **Cross-Platform**: Works seamlessly on iOS, Android, and Desktop browsers.
- **Keyboard Shortcuts**: Power user shortcuts (`N` for New Task, `Esc` to Close) for desktop.

### 📊 Productivity Dashboard
- **Visual Analytics**: Interactive charts powered by Recharts (Status Distribution, Category Breakdown, Completion Trends).
- **Smart Filters**: Filter by Status, Category, Priority, or Search text instantly.
- **Export Data**: Download your tasks as CSV or JSON for external backups.

### 🎨 Modern UI/UX
- **Dark Mode**: Toggle between light and dark themes with system preference detection.
- **Priority System**: Visual badges (High, Medium, Low) to focus on what matters.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Visualization**: Recharts
- **State**: Context API (Auth, Theme)
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js + Express
- **Database**: 
  - **Dev**: SQLite (Zero config local setups)
  - **Prod**: PostgreSQL (Strict typing & reliability on Render)
- **Security**: `bcryptjs`, `jsonwebtoken`, `cors`
- **Deployment**: Render

---

## 💻 Local Installation

Want to run this locally? Follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/kdornadula/todo-app-production.git
cd todo-app-production
```

### 2. Backward Setup
```bash
cd backend
npm install

# Create .env file
echo "JWT_SECRET=your_secret_key" > .env
echo "JWT_EXPIRES_IN=7d" >> .env
# Optional: DATABASE_URL for Postgres, otherwise defaults to SQLite

npm run dev
```

### 3. Frontend Setup
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to see the app!


Built with ❤️ by [Krishnamoorthy Dornadula](https://github.com/kdornadula)
