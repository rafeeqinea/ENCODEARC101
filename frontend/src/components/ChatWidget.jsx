import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, User, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

/* ArcBot avatar — orange blob with clean glowing eyes for chat messages */
function ArcBotAvatar({ size = 24, animate = false }) {
  const uid = `bot-${size}`
  return (
    <motion.svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      animate={animate ? { scale: [1, 1.06, 1] } : {}}
      transition={animate ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="35%" cy="35%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F97316" />
        </radialGradient>
      </defs>
      {/* Blob body */}
      <path d="M20,2 C28,2 36,8 38,16 C40,24 36,34 28,38 C20,42 10,38 4,30 C-2,22 2,10 10,4 C14,2 18,2 20,2Z" fill={`url(#${uid}-bg)`} />
      {/* Highlight */}
      <ellipse cx="15" cy="12" rx="5" ry="3" fill="rgba(255,255,255,0.18)" />
      {/* Eyes — simple white dots */}
      <circle cx="15" cy="19" r="2" fill="white" opacity="0.95" />
      <circle cx="25" cy="19" r="2" fill="white" opacity="0.95" />
    </motion.svg>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hey! I\'m ArcBot 🤖 — your AI treasury assistant. Ask me about balances, risk levels, yield strategies, FX rates, or recent agent decisions.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = async () => {
    const msg = input.trim()
    if (!msg || loading) return

    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)

    try {
      const res = await api.chat(msg)
      setMessages(prev => [...prev, { role: 'assistant', text: res.response, source: res.source }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Hmm, I hit a snag. Try again in a moment!' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Floating chat-bubble button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-[56px] h-[56px]"
            style={{ filter: 'drop-shadow(0 4px 18px rgba(249,115,22,0.4))' }}
          >
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <defs>
                <linearGradient id="fabGrad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
              </defs>
              {/* Rounded chat bubble */}
              <path d="M8 4 H48 C52 4 56 8 56 12 V36 C56 40 52 44 48 44 H20 L10 52 V44 H8 C4 44 0 40 0 36 V12 C0 8 4 4 8 4Z" fill="url(#fabGrad)" />
              {/* Lightning bolt icon */}
              <text x="28" y="27" dominantBaseline="middle" textAnchor="middle" fontSize="20" fill="white" style={{ pointerEvents: 'none' }}>⚡</text>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] rounded-2xl overflow-hidden flex flex-col border border-[var(--color-border)] shadow-2xl"
            style={{ background: 'var(--color-bg-primary)', boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 20px rgba(249,115,22,0.1)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]"
                 style={{ background: 'var(--color-bg-secondary)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center">
                  <ArcBotAvatar size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">ArcBot</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                    <p className="text-[0.6rem] text-[var(--color-text-muted)]">AI Treasury Agent • Online</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors">
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 hidden-scrollbar">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArcBotAvatar size={16} />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[var(--color-accent)] text-white rounded-br-sm'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-bl-sm border border-[var(--color-border-light)]'
                  }`}>
                    {m.text}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-[var(--color-text-muted)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-[var(--color-text-secondary)]" />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 justify-start"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                    <ArcBotAvatar size={16} animate />
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-[var(--color-border)]"
                 style={{ background: 'var(--color-bg-secondary)' }}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask ArcBot anything..."
                  className="flex-1 px-3 py-2 rounded-xl text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
