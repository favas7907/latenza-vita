# 🌊 Latenza Vita

### Smart AI-Powered Water Quality Monitoring & Alert System

**SDG 6 — Clean Water and Sanitation | GenAI Hackathon Project**

Latenza Vita is an **AI-driven municipal water monitoring platform** that analyzes real-time water quality data from IoT sensors and provides **intelligent alerts, dashboards, and AI insights** to help authorities respond quickly to contamination risks.

The platform combines **IoT simulation, cloud infrastructure, and generative AI** to enable proactive water quality management.

---

# 🚀 Key Features

* 📡 **Real-Time Water Monitoring** — Continuous sensor data ingestion from distributed sources
* ⚠️ **AI-Powered Alerts** — Detect abnormal readings and notify relevant municipal divisions
* 📊 **Interactive Dashboard** — Visualize water quality metrics and trends
* 🤖 **AI Assistant (RAG)** — Ask questions about water data and receive contextual AI insights
* 🧠 **Vector Knowledge Search** — Uses embeddings and FAISS for fast semantic retrieval
* 🌍 **SDG-Aligned Solution** — Designed to support Sustainable Development Goal 6

---

# 🏗 System Architecture

```
IoT Simulator (Node.js)
        │
        │  POST /api/sensor-data (every 30s)
        ▼
Next.js API Routes (Vercel)
        │
        │  Analyze → Store → Alert
        ▼
MongoDB Atlas (Cloud Database)
        │
        ▼
Python AI Microservice
(Render Deployment)

LangChain
FAISS Vector Database
HuggingFace Embeddings
FLAN-T5 Language Model
        │
        ▼
React Dashboard
Dashboard | Monitor | Alerts | AI Assistant
```

---

# 🧰 Tech Stack

| Layer         | Technology                                |
| ------------- | ----------------------------------------- |
| **Frontend**  | Next.js 14 (App Router) + Tailwind CSS    |
| **Backend**   | Next.js API Routes                        |
| **Database**  | MongoDB Atlas                             |
| **AI Stack**  | LangChain · FAISS · HuggingFace · FLAN-T5 |
| **Hosting**   | Vercel (Web App) · Render (AI Service)    |
| **Simulator** | Node.js + Axios                           |

---

# ⚡ Quick Start

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/latenza-vita.git
cd latenza-vita
```

---

# 🤖 Run the AI Service

```bash
cd ai-service

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

python app.py
```

AI service runs at:

```
http://localhost:5001
```

---

# 🌐 Run the Web Application

```bash
cd webapp

cp .env.local.example .env.local
# Add your MongoDB connection string

npm install
npm run dev
```

Web app runs at:

```
http://localhost:3000
```

---

# 📡 Run the IoT Simulator

```bash
cd iot-simulator

npm install
node simulator.js
```

This simulator sends **synthetic water sensor readings every 30 seconds** to the backend API.

---

# 🖥 Application Pages

| Page             | Route        | Description                                 |
| ---------------- | ------------ | ------------------------------------------- |
| **Dashboard**    | `/`          | Overview of water metrics and system status |
| **Monitor**      | `/monitor`   | Complete table of sensor readings           |
| **Alerts**       | `/alerts`    | Risk-level alerts with AI analysis          |
| **AI Assistant** | `/assistant` | Chat interface powered by RAG               |

---

# ☁️ Deployment

| Service         | Platform      |
| --------------- | ------------- |
| Web Application | Vercel        |
| AI Microservice | Render        |
| Database        | MongoDB Atlas |

Deployment steps:

1. Connect GitHub repo to **Vercel**
2. Set root directory to `webapp`
3. Deploy AI service on **Render**
4. Configure environment variables
5. Connect **MongoDB Atlas cluster**

---

# 🌍 SDG 6 Impact

Latenza Vita supports **United Nations Sustainable Development Goal 6 — Clean Water and Sanitation**.

The platform enables municipalities to:

* Detect contamination early
* Monitor water infrastructure continuously
* Prevent large-scale public health risks
* Enable data-driven water governance

By combining **AI, IoT, and real-time analytics**, Latenza Vita contributes toward **safe and sustainable water management systems**.

---

# 📌 Future Enhancements

* Real IoT sensor integration
* Predictive contamination forecasting
* SMS / WhatsApp emergency alerts
* GIS-based water quality mapping
* Mobile application for field engineers

---

# 👨‍💻 Contributors

**Team Latenza Vita**

Built for the **GenAI Hackathon** to demonstrate how AI can transform urban water management.

---
