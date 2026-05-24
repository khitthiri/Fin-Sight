# 💰 AI-Powered Personal Finance Analyzer

A full-stack senior project that combines React, Node.js, MongoDB, and Python ML to deliver a fintech-grade personal finance dashboard.

---

## 📁 Folder Structure

```
FinanceAnalyzer/
├── frontend/       React + Vite + Tailwind + Recharts + Framer Motion
├── backend/        Node.js + Express + JWT + MongoDB
├── ai-service/     Python + Flask + scikit-learn + pandas
└── dataset/        Sample CSV transaction data
```

---

## 🚀 Quick Start

### 1. Clone & install

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend
cd backend
npm install
# create .env (see backend/.env.example)
npm run dev          # http://localhost:5000

# AI Service
cd ai-service
pip install -r requirements.txt
python app.py        # http://localhost:8000
```

### 2. Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/financedb
JWT_SECRET=your_super_secret_key
AI_SERVICE_URL=http://localhost:8000
```

---

## ✨ Features

| Feature | Tech |
|---|---|
| JWT Authentication | Node.js + bcrypt |
| Expense Dashboard | React + Recharts |
| CSV Upload | Multer + Papa Parse |
| AI Categorization | scikit-learn |
| Expense Prediction | Linear Regression |
| Anomaly Detection | Isolation Forest |
| Financial Health Score | Custom algorithm |
| Financial Personality | K-Means Clustering |
| Dark Mode | Tailwind CSS |

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| AI Service | Render (Python) |
