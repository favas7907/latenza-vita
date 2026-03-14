🌊 Latenza Vita
Smart AI-Powered Water Quality Monitoring & Alert System

Supporting UN Sustainable Development Goals:
SDG 3 · SDG 6 · SDG 9 · SDG 11

Category: GenAI + Smart Cities + IoT

📌 Project Overview

Latenza Vita is an AI-powered municipal water monitoring platform designed to detect water quality risks in real time.

The system integrates IoT sensor data, cloud infrastructure, and generative AI to help municipalities monitor water infrastructure and respond quickly to contamination events.

The platform provides:

Real-time monitoring dashboards

AI-powered alerts for unsafe water conditions

Intelligent data analysis using Retrieval-Augmented Generation (RAG)

Scalable cloud-based architecture

This enables proactive water management and safer urban infrastructure.

🚀 Key Features
📡 Real-Time Water Monitoring

Continuous ingestion of water quality data from distributed IoT sensors.

⚠️ AI-Powered Alert System

Automatically detects abnormal water conditions and generates alerts for municipal authorities.

📊 Interactive Monitoring Dashboard

Visualizes real-time water quality metrics, sensor data, and infrastructure health.

🤖 AI Assistant (RAG Powered)

Users can ask questions about water quality data and receive contextual insights.

🧠 Semantic Knowledge Retrieval

Uses vector embeddings and FAISS for fast and accurate knowledge retrieval.

🌍 Sustainability Focus

Designed to address multiple United Nations Sustainable Development Goals (SDGs).

🏗 System Architecture
IoT Simulator (Node.js)
        │
        │  POST /api/sensor-data (every 30 seconds)
        ▼
Next.js Backend API Routes
        │
        │  Analyze → Store → Alert
        ▼
MongoDB Atlas (Cloud Database)
        │
        ▼
Python AI Microservice
LangChain + FAISS + HuggingFace
        │
        ▼
React Dashboard
Dashboard | Monitor | Alerts | AI Assistant
🧰 Technology Stack
Layer	Technology
Frontend	Next.js 14 · React · Tailwind CSS
Backend	Next.js API Routes
Database	MongoDB Atlas
AI Framework	LangChain
Vector Search	FAISS
Embeddings	HuggingFace
Language Model	FLAN-T5
Hosting	Vercel · Render
IoT Simulator	Node.js · Axios
⚡ Getting Started
1️⃣ Clone Repository
git clone https://github.com/YOUR_USERNAME/latenza-vita.git
cd latenza-vita
🤖 Run AI Microservice
cd ai-service

python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r requirements.txt

python app.py

AI service will start at:

http://localhost:5001
🌐 Run Web Application
cd webapp

cp .env.local.example .env.local

Edit .env.local and add your MongoDB Atlas connection string.

Then run:

npm install
npm run dev

Web application runs at:

http://localhost:3000
📡 Run IoT Simulator
cd iot-simulator

npm install
node simulator.js

The simulator generates synthetic water sensor data every 30 seconds.

🖥 Application Pages
Page	Route	Description
Dashboard	/	System overview and key metrics
Monitor	/monitor	Complete table of sensor readings
Alerts	/alerts	AI-generated risk alerts
AI Assistant	/assistant	RAG-powered chat assistant
☁️ Deployment
Component	Platform
Web Application	Vercel
AI Service	Render
Database	MongoDB Atlas
Deployment Workflow

Push repository to GitHub

Connect project to Vercel

Set root directory = webapp

Deploy AI microservice to Render

Configure environment variables

Connect MongoDB Atlas database

🌍 Sustainable Development Goals Impact

Latenza Vita supports several United Nations Sustainable Development Goals (SDGs) by enabling AI-driven smart water infrastructure.

💧 SDG 6 — Clean Water and Sanitation

Objective: Ensure safe and sustainable water access.

How Latenza Vita Contributes

Continuous water quality monitoring

Early detection of contamination events

Automated alerts for municipal authorities

Improved infrastructure visibility

Impact:
Ensures safer and more reliable drinking water systems.

🏥 SDG 3 — Good Health and Well-Being

Objective: Protect public health.

Contribution

Early detection of unsafe water conditions

Prevention of waterborne disease outbreaks

AI-assisted risk analysis for authorities

Impact:
Reduces risks from cholera, typhoid, and other waterborne diseases.

🏗 SDG 9 — Industry, Innovation and Infrastructure

Objective: Build resilient infrastructure and foster innovation.

Contribution

Integrates IoT sensors with AI analytics

Uses vector search and RAG pipelines

Demonstrates modern AI-driven infrastructure monitoring

Impact:
Encourages development of smart infrastructure systems.

🏙 SDG 11 — Sustainable Cities and Communities

Objective: Build sustainable and resilient cities.

Contribution

Smart monitoring of municipal water networks

Real-time dashboards for city administrators

Data-driven decision support systems

Impact:
Supports development of smart city water management systems.

🌱 Future Enhancements

Integration with real IoT sensors

Predictive water contamination forecasting

SMS / WhatsApp alert system

GIS-based water infrastructure mapping

Mobile app for field engineers

Smart city platform integration

👨‍💻 Contributors

Team Latenza Vita

Developed for the GenAI Hackathon to demonstrate how Artificial Intelligence can transform urban water monitoring and infrastructure management.
