# 🔍 Consent Translator

> **Know what you actually agreed to — in plain language.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-consent--translator.netlify.app-6366f1?style=for-the-badge)](https://consent-translator.netlify.app)
[![GitHub](https://img.shields.io/badge/GitHub-theesleek%2Fconsent--translator-181717?style=for-the-badge&logo=github)](https://github.com/theesleek/consent-translator)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![AMD](https://img.shields.io/badge/Powered%20by-AMD%20MI300X-ED1C24?style=for-the-badge)](https://www.amd.com/en/products/accelerators/instinct/mi300/mi300x.html)

---

## 📌 What is Consent Translator?

Privacy policies average **2,500 words** written at a postgraduate reading level. Indian users of loan apps, edtech platforms, UPI services, and government portals have no realistic way to understand what data they are surrendering, to whom, and for how long.

**Consent Translator** is an AI-powered web app that reads any privacy policy — via URL or pasted text — and instantly returns a plain-language breakdown of:

- 📦 What data is collected
- 🎯 How it is used
- 📅 How long it is retained
- 🤝 Who it is shared with
- 🚨 The top 3 most alarming clauses
- ⚖️ A one-line verdict: should you worry?
- 🇮🇳 An optional Hindi summary for non-English users

Built specifically for the **Indian app ecosystem** — where data exploitation is highest and user awareness is lowest.

---

## 🚀 Live Demo

👉 **[https://consent-translator.netlify.app](https://consent-translator.netlify.app)**

Try it with any of these Indian app URLs:
```
https://www.zomato.com/privacy
https://byjus.com/privacy-policy/
https://www.phonepe.com/privacy-policy/
https://www.meesho.com/privacy-policy
https://www.irctc.co.in/nget/privacy-policy
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔗 URL Analysis | Paste any privacy policy URL and get instant results |
| 📋 Text Analysis | Copy-paste raw policy text if the URL doesn't load |
| 🎯 AI Risk Scoring | Safety score 0–100 with animated ring display |
| 🏷️ Risk Badge | Colour-coded: Low / Medium / High / Critical |
| 📦 Data Breakdown | Plain-language list of data collected and how it's used |
| 🚨 Alarm Clauses | Top 3 most dangerous clauses with plain explanations |
| 🇮🇳 Hindi Summary | Toggle on a 2–3 sentence Hindi summary |
| 📤 Share Card | One-click copy of a shareable warning card for WhatsApp |
| 🏦 Indian App Focus | Optimised for loan apps, edtech, UPI, and govt portals |

---

## 🏗️ Architecture

```
┌─────────────────┐     HTTPS      ┌──────────────────┐     Groq API    ┌─────────────────┐
│  CLIENT LAYER   │ ─────────────► │  BACKEND LAYER   │ ──────────────► │    AI LAYER     │
│                 │                │                  │                 │                 │
│  HTML5 + CSS3   │                │  Node.js v18     │                 │  Groq Cloud     │
│  Vanilla JS     │ ◄───────────── │  Express.js      │ ◄────────────── │  LLaMA 3.3 70B  │
│  SVG Animation  │    JSON resp   │  axios + cheerio │   JSON analysis │  AMD MI300X GPU │
│                 │                │  cors            │                 │                 │
│  Netlify CDN    │                │  Render (free)   │                 │  ROCm Platform  │
└─────────────────┘                └──────────────────┘                 └─────────────────┘
```

**Data Flow:**
```
User Input → Netlify Frontend → Render Backend → URL Fetch → Groq AI → JSON → Sanitise → Render → User
```

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3 (custom properties, flexbox, SVG animations)
- Vanilla JavaScript (Fetch API, DOM manipulation)
- No framework, no build step — loads instantly on any device
- Hosted on **Netlify CDN**

### Backend
- Node.js v18 + Express.js
- `axios` — HTTP client and URL fetching
- `cheerio` — HTML parsing and text extraction
- `cors` — Cross-origin support
- Hosted on **Render** (free tier)

### AI / ML
- **Groq Cloud API**
- **LLaMA 3.3 70B Versatile** model
- Structured JSON prompt engineering
- Response sanitisation and fallback JSON recovery

### DevOps
- GitHub — source control and auto-deploy
- Render — backend CI/CD (watches `main` branch)
- Netlify — frontend CI/CD (watches `frontend/` folder)

---

## ⚡ AMD Integration

Consent Translator runs on **AMD-powered infrastructure** at every layer of its AI pipeline.

| AMD Product | Role |
|---|---|
| **AMD Instinct MI300X** | Powers Groq Cloud inference — 192GB HBM3, 5.3 TB/s bandwidth |
| **AMD ROCm Platform** | Open software stack underlying Groq's inference engine |

Every privacy policy analysis request processed by our app is computed on AMD silicon via Groq Cloud. The MI300X enables processing of full-length privacy policies (up to 12,000 characters) in under 3 seconds.

---

## 📁 Project Structure

```
consent-translator/
├── backend/
│   ├── server.js          ← Express API + scraper + Groq AI call
│   └── package.json       ← Dependencies
├── frontend/
│   └── index.html         ← Complete single-file UI (no build step)
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- A free Groq API key from [console.groq.com](https://console.groq.com)

### Step 1 — Clone the repo
```bash
git clone https://github.com/theesleek/consent-translator.git
cd consent-translator
```

### Step 2 — Install backend dependencies
```bash
cd backend
npm install
```

### Step 3 — Set your API key

**Windows (CMD):**
```cmd
set GROQ_API_KEY=gsk_your-key-here
```

**Mac / Linux:**
```bash
export GROQ_API_KEY=gsk_your-key-here
```

### Step 4 — Start the backend
```bash
node server.js
```
You should see:
```
✅ Consent Translator running on port 4000
   Model : llama-3.3-70b-versatile (Groq free tier)
   API   : http://localhost:4000
```

### Step 5 — Start the frontend
Open a new terminal window:
```bash
cd ../frontend
npx serve .
```

### Step 6 — Open in browser
```
http://localhost:3000
```

---

## 🌐 Deployment

### Backend — Render (Free)
1. Push repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add environment variable: `GROQ_API_KEY` = your key
6. Deploy

### Frontend — Netlify (Free)
1. Go to [netlify.com](https://netlify.com) → Add new site
2. Connect your GitHub repo
3. Set:
   - **Base directory:** `frontend`
   - **Publish directory:** `frontend`
4. Deploy

---

## 💰 Cost

| Service | Cost |
|---|---|
| Netlify (frontend) | ₹0/month |
| Render (backend) | ₹0/month |
| Groq API (14,400 req/day) | ₹0/month |
| GitHub | ₹0/month |
| **Total** | **₹0/month** |

At scale (10,000 users/day): ~₹3,500/month

---

## 👥 Team

**GothamTech** — AMD Slingshot 2026 Hackathon

| Name | Role |
|---|---|
| **Rishi Srivastava** | Team Leader — Full stack development, AI integration, backend architecture, deployment |
| **Tushar Raghav** | Team Member |

**Theme:** AI + Cybersecurity & Privacy

---

## 🗺️ Future Roadmap

- 🔌 Browser extension for real-time policy detection on any website
- 💬 WhatsApp bot for forwarded privacy policy links
- 🏢 B2B API for fintech compliance teams
- 🌐 Regional language support — Tamil, Bengali, Telugu
- 📱 Mobile app

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">
  <strong>Built for 250 million Indians who deserve to know what they're agreeing to.</strong>
  <br><br>
  <a href="https://consent-translator.netlify.app">🔍 Try it live</a> •
  <a href="https://github.com/theesleek/consent-translator">⭐ Star on GitHub</a>
</div>
