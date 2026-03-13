"""
Latenza Vita — RAG Engine
LangChain + FAISS + HuggingFace (all-MiniLM-L6-v2) + FLAN-T5
"""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

KNOWLEDGE_BASE_PATH = Path(__file__).parent / "knowledge_base" / "water_safety.txt"
VECTOR_DB_PATH      = Path(__file__).parent / "vector_db"


class LatenzaVitaRAG:
    """
    RAG pipeline for water quality questions.
    Falls back to rule-based answers if models are unavailable.
    """

    def __init__(self):
        self.vectorstore = None
        self.qa_chain    = None
        self.retriever   = None
        self._init()

    # ─────────────────────────────────────────────────────────────
    def _init(self):
        try:
            self._build_pipeline()
        except ImportError as e:
            logger.warning(f"[RAG] Dependency missing — fallback mode: {e}")
        except Exception as e:
            logger.error(f"[RAG] Init error — fallback mode: {e}")

    # ─────────────────────────────────────────────────────────────
    def _build_pipeline(self):
        from langchain_community.document_loaders import TextLoader
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from langchain_community.vectorstores import FAISS
        from langchain_community.llms import HuggingFacePipeline
        from langchain.chains import RetrievalQA
        from langchain.prompts import PromptTemplate
        from transformers import (
            pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
        )

        # ── 1. Load knowledge base ────────────────────────────────
        logger.info("[RAG] Loading knowledge base…")
        loader = TextLoader(str(KNOWLEDGE_BASE_PATH), encoding="utf-8")
        docs   = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, chunk_overlap=60,
            separators=["\n\n", "\n", ". ", " "]
        )
        chunks = splitter.split_documents(docs)
        logger.info(f"[RAG] {len(chunks)} knowledge chunks created")

        # ── 2. HuggingFace embeddings (all-MiniLM-L6-v2) ─────────
        logger.info("[RAG] Loading HuggingFace embeddings…")
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

        # ── 3. FAISS vector store ─────────────────────────────────
        VECTOR_DB_PATH.mkdir(exist_ok=True)
        index_path = VECTOR_DB_PATH / "faiss_index"

        if index_path.exists():
            logger.info("[RAG] Loading existing FAISS index…")
            self.vectorstore = FAISS.load_local(
                str(index_path),
                embeddings,
                allow_dangerous_deserialization=True,
            )
        else:
            logger.info("[RAG] Building new FAISS index…")
            self.vectorstore = FAISS.from_documents(chunks, embeddings)
            self.vectorstore.save_local(str(index_path))
            logger.info("[RAG] FAISS index saved.")

        self.retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3},
        )

        # ── 4. FLAN-T5 model ──────────────────────────────────────
        logger.info("[RAG] Loading FLAN-T5 model…")
        model_name = "google/flan-t5-base"
        tokenizer  = AutoTokenizer.from_pretrained(model_name)
        model      = AutoModelForSeq2SeqLM.from_pretrained(model_name)

        pipe = pipeline(
            "text2text-generation",
            model=model,
            tokenizer=tokenizer,
            max_new_tokens=300,
            do_sample=False,
            device="cpu",
        )
        llm = HuggingFacePipeline(pipeline=pipe)

        # ── 5. Prompt template ────────────────────────────────────
        prompt = PromptTemplate(
            template="""You are Latenza Vita's municipal water quality AI expert.
Use ONLY the following context to answer the question accurately.
Provide specific numbers and standards where available.

Context:
{context}

Question: {question}

Answer:""",
            input_variables=["context", "question"],
        )

        # ── 6. RetrievalQA chain ──────────────────────────────────
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.retriever,
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=False,
        )

        logger.info("[RAG] Pipeline ready ✓")

    # ─────────────────────────────────────────────────────────────
    def answer_question(self, question: str) -> str:
        """Answer a water safety question using RAG."""
        if self.qa_chain:
            try:
                result = self.qa_chain.invoke({"query": question})
                answer = result.get("result", "").strip()
                if answer and len(answer) > 15:
                    return answer
            except Exception as e:
                logger.error(f"[RAG] QA error: {e}")

        return self._fallback_answer(question)

    # ─────────────────────────────────────────────────────────────
    def generate_alert_analysis(self, data: dict) -> str:
        """Generate AI analysis for a water quality alert."""
        issues    = data.get("issues", [])
        risk      = data.get("riskLevel", "MODERATE")
        division  = data.get("division", "Unknown")

        query = (
            f"Water quality alert in {division}: {', '.join(issues)}. "
            f"Risk level: {risk}. "
            f"What are the immediate health risks and emergency actions required?"
        )

        if self.qa_chain:
            try:
                result = self.qa_chain.invoke({"query": query})
                text   = result.get("result", "").strip()
                if text and len(text) > 20:
                    return text
            except Exception as e:
                logger.error(f"[RAG] Alert analysis error: {e}")

        return self._fallback_alert(issues, risk)

    # ─────────────────────────────────────────────────────────────
    def _fallback_answer(self, question: str) -> str:
        """Rule-based fallback answers when AI model is unavailable."""
        q = question.lower()

        if "ph" in q:
            return (
                "Safe pH for drinking water is 6.5–8.5 (WHO / BIS IS-10500). "
                "Below 6.5 is acidic — corrodes pipes and leaches heavy metals. "
                "Above 8.5 is alkaline — bitter taste and scaling. "
                "pH outside 5–10 requires immediate distribution shutdown."
            )
        if "turbidity" in q:
            return (
                "Turbidity should be below 1 NTU (WHO) or 4 NTU (EPA). "
                "High turbidity (>10 NTU) indicates suspended particles that harbor pathogens. "
                "Causes: heavy rainfall, runoff, algae, industrial discharge. "
                "Treatment: coagulation → flocculation → sedimentation → sand filtration."
            )
        if "bacteria" in q or "coliform" in q or "e.coli" in q:
            return (
                "Zero coliform bacteria per 100 mL is the WHO absolute standard. "
                "Detected bacteria requires: immediate boil-water advisory, "
                "chlorination boost to 0.5 mg/L minimum, "
                "network flushing, and lab confirmation within 2 hours."
            )
        if "tds" in q or "dissolved solid" in q:
            return (
                "TDS: <300 mg/L excellent, 300–600 mg/L good, "
                "600–900 mg/L fair, >1200 mg/L unacceptable. "
                "High TDS indicates industrial effluents or mineral deposits. "
                "Treatment: reverse osmosis, distillation, electrodialysis."
            )
        if "chemical" in q or "contamination" in q or "arsenic" in q or "lead" in q:
            return (
                "Chemical contamination requires immediate supply shutdown. "
                "Do NOT boil — this concentrates most chemical contaminants. "
                "Deploy activated-carbon filtration and reverse osmosis. "
                "Engage State Pollution Control Board for industrial inspection."
            )
        if "emergency" in q or "action" in q or "measures" in q:
            return (
                "Emergency protocol (DANGER level): "
                "1) Boil-water advisory within 15 minutes. "
                "2) Stop distribution from affected zone. "
                "3) Deploy mobile tankers within 2 hours. "
                "4) Notify District Collector and CMO. "
                "5) Field team for sampling. "
                "6) Test every 2 hours until 3 consecutive safe readings."
            )
        if "rainfall" in q or "flood" in q or "monsoon" in q:
            return (
                "Heavy rainfall (>50mm) causes turbidity spikes and bacterial contamination "
                "through surface runoff within 2–4 hours. "
                "Flooding can cause sewage overflow into supply networks. "
                "Monitor for delayed contamination 6–12 hours post-event. "
                "Mandatory 48-hour testing protocol before restoring post-flood supply."
            )
        if "temperature" in q or "heat" in q:
            return (
                "Ideal water temperature: 10–20°C. "
                "Above 30°C accelerates bacterial growth by up to 50%. "
                "Above 35°C indicates infrastructure heating — immediate inspection required. "
                "Monitor temperature alongside bacterial counts during summer months."
            )
        if "cholera" in q or "typhoid" in q or "disease" in q or "health" in q:
            return (
                "Common waterborne diseases: "
                "Cholera (Vibrio cholerae) — severe diarrhea, rapid dehydration. "
                "Typhoid (Salmonella typhi) — fever, systemic infection. "
                "Hepatitis A — liver damage. "
                "Cryptosporidiosis — resistant to chlorination, needs UV treatment. "
                "Prevention: maintain 0.2 mg/L residual chlorine, zero bacteria, regular testing."
            )
        if "treatment" in q or "purifi" in q or "process" in q:
            return (
                "Municipal water treatment: "
                "1) Coagulation (alum addition). "
                "2) Flocculation (slow mixing). "
                "3) Sedimentation (settling). "
                "4) Sand filtration. "
                "5) Chlorine disinfection. "
                "6) pH adjustment. "
                "7) Distribution with 0.2 mg/L residual chlorine maintained."
            )
        return (
            "Latenza Vita monitors water quality against WHO and BIS IS-10500 standards. "
            "Key thresholds: pH 6.5–8.5, turbidity <4 NTU, TDS <500 mg/L, "
            "zero coliform bacteria, temperature 5–30°C. "
            "Any deviation triggers automated risk scoring and authority escalation."
        )

    def _fallback_alert(self, issues: list, risk: str) -> str:
        """Fallback alert analysis text."""
        if risk == "DANGER":
            return (
                f"CRITICAL WATER QUALITY EMERGENCY: {', '.join(issues)}. "
                "This water is unsafe for any human consumption or contact. "
                "Immediate public health intervention is mandatory. "
                "Issue boil-water advisory, stop distribution, deploy emergency tankers, "
                "and notify health authorities within 30 minutes per protocol."
            )
        return (
            f"MODERATE WATER QUALITY RISK: {', '.join(issues)}. "
            "Water quality has deviated from WHO safe thresholds. "
            "Issue precautionary boil-water advisory and implement treatment measures. "
            "Notify Division Health Officer and increase monitoring frequency to every 15 minutes."
        )