# 💍 Shaadi Budget — Wedding Budget Planner

A full-stack wedding budget planner with a **FastAPI backend** and **React frontend**.

**Built by:** Shubhi Pandey· shubhip58@gmail.com  
**Built for:** [Digital Heroes](https://digitalheroesco.com)

---

## 📁 Project Structure

```
wedding-budget-planner/
├── backend/          ← FastAPI (Python)
│   ├── main.py
│   ├── requirements.txt
│   └── vercel.json
└── frontend/         ← React
    ├── src/App.js
    ├── public/index.html
    ├── package.json
    └── vercel.json
```


**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# Runs on http://localhost:8000
# API docs at http://localhost:8000/docs
```

**Frontend:**
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## ✅ Features

- Set total wedding budget with couple names & date
- Auto-populated 16 Indian wedding expense categories with suggested splits
- Add / edit / delete expenses per category
- Mark expenses as Paid / Pending
- Real-time budget summary (estimated vs actual vs paid)
- Donut chart breakdown by category
- Filter expenses by category
- Days-to-wedding countdown
- Over-budget alert
- INR / USD currency support
- Fully responsive (mobile-friendly)

---

## 🔗 Digital Heroes

[Built for Digital Heroes](https://digitalheroesco.com)
