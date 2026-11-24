# PoliStock AI 🗳️📈
### Election-Based Stock Market Analysis & Prediction System

A modern, minimal, premium-looking full-stack web app that analyzes how Indian election results affect stock market performance and predicts which sectors/companies benefit based on political party wins.

---

## Folder Structure

```
polistock/
├── frontend/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Fixed navigation bar
│   │   │   └── ui.jsx           # Reusable UI components (Card, Select, etc.)
│   │   ├── hooks/
│   │   │   └── useApi.js        # API fetch helpers
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Hero page with animated background
│   │   │   ├── Dashboard.jsx    # Election Impact Dashboard
│   │   │   ├── CompanyAnalyzer.jsx  # Company Political Analyzer
│   │   │   ├── HistoricalTrends.jsx # Historical election charts
│   │   │   └── Prediction.jsx   # Rule-based prediction engine
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── package.json
│
└── backend/                     # Python Flask API
    ├── app.py                   # Flask routes
    ├── data.py                  # Mock JSON data (elections, companies, trends)
    ├── requirements.txt
    └── Procfile                 # For Render deployment
```

---

## Tech Stack

| Layer     | Tech                                          |
|-----------|-----------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend   | Python Flask, Flask-CORS                     |
| Data      | Mock JSON (structured for easy MongoDB migration) |
| Deploy    | Vercel (frontend) + Render (backend)         |

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm or yarn

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

Backend will run at: **http://localhost:5001**

Test it: http://localhost:5001/api/health

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend will run at: **http://localhost:5173**

> Vite automatically proxies `/api` calls to `http://localhost:5001`, so no CORS issues locally.

---

## API Endpoints

| Method | Route                      | Description                          |
|--------|----------------------------|--------------------------------------|
| GET    | `/api/health`              | Health check                         |
| GET    | `/api/election-analysis`   | `?year=2024&party=BJP` → sentiment, sectors, companies |
| GET    | `/api/company-analysis`    | `?q=adani` → company political data  |
| GET    | `/api/historical-trends`   | All historical election trend data   |
| GET    | `/api/prediction`          | `?party=BJP&state=Gujarat` → prediction |

---

## Features

| Page              | Feature                                               |
|-------------------|-------------------------------------------------------|
| Landing           | Animated stock-line hero, feature cards, stats        |
| Dashboard         | Select state/year/party → sentiment, sectors, companies |
| Company Analyzer  | Search any company → political relation + stock chart |
| Historical Trends | 4 elections (2004–2024) with area charts             |
| Prediction        | Party + State → beneficiary sectors & companies      |

---

## Deployment

### Deploy Backend → Render (Free Tier)

1. Push `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo
4. Settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment**: Python 3
5. Deploy — get your URL: `https://your-app.onrender.com`

---

### Deploy Frontend → Vercel (Free Tier)

1. Push `frontend/` folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Vite**
4. Add Environment Variable in Vercel dashboard:
   - Key: `VITE_API_URL`
   - Value: `https://your-render-app.onrender.com/api`
5. Deploy — your frontend is live!

---

## Extending to MongoDB

The mock data in `backend/data.py` is structured as dictionaries. To migrate:

1. Install `pymongo`: `pip install pymongo`
2. Replace dict lookups in `app.py` with `db.collection.find_one(query)` calls
3. Import your mock data as seed data using `db.collection.insert_many()`

No other changes needed — the API response shapes remain identical.

---

## Design System

- **Theme**: Dark mode — `#080c12` background
- **Typography**: Syne (display) + DM Sans (body) + JetBrains Mono (data)
- **Accents**: Blue `#3b82f6` + Green `#10b981`
- **Cards**: Glassmorphism with `backdrop-filter: blur(16px)`
- **Animation**: Framer Motion page transitions + staggered reveals

---

## Disclaimer

> PoliStock AI uses mock/illustrative data only. It is not a real financial tool.
> All predictions are rule-based educational models. Not investment advice.
