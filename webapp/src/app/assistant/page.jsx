'use client'
import { useState, useRef, useEffect } from 'react'
import { Bot, User, Send, Loader2, Sparkles, Waves } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

const SUGGESTED_QUESTIONS = [
  'What is the safe pH range for drinking water?',
  'What causes high turbidity in municipal water?',
  'What should authorities do when bacteria is detected?',
  'What are the health effects of high TDS water?',
  'How does heavy rainfall affect water quality?',
  'What emergency measures are needed for chemical contamination?',
  'What is the WHO standard for drinking water quality?',
  'How is cholera spread through water and how is it prevented?',
  'What treatment process does a municipal water plant use?',
  'How does temperature affect bacterial growth in water?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-slide-up`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isUser
          ? 'bg-lv-500/30 border border-lv-400/30'
          : 'bg-purple-500/20 border border-purple-400/30'
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-lv-300" />
          : <Bot  className="w-4 h-4 text-purple-300" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-lv-500/20 border border-lv-400/20 text-lv-100 rounded-tr-sm'
          : 'bg-white/[0.05] border border-white/[0.10] text-slate-200 rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm Latenza Vita's AI water safety assistant. " +
        "I use RAG (Retrieval Augmented Generation) powered by LangChain, FAISS, and FLAN-T5 " +
        "to answer your questions about municipal water quality, contamination risks, " +
        "treatment methods, and emergency protocols. How can I help you?",
    },
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const now = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const send = async (question) => {
    const q = (question || input).trim()
    if (!q || loading) return

    setInput('')
    setMessages(m => [...m, { role: 'user', content: q, time: now() }])
    setLoading(true)

    try {
      const res  = await fetch('/api/ask-ai', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: q }),
      })
      const json = await res.json()
      setMessages(m => [
        ...m,
        {
          role:    'assistant',
          content: json.data?.answer || 'I could not retrieve an answer. Please try again.',
          time:    now(),
        },
      ])
    } catch {
      setMessages(m => [
        ...m,
        {
          role:    'assistant',
          content: 'AI service temporarily unavailable. Please try again.',
          time:    now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 flex-1 p-8 space-y-6 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className="lv-title">AI Assistant</h1>
          <p className="lv-subtitle">
            RAG-powered water safety expert — LangChain · FAISS · HuggingFace · FLAN-T5
          </p>
        </div>

        <div
          className="grid grid-cols-3 gap-6"
          style={{ height: 'calc(100vh - 210px)', minHeight: '520px' }}
        >
          {/* ── Suggested questions ── */}
          <div className="lv-card flex flex-col gap-3 p-4 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/[0.07] pb-3 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-lv-400" />
              <span className="text-sm font-semibold text-white">Try asking…</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  disabled={loading}
                  className="w-full text-left text-xs text-slate-400
                             hover:text-lv-300 bg-white/[0.03]
                             hover:bg-lv-500/10 border border-white/[0.05]
                             hover:border-lv-400/20 rounded-xl px-3 py-2.5
                             transition-all duration-200 leading-relaxed
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Tech stack badge */}
            <div className="lv-card px-3 py-3 flex-shrink-0 mt-1">
              <p className="text-[10px] text-slate-600 leading-relaxed space-y-0.5">
                <span className="block text-slate-500 font-semibold mb-1">AI Stack</span>
                LangChain orchestration<br />
                FAISS vector database<br />
                all-MiniLM-L6-v2 embeddings<br />
                Google FLAN-T5 generation
              </p>
            </div>
          </div>

          {/* ── Chat window ── */}
          <div className="col-span-2 lv-card flex flex-col overflow-hidden">

            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/30
                              flex items-center justify-center">
                <Waves className="w-5 h-5 text-lv-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Latenza Vita AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-500">Online · RAG enabled</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {messages.map((m, i) => <Message key={i} msg={m} />)}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/30
                                  flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl
                                  rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                    <span className="text-sm text-slate-500">Thinking…</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-white/[0.07] px-5 py-4 flex-shrink-0">
              <div className="flex gap-3 items-end">
                <textarea
                  rows={1}
                  className="lv-input flex-1 resize-none"
                  placeholder="Ask about water quality, standards, contamination, emergency protocols…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  style={{ minHeight: '44px', maxHeight: '110px' }}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="lv-btn-primary py-3 px-4 flex-shrink-0"
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send    className="w-4 h-4" />
                  }
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-2">
                Press <kbd className="bg-white/10 px-1 rounded text-slate-500">Enter</kbd> to send ·
                <kbd className="bg-white/10 px-1 rounded text-slate-500 mx-1">Shift + Enter</kbd> for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}