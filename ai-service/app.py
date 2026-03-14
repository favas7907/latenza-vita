"""
Latenza Vita — Python AI Microservice
Flask REST API serving RAG-powered water quality intelligence
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_engine import LatenzaVitaRAG

# ── Logging ───────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── Load RAG engine once at startup ──────────────────────────────
logger.info("Starting Latenza Vita AI Service…")
rag = LatenzaVitaRAG()
logger.info("AI Service ready.")


# ─────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":  "healthy",
        "service": "Latenza Vita AI",
        "rag":     rag.qa_chain is not None,
    })


# ─────────────────────────────────────────────────────────────────
@app.route("/ai/ask", methods=["POST"])
def ask():
    """Answer a general water safety question using RAG."""
    try:
        data = request.get_json(force=True)
        if not data or "question" not in data:
            return jsonify({"error": "Field 'question' is required"}), 400

        question = data["question"].strip()
        if not question:
            return jsonify({"error": "Question cannot be empty"}), 400

        answer = rag.answer_question(question)
        return jsonify({"question": question, "answer": answer})

    except Exception as e:
        logger.error(f"[/ai/ask] {e}")
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
@app.route("/ai/analyze-alert", methods=["POST"])
def analyze_alert():
    """Generate AI analysis narrative for an alert."""
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No data provided"}), 400

        analysis = rag.generate_alert_analysis(data)
        return jsonify({"analysis": analysis})

    except Exception as e:
        logger.error(f"[/ai/analyze-alert] {e}")
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)