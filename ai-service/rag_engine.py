"""
Latenza Vita — RAG Engine
FAISS + SentenceTransformers + Anthropic Claude API
Zero warnings | No LangChain | No model downloads
"""

import os
import json
import logging
import pickle
import urllib.request
import urllib.error
from pathlib import Path

logger = logging.getLogger(__name__)

KNOWLEDGE_BASE_PATH = Path(__file__).parent / "knowledge_base" / "water_safety.txt"
VECTOR_DB_PATH      = Path(__file__).parent / "vector_db"
ANTHROPIC_API_KEY   = os.environ.get("ANTHROPIC_API_KEY", "")


class LatenzaVitaRAG:

    def __init__(self):
        self.index    = None
        self.chunks   = []
        self.embedder = None
        self._init()

    def _init(self):
        try:
            self._build_pipeline()
        except ImportError as e:
            logger.warning(f"[RAG] Dependency missing — fallback mode: {e}")
        except Exception as e:
            logger.error(f"[RAG] Init error — fallback mode: {e}")

    def _build_pipeline(self):
        import faiss
        import numpy as np
        from sentence_transformers import SentenceTransformer

        # 1. Load and chunk knowledge base
        logger.info("[RAG] Loading knowledge base...")
        text        = KNOWLEDGE_BASE_PATH.read_text(encoding="utf-8")
        self.chunks = self._split_text(text, chunk_size=500, overlap=60)
        logger.info(f"[RAG] {len(self.chunks)} chunks created")

        # 2. Load SentenceTransformer
        logger.info("[RAG] Loading SentenceTransformer...")
        self.embedder = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

        # 3. Build or load FAISS index
        VECTOR_DB_PATH.mkdir(exist_ok=True)
        index_file  = VECTOR_DB_PATH / "faiss.index"
        chunks_file = VECTOR_DB_PATH / "chunks.pkl"

        if index_file.exists() and chunks_file.exists():
            logger.info("[RAG] Loading cached FAISS index...")
            self.index = faiss.read_index(str(index_file))
            with open(chunks_file, "rb") as f:
                self.chunks = pickle.load(f)
        else:
            logger.info("[RAG] Building new FAISS index...")
            embeddings = self.embedder.encode(
                self.chunks,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=True,
            )
            dim        = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dim)
            self.index.add(embeddings.astype(np.float32))
            faiss.write_index(self.index, str(index_file))
            with open(chunks_file, "wb") as f:
                pickle.dump(self.chunks, f)
            logger.info("[RAG] FAISS index saved")

        logger.info("[RAG] Pipeline ready ✓")

    def _split_text(self, text: str, chunk_size: int = 500, overlap: int = 60) -> list:
        chunks = []
        start  = 0
        while start < len(text):
            end   = min(start + chunk_size, len(text))
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            start += chunk_size - overlap
        return chunks

    def _retrieve(self, query: str, k: int = 3) -> str:
        if self.index is None or self.embedder is None:
            return ""
        import numpy as np
        q_emb      = self.embedder.encode(
            [query],
            convert_to_numpy=True,
            normalize_embeddings=True,
        ).astype(np.float32)
        _, indices = self.index.search(q_emb, k)
        retrieved  = [
            self.chunks[i]
            for i in indices[0]
            if 0 <= i < len(self.chunks)
        ]
        return "\n\n".join(retrieved)

    def _call_claude(self, system_prompt: str, user_message: str) -> str:
        if not ANTHROPIC_API_KEY:
            return ""
        payload = json.dumps({
            "model":      "claude-haiku-4-5-20251001",
            "max_tokens": 512,
            "system":     system_prompt,
            "messages":   [{"role": "user", "content": user_message}],
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=payload,
            headers={
                "Content-Type":      "application/json",
                "x-api-key":         ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                return body["content"][0]["text"].strip()
        except urllib.error.HTTPError as e:
            logger.error(f"[RAG] Claude API error {e.code}: {e.read().decode()}")
        except Exception as e:
            logger.error(f"[RAG] Claude API error: {e}")
        return ""

    def answer_question(self, question: str) -> str:
        if self.index is not None:
            try:
                context = self._retrieve(question)
                system  = (
                    "You are Latenza Vita's municipal water quality AI expert. "
                    "Answer using the context provided. Include WHO/BIS standards and numbers."
                )
                user    = (
                    f"Context:\n{context}\n\n"
                    f"Question: {question}\n\nAnswer:"
                )
                answer = self._call_claude(system, user)
                if answer and len(answer) > 15:
                    return answer
            except Exception as e:
                logger.error(f"[RAG] answer_question error: {e}")
        return self._fallback_answer(question)

    def generate_alert_analysis(self, data: dict) -> str:
        issues   = data.get("issues",    [])
        risk     = data.get("riskLevel", "MODERATE")
        division = data.get("division",  "Unknown")
        query    = (
            f"Water quality alert in {division}. "
            f"Issues: {', '.join(issues)}. Risk: {risk}. "
            "What are the health risks and emergency actions?"
        )
        if self.index is not None:
            try:
                context  = self._retrieve(query)
                system   = (
                    "You are a water safety emergency response expert. "
                    "Give clear, direct emergency actions to protect public health."
                )
                user     = (
                    f"Context:\n{context}\n\n"
                    f"Alert: {query}\n\nEmergency actions:"
                )
                analysis = self._call_claude(system, user)
                if analysis and len(analysis) > 20:
                    return analysis
            except Exception as e:
                logger.error(f"[RAG] alert analysis error: {e}")
        return self._fallback_alert(issues, risk)

    def _fallback_answer(self, question: str) -> str:
        q = question.lower()
        if "ph" in q:
            return (
                "Safe pH for drinking water is 6.5 to 8.5 (WHO / BIS IS-10500). "
                "Below 6.5 is acidic and corrodes pipes leaching heavy metals. "
                "Above 8.5 is alkaline causing bitter taste and scaling. "
                "pH outside 5 to 10 requires immediate distribution shutdown."
            )
        if "turbidity" in q:
            return (
                "Turbidity should be below 1 NTU (WHO) or 4 NTU (EPA). "
                "Above 10 NTU indicates particles that harbor pathogens. "
                "Causes: heavy rainfall, runoff, algae, industrial discharge. "
                "Treatment: coagulation, flocculation, sedimentation, sand filtration."
            )
        if "bacteria" in q or "coliform" in q or "e.coli" in q:
            return (
                "Zero coliform bacteria per 100 mL is the WHO absolute standard. "
                "Detection requires: immediate boil-water advisory, "
                "chlorination boost to 0.5 mg/L, "
                "network flushing, and lab confirmation within 2 hours."
            )
        if "tds" in q or "dissolved solid" in q:
            return (
                "TDS: below 300 mg/L excellent, 300 to 600 good, "
                "600 to 900 fair, above 1200 mg/L unacceptable. "
                "High TDS indicates industrial effluents or mineral deposits. "
                "Treatment: reverse osmosis, distillation, electrodialysis."
            )
        if "chemical" in q or "contamination" in q or "arsenic" in q or "lead" in q:
            return (
                "Chemical contamination requires immediate supply shutdown. "
                "Do NOT boil — it concentrates chemical contaminants. "
                "Deploy activated-carbon filtration and reverse osmosis. "
                "Engage State Pollution Control Board for industrial inspection."
            )
        if "emergency" in q or "action" in q or "measures" in q:
            return (
                "Emergency protocol for DANGER level: "
                "1) Issue boil-water advisory within 15 minutes. "
                "2) Stop distribution from affected zone. "
                "3) Deploy mobile water tankers within 2 hours. "
                "4) Notify District Collector and Chief Medical Officer. "
                "5) Dispatch field team for sampling. "
                "6) Test every 2 hours until 3 consecutive safe readings."
            )
        if "rainfall" in q or "flood" in q or "monsoon" in q:
            return (
                "Heavy rainfall above 50mm causes turbidity spikes and bacterial "
                "contamination through surface runoff within 2 to 4 hours. "
                "Flooding can cause sewage overflow into supply networks. "
                "Monitor for delayed contamination 6 to 12 hours post-event."
            )
        if "temperature" in q or "heat" in q:
            return (
                "Ideal water temperature is 10 to 20 degrees Celsius. "
                "Above 30 degrees accelerates bacterial growth by up to 50 percent. "
                "Above 35 degrees indicates infrastructure heating requiring inspection."
            )
        if "cholera" in q or "typhoid" in q or "disease" in q or "health" in q:
            return (
                "Common waterborne diseases: "
                "Cholera causes severe diarrhea and dehydration. "
                "Typhoid causes fever and systemic infection. "
                "Hepatitis A causes liver damage. "
                "Prevention: maintain 0.2 mg/L residual chlorine and zero bacteria."
            )
        if "treatment" in q or "purifi" in q or "process" in q:
            return (
                "Municipal water treatment: "
                "1) Coagulation. 2) Flocculation. 3) Sedimentation. "
                "4) Sand filtration. 5) Chlorination. 6) pH adjustment. "
                "7) Distribute with 0.2 mg/L residual chlorine."
            )
        return (
            "Latenza Vita monitors water quality against WHO and BIS IS-10500 standards. "
            "Key thresholds: pH 6.5 to 8.5, turbidity below 4 NTU, TDS below 500 mg/L, "
            "zero coliform bacteria, temperature 5 to 30 degrees Celsius."
        )

    def _fallback_alert(self, issues: list, risk: str) -> str:
        issue_text = ", ".join(issues) if issues else "water quality deviation"
        if risk == "DANGER":
            return (
                f"CRITICAL WATER QUALITY EMERGENCY: {issue_text}. "
                "Water is unsafe for human consumption. "
                "Issue boil-water advisory, stop distribution, deploy emergency tankers, "
                "notify health authorities within 30 minutes."
            )
        return (
            f"MODERATE WATER QUALITY RISK: {issue_text}. "
            "Issue precautionary boil-water advisory and implement corrective treatment. "
            "Notify Division Health Officer and increase monitoring to every 15 minutes."
        )