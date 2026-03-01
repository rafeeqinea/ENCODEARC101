import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink, ShieldCheck, Database, Zap, Globe, Cpu, ArrowRight,
  Layers, Brain, Wallet, TrendingUp, RefreshCw, Lock, BarChart3,
  Eye, ChevronDown, ChevronUp, ArrowDown, Activity, Receipt
} from 'lucide-react'

/* ── Looping CSS animations injected once ── */
const ANIM_STYLES = `
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(249,115,22,0.15), 0 0 60px rgba(249,115,22,0.05); }
  50% { box-shadow: 0 0 35px rgba(249,115,22,0.3), 0 0 80px rgba(249,115,22,0.1); }
}
@keyframes flow-right {
  0% { transform: translateX(-8px); opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translateX(8px); opacity: 0; }
}
@keyframes flow-down {
  0% { transform: translateY(-6px); opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translateY(6px); opacity: 0; }
}
@keyframes status-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.6); opacity: 0.4; }
}
@keyframes float-emoji {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes rotate-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes core-ring {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(1.3); opacity: 0; }
}
.arch-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
.arch-flow-right { animation: flow-right 1.5s ease-in-out infinite; }
.arch-flow-down { animation: flow-down 1.5s ease-in-out infinite; }
.arch-status-pulse { animation: status-pulse 2s ease-in-out infinite; }
.arch-float { animation: float-emoji 3s ease-in-out infinite; }
.arch-rotate { animation: rotate-slow 8s linear infinite; }
.arch-core-ring { animation: core-ring 2.5s ease-out infinite; }
`

/* ── Visual flow diagram nodes ── */
const DIAGRAM_NODES = [
    { id: 'oracle', label: 'Stork Oracle', sub: 'Live FX + Yield Prices', icon: TrendingUp, color: '#3B82F6', col: 0 },
    { id: 'stablefx', label: 'StableFX', sub: 'USDC ↔ EURC Quotes', icon: RefreshCw, color: '#8B5CF6', col: 0 },
    { id: 'agent', label: 'AI Agent', sub: 'Local LLM (Phi-3)', icon: Brain, color: '#F97316', col: 1, hero: true },
    { id: 'vault', label: 'Treasury Vault', sub: 'Solidity on Arc', icon: Lock, color: '#22C55E', col: 2 },
    { id: 'cctp', label: 'CCTP V2 Bridge', sub: 'Cross-chain Burns', icon: Globe, color: '#06B6D4', col: 2 },
]

/* ── "How it works" — plain English, 3 simple steps ── */
const SIMPLE_STEPS = [
    { emoji: '👀', title: 'Watch', desc: 'The agent monitors live FX rates, yield data, and your treasury balances every 30 seconds.' },
    { emoji: '🧠', title: 'Think', desc: 'AI analyzes the data, scores risk, and picks the best move — swap currencies, earn yield, or save for upcoming payments.' },
    { emoji: '⚡', title: 'Act', desc: 'It executes the trade on-chain automatically, logs a receipt, and updates your dashboard in real-time.' },
]

/* ── Expandable deep-dive sections ── */
function Expandable({ title, icon: Icon, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[var(--color-surface)] hover:bg-[var(--color-bg-secondary)] transition-colors text-left"
            >
                <div className="flex items-center gap-2.5">
                    <Icon className="w-4.5 h-4.5 text-[var(--color-accent)]" />
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</span>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 py-4 border-t border-[var(--color-border-light)]">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ── Animated flowing arrow connector ── */
function FlowArrow({ vertical = false }) {
    return vertical ? (
        <div className="flex flex-col items-center py-1 gap-0.5">
            {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] arch-flow-down" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
        </div>
    ) : (
        <div className="hidden md:flex items-center justify-center px-1 gap-0.5">
            {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] arch-flow-right" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
        </div>
    )
}

export default function Architecture() {
    const [tick, setTick] = useState(0)
    useEffect(() => { const t = setInterval(() => setTick(v => v + 1), 2000); return () => clearInterval(t) }, [])

    return (
        <div className="max-w-[1100px] mx-auto space-y-8">
            {/* Inject animation styles */}
            <style>{ANIM_STYLES}</style>

            {/* ═══════ HEADER ═══════ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">How ArcTreasury Works</h2>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="arch-status-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[0.6rem] font-semibold text-green-400 uppercase tracking-wider">System Live</span>
                    </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">An AI agent that manages your treasury autonomously — here's the full picture.</p>
            </motion.div>

            {/* ═══════ HERO: 3-STEP PLAIN ENGLISH ═══════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {SIMPLE_STEPS.map((step, i) => (
                    <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="relative flex flex-col items-center text-center px-6 py-6"
                    >
                        {/* Step number badge */}
                        <div className="absolute top-3 left-4 w-6 h-6 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                            <span className="text-[0.6rem] font-bold font-mono text-[var(--color-accent)]">{i + 1}</span>
                        </div>
                        <span className="text-3xl mb-3 arch-float" style={{ animationDelay: `${i * 0.6}s` }}>{step.emoji}</span>
                        <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-1.5">{step.title}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
                        {/* Connector arrow (between cards) */}
                        {i < 2 && (
                            <div className="hidden md:block absolute right-[-12px] top-1/2 -translate-y-1/2 z-10">
                                <ArrowRight className="w-5 h-5 text-[var(--color-accent)] opacity-40" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* ═══════ VISUAL FLOW DIAGRAM ═══════ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="card-flat !p-6"
            >
                <h3 className="font-heading text-base font-semibold mb-5 text-center text-[var(--color-text-primary)]">System Flow</h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
                    {/* Left: Data Sources */}
                    <div className="flex flex-col gap-3 items-center md:items-end">
                        {[DIAGRAM_NODES[0], DIAGRAM_NODES[1]].map(n => (
                            <motion.div
                                key={n.id}
                                whileHover={{ scale: 1.03 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] w-52"
                                style={{ borderLeftWidth: 3, borderLeftColor: n.color }}
                            >
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${n.color}15` }}>
                                    <n.icon className="w-4.5 h-4.5" style={{ color: n.color }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">{n.label}</p>
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)]">{n.sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <FlowArrow />

                    {/* Center: AI Agent (hero node) */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative px-6 py-5 rounded-2xl border-2 border-[var(--color-accent)]/50 bg-[var(--color-surface)] text-center w-56 arch-pulse-glow"
                    >
                        {/* Expanding ring */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-[var(--color-accent)]/20 arch-core-ring pointer-events-none" />
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] text-[0.55rem] font-bold text-white uppercase tracking-wider">
                            Core
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-2">
                            <Brain className="w-6 h-6 text-[var(--color-accent)] arch-rotate" style={{ animationDuration: '12s' }} />
                        </div>
                        <p className="text-base font-bold text-[var(--color-text-primary)]">AI Agent</p>
                        <p className="text-[0.65rem] text-[var(--color-text-muted)] mt-0.5">Local LLM (Phi-3)</p>
                        <div className="flex justify-center gap-1.5 mt-2.5">
                            {['Analyze', 'Decide', 'Execute'].map((tag, i) => (
                                <motion.span
                                    key={tag}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
                                    className="px-2 py-0.5 rounded-full text-[0.55rem] font-medium bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                                >{tag}</motion.span>
                            ))}
                        </div>
                    </motion.div>

                    <FlowArrow />

                    {/* Right: On-chain */}
                    <div className="flex flex-col gap-3 items-center md:items-start">
                        {[DIAGRAM_NODES[3], DIAGRAM_NODES[4]].map(n => (
                            <motion.div
                                key={n.id}
                                whileHover={{ scale: 1.03 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] w-52"
                                style={{ borderLeftWidth: 3, borderLeftColor: n.color }}
                            >
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${n.color}15` }}>
                                    <n.icon className="w-4.5 h-4.5" style={{ color: n.color }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">{n.label}</p>
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)]">{n.sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Dashboard connection below */}
                <div className="flex flex-col items-center mt-4">
                    <div className="flex flex-col items-center gap-1 h-8">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] arch-flow-down" style={{ animationDelay: `${i * 0.3}s` }} />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                        <BarChart3 className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">React Dashboard</span>
                        <span className="flex items-center gap-1">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="arch-status-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </span>
                            <span className="text-[0.6rem] text-[var(--color-text-muted)]">WebSocket live</span>
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* ═══════ DEEP DIVES (Collapsible) ═══════ */}
            <div className="space-y-3">
                <h3 className="font-heading text-lg font-semibold text-[var(--color-text-primary)] mb-1">Deep Dive</h3>

                {/* Agent Decision Cycle */}
                <Expandable title="Agent Decision Cycle (every 30 seconds)" icon={RefreshCw} defaultOpen>
                    <div className="space-y-3">
                        {[
                            { step: '1', label: 'Ingest', desc: 'Read live FX rates from Stork Oracle + on-chain balances from Treasury vault', color: '#3B82F6' },
                            { step: '2', label: 'Analyze', desc: 'Feed treasury state, rates, and pending obligations to local AI engine', color: '#8B5CF6' },
                            { step: '3', label: 'Validate', desc: 'Check risk thresholds — max trade size, liquidity buffer, VaR limits, collateral ratios', color: '#F59E0B' },
                            { step: '4', label: 'Execute', desc: 'Send on-chain tx — StableFX swap, USYC deposit/withdraw, or CCTP bridge burn', color: '#F97316' },
                            { step: '5', label: 'Report', desc: 'Log receipt, broadcast via WebSocket, update risk score, queue next cycle', color: '#22C55E' },
                        ].map((s, i) => (
                            <motion.div
                                key={s.step}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2.5, delay: i * 0.5, repeat: Infinity }}
                                className="flex items-start gap-3"
                            >
                                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: s.color }}>
                                    {s.step}
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">{s.label}</span>
                                    <span className="text-sm text-[var(--color-text-secondary)]"> — {s.desc}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Expandable>
                {/* Smart Contracts */}
                <Expandable title="Smart Contract Functions (10 functions, 3 access levels)" icon={Lock}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Function</th>
                                    <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Who</th>
                                    <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">What it does</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { fn: 'executeStableFXSwap()', who: 'Agent', what: 'Swaps USDC → EURC via StableFX router' },
                                    { fn: 'depositYield()', who: 'Agent', what: 'Parks idle USDC in USYC T-Bill vault' },
                                    { fn: 'withdrawYield()', who: 'Agent', what: 'Pulls USDC from USYC to fund payments' },
                                    { fn: 'createEscrow()', who: 'Agent', what: 'Locks funds with conditional release' },
                                    { fn: 'releaseEscrow()', who: 'Agent', what: 'Releases escrow when conditions are met' },
                                    { fn: 'createVesting()', who: 'Owner', what: 'Sets up linear vesting schedule' },
                                    { fn: 'claimVested()', who: 'Beneficiary', what: 'Claims unlocked vested funds' },
                                    { fn: 'batchPayout()', who: 'Agent', what: 'Sends tokens to multiple recipients in one tx' },
                                    { fn: 'setAgent()', who: 'Owner', what: 'Changes the authorized AI wallet address' },
                                    { fn: 'pause()', who: 'Owner', what: 'Emergency stop for all operations' },
                                ].map((f, i) => (
                                    <tr key={f.fn} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                        <td className="py-2 px-3 font-mono text-xs text-[var(--color-accent)]">{f.fn}</td>
                                        <td className="py-2 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold ${
                                                f.who === 'Agent' ? 'bg-blue-500/15 text-blue-400' :
                                                f.who === 'Owner' ? 'bg-red-500/15 text-red-400' :
                                                'bg-purple-500/15 text-purple-400'
                                            }`}>{f.who}</span>
                                        </td>
                                        <td className="py-2 px-3 text-xs text-[var(--color-text-secondary)]">{f.what}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Expandable>

                {/* Integrations */}
                <Expandable title="External Integrations (6 services)" icon={Globe}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { icon: TrendingUp, name: 'Stork Oracle', what: 'Real-time WebSocket + REST price feeds', live: true },
                            { icon: RefreshCw, name: 'StableFX', what: 'On-chain USDC↔EURC at optimal rates', live: true },
                            { icon: Database, name: 'USYC (Hashnote)', what: 'Tokenized T-Bill vault ~4.5% APY', live: true },
                            { icon: Globe, name: 'Circle CCTP V2', what: 'Cross-chain burn→attest→mint bridge', live: true },
                            { icon: Brain, name: 'Local LLM (Phi-3)', what: 'AI decision engine with confidence scores', live: true },
                            { icon: Zap, name: 'Circle CPN', what: 'Instant cross-border nanopayments', live: false },
                        ].map(s => (
                            <div key={s.name} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-bg-secondary)]">
                                <s.icon className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{s.name}</p>
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)] truncate">{s.what}</p>
                                </div>
                                <span className="relative flex h-2.5 w-2.5">
                                    {s.live && <span className="arch-status-pulse absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: s.live ? '#4ade80' : '#facc15' }}></span>}
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: s.live ? '#22c55e' : '#eab308' }}></span>
                                </span>
                            </div>
                        ))}
                    </div>
                </Expandable>

                {/* Security */}
                <Expandable title="Security Model" icon={ShieldCheck}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Role-Based Access', desc: 'Only the registered agent wallet can execute trades. Owner controls agent assignment. Beneficiaries can only claim their own vestings.' },
                            { title: 'Pausable', desc: 'Owner can pause all vault operations instantly in an emergency — no trades execute while paused.' },
                            { title: 'MetaMask Gating', desc: 'Dashboard requires real MetaMask connection. Listens for accountsChanged and auto-disconnects if wallet is locked.' },
                            { title: 'Env-Only Secrets', desc: 'All API keys and private keys loaded from .env files at runtime. Never committed to git. __pycache__ excluded from repo.' },
                        ].map(s => (
                            <div key={s.title} className="flex gap-3">
                                <ShieldCheck className="w-4 h-4 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{s.title}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Expandable>
            </div>

            {/* ═══════ TECH STACK PILLS ═══════ */}
            <div>
                <h3 className="font-heading text-base font-semibold mb-3 text-[var(--color-text-primary)]">Built With</h3>
                <div className="flex flex-wrap gap-2">
                    {['Solidity', 'Python', 'FastAPI', 'React', 'Vite', 'Ollama AI', 'Stork Oracle', 'StableFX', 'USYC', 'CCTP V2', 'Circle CPN', 'Arc Testnet', 'ethers.js', 'web3.py', 'Framer Motion', 'Recharts'].map((t, i) => (
                        <motion.span
                            key={t}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.02 * i }}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors cursor-default"
                        >
                            {t}
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* ═══════ DEPLOYED CONTRACTS ═══════ */}
            <div className="card-flat bg-[var(--color-bg-secondary)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-heading text-base font-semibold mb-1">Deployed on Arc Testnet</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                            <span className="text-[0.65rem] font-mono text-[var(--color-text-muted)]">Treasury: 0x624b...dd44</span>
                            <span className="text-[0.65rem] font-mono text-[var(--color-text-muted)]">USDC: 0xe91e...Add6</span>
                            <span className="text-[0.65rem] font-mono text-[var(--color-text-muted)]">EURC: 0x7B70...E23</span>
                            <span className="text-[0.65rem] font-mono text-[var(--color-text-muted)]">USYC: 0x17ae...E90</span>
                        </div>
                    </div>
                    <a href="https://testnet.arcscan.app/" target="_blank" rel="noopener noreferrer" className="neon-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-xs font-semibold whitespace-nowrap">
                        View on ArcScan <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </div>
    )
}
