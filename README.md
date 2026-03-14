🌊 Latenza Vita
Smart AI-Powered Water Quality Monitoring & Alert System

SDG 3 · SDG 6 · SDG 9 · SDG 11 | GenAI Hackathon Project

Latenza Vita is an AI-driven municipal water monitoring platform that analyzes real-time water quality data from IoT sensors and provides intelligent alerts, dashboards, and AI insights to help authorities respond quickly to contamination risks.

The platform integrates IoT simulation, cloud infrastructure, and generative AI to enable proactive water quality management for modern cities.

🚀 Key Features

📡 Real-Time Water Monitoring
Continuous ingestion of sensor data from distributed water sources.

⚠️ AI-Powered Alerts
Automatically detects abnormal water quality readings and notifies responsible authorities.

📊 Interactive Dashboard
Visualize water metrics, trends, and infrastructure status in real time.

🤖 AI Assistant (RAG)
Ask natural language questions about water data and receive AI-generated insights.

🧠 Vector Knowledge Search
Uses embeddings and FAISS vector indexing for fast semantic retrieval.

🌍 Sustainability Focused
Designed to support multiple United Nations Sustainable Development Goals.

🏗 System Architecture
IoT Simulator (Node.js)
        │
        │  POST /api/sensor-data every 30s
        ▼
Next.js API Routes (Vercel)
        │
        │  Analyze → Store → Alert
        ▼
MongoDB Atlas (Cloud Database)
        │
        ▼
Python AI Microservice (Render)

LangChain
FAISS Vector Database
HuggingFace Embeddings
FLAN-T5 Language Model
        │
        ▼
React Dashboard

Dashboard | Monitor | Alerts | AI Assistant
🧰 Tech Stack
Layer	Technology
Frontend	Next.js 14 (App Router) + Tailwind CSS
Backend	Next.js API Routes
Database	MongoDB Atlas
AI Stack	LangChain · FAISS · HuggingFace · FLAN-T5
Hosting	Vercel (Web App) · Render (AI Service)
Simulator	Node.js + Axios
⚡ Quick Start
1️⃣ Clone the Repository
git clone https://github.com/YOUR_USERNAME/latenza-vita.git
cd latenza-vita
🤖 Run the AI Service
cd ai-service

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

python app.py

AI service will run at:

http://localhost:5001
🌐 Run the Web Application
cd webapp

cp .env.local.example .env.local

Edit .env.local and add your MongoDB connection string.

Then run:

npm install
npm run dev

Web app will run at:

http://localhost:3000
📡 Run the IoT Simulator
cd iot-simulator

npm install
node simulator.js

The simulator sends synthetic water sensor data every 30 seconds to the backend API.

🖥 Application Pages
Page	Route	Description
Dashboard	/	Overview of water metrics and system status
Monitor	/monitor	Complete table of sensor readings
Alerts	/alerts	Risk-level alerts with AI analysis
AI Assistant	/assistant	RAG-powered AI chat interface
☁️ Deployment
Service	Platform
Web Application	Vercel
AI Microservice	Render
Database	MongoDB Atlas
Deployment Steps

Push project to GitHub

Connect repository to Vercel

Set root directory to:

webapp

Deploy AI service to Render

Configure environment variables

Connect MongoDB Atlas cluster

🌍 Sustainable Development Goals Impact

Latenza Vita contributes to multiple United Nations Sustainable Development Goals (SDGs) by using AI, IoT, and data analytics to improve urban water infrastructure and public safety.

💧 SDG 6 — Clean Water and Sanitation

Goal: Ensure availability and sustainable management of water for all.

Contribution

Continuous monitoring of water quality

Early detection of contamination risks

Automated alert system for municipal authorities

Data-driven water infrastructure management

Impact:
Improves access to safe and reliable drinking water.

🏥 SDG 3 — Good Health and Well-Being

Goal: Ensure healthy lives and promote well-being.

Contribution

Prevents waterborne disease outbreaks

Detects unsafe water conditions early

Provides AI-generated recommendations for response

Impact:
Reduces risks from cholera, typhoid, and other waterborne illnesses.

🏗 SDG 9 — Industry, Innovation and Infrastructure

Goal: Build resilient infrastructure and foster innovation.

Contribution

Combines IoT, AI, and cloud computing

Uses vector databases and RAG pipelines

Demonstrates next-generation AI-powered municipal infrastructure

Impact:
Promotes smart infrastructure for modern cities.

🏙 SDG 11 — Sustainable Cities and Communities

Goal: Make cities safe, resilient, and sustainable.

Contribution

Real-time monitoring for city water systems

Smart dashboards for municipal authorities

Enables proactive urban resource management

Impact:
Supports development of smart and resilient cities.

🌱 Future Enhancements

Real IoT sensor integration

Predictive contamination forecasting

SMS / WhatsApp emergency alerts

GIS-based water quality mapping

Mobile application for field engineers

Integration with government smart city platforms

👨‍💻 Contributors

Team Latenza Vita

Developed for the GenAI Hackathon to demonstrate how Artificial Intelligence can transform urban water management systems.
