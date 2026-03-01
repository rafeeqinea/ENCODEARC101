import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ExternalLink, ShieldCheck, Database, Zap, Globe, Cpu, ArrowDown,
  Layers, Brain, Wallet, TrendingUp, RefreshCw, Lock, BarChart3, Bot
} from 'lucide-react'

const TECH_STACK = [
    { name: 'Solidity', desc: 'Smart Contracts on Arc', icon: Layers },
    { name: 'Python / FastAPI', desc: 'AI Agent Backend', icon: Cpu },
    { name: 'React / Vite', desc: 'Real-time Dashboard', icon: BarChart3 },
    { name: 'Gemini 2.5 Flash', desc: 'AI Decision Engine', icon: Brain },
    { name: 'Stork Oracle', desc: 'Real-time Price Feeds', icon: TrendingUp },
    { name: 'StableFX', desc: 'USDC↔EURC Swaps', icon: RefreshCw },
    { name: 'USYC (Hashnote)', desc: 'T-Bill Yield Vault', icon: Wallet },
    { name: 'Circle CCTP V2', desc: 'Cross-chain Bridge', icon: Globe },
    { name: 'Circle CPN', desc: 'Nanopayments', icon: Zap },
    { name: 'Arc Testnet', desc: 'Chain ID 5042002', icon: ShieldCheck },
]

const LAYERS = [
    {
        title: 'Presentation Layer',
        color: '#3B82F6',
        items: [
            { name: 'React Dashboard', desc: 'Real-time monitoring with WebSocket + REST polling' },
            { name: 'ArcBot AI Chat', desc: 'Gemini-powered conversational treasury assistant' },
            { name: 'Portfolio Viz', desc: 'Pie charts, area charts, risk gauges, tx history' },
        ],
    },
    {
        title: 'API Gateway',
        color: '#8B5CF6',
        items: [
            { name: 'FastAPI Server', desc: '20+ REST endpoints — balances, decisions, yield, FX, bridge, settings' },
            { name: 'WebSocket Feed', desc: 'Live decision stream to all connected clients' },
            { name: 'Receipt Engine', desc: 'Downloadable trade receipts with fee breakdown' },
        ],
    },
    {
        title: 'AI Agent Core',
        color: '#F97316',
        items: [
            { name: 'Decision Engine', desc: 'Gemini 2.5 Flash analyses market + balances → typed decisions' },
            { name: 'Strategy Module', desc: 'Risk scoring, VaR, collateral ratio, rebalance thresholds' },
            { name: 'Autonomous Loop', desc: '30s cycles: ingest → analyze → decide → execute → log' },
        ],
    },
    {
        title: 'Blockchain Layer',
        color: '#22C55E',
        items: [
            { name: 'ArcTreasury Vault', desc: 'Escrow, vesting, batch payouts, on-chain receipt logs' },
            { name: 'Stork Oracle', desc: 'WebSocket + REST price feeds for FX & yield data' },
            { name: 'CCTP V2 Bridge', desc: 'Cross-chain burn → attestation → mint for USDC transfers' },
        ],
    },
]

const FLOW_STEPS = [
    {
        num: '01', title: 'Market Data Ingestion',
        desc: 'Stork Oracle delivers real-time USDC/EURC rates and USYC yield via WebSocket streams and REST fallback. The agent also reads on-chain balances from the ArcTreasury vault.',
    },
    {
        num: '02', title: 'AI Analysis & Decision',
        desc: 'The Gemini 2.5 Flash model receives treasury state, market signals, and pending obligations. It outputs typed decisions (fx_swap, yield_deposit, yield_withdraw, rebalance, bridge) with confidence scores (0.55–0.95) and risk assessments.',
    },
    {
        num: '03', title: 'Risk Gate & Validation',
        desc: 'Strategy module validates each decision against risk thresholds: max single trade size, liquidity buffer requirements, VaR limits, and collateral ratios. High-risk decisions are flagged and require higher confidence.',
    },
    {
        num: '04', title: 'On-Chain Execution',
        desc: 'Approved decisions execute atomically via the ArcTreasury smart contract — StableFX swaps, USYC vault deposits/withdrawals, or CCTP V2 cross-chain burns. Each tx generates an on-chain receipt with fee breakdown.',
    },
    {
        num: '05', title: 'Post-Trade Settlement',
        desc: 'Agent updates internal state, logs the transaction, broadcasts the decision via WebSocket to all dashboard clients, recalculates risk score and collateral ratios, and queues the next cycle.',
    },
]

const CONTRACT_FUNCS = [
    { fn: 'executeStableFXSwap()', access: 'Agent', desc: 'Routes USDC to StableFX router for EURC conversion', security: true },
    { fn: 'depositYield()', access: 'Agent', desc: 'Deposits idle USDC into USYC T-Bill vault', security: true },
    { fn: 'withdrawYield()', access: 'Agent', desc: 'Redeems USYC for USDC to fund obligations', security: true },
    { fn: 'createEscrow()', access: 'Agent', desc: 'Creates conditional escrow with release conditions', security: true },
    { fn: 'releaseEscrow()', access: 'Agent', desc: 'Releases escrowed funds when conditions are met', security: true },
    { fn: 'createVesting()', access: 'Owner', desc: 'Sets up linear vesting schedule for beneficiary', security: true },
    { fn: 'claimVested()', access: 'Beneficiary', desc: 'Claims unlocked portion of vesting schedule', security: true },
    { fn: 'batchPayout()', access: 'Agent', desc: 'Executes multiple token transfers in one tx', security: true },
    { fn: 'setAgent()', access: 'Owner', desc: 'Updates the authorized AI agent wallet address', security: true },
    { fn: 'pause() / unpause()', access: 'Owner', desc: 'Emergency circuit breaker for all operations', security: true },
]

function ArchBox({ children, accent, className = '' }) {
    return (
        <div className={`relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all duration-200 hover:border-[var(--color-accent)]/40 ${className}`}>
            {accent && <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(ellipse at 30% 30%, rgba(249,115,22,0.06) 0%, transparent 70%)' }} />}
            <div className="relative">{children}</div>
        </div>
    )
}

function VerticalConnector() {
    return (
        <div className="flex justify-center py-1">
            <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-0.5"
            >
                <div className="w-px h-6" style={{ background: 'linear-gradient(to bottom, var(--color-accent), transparent)' }} />
                <ArrowDown className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            </motion.div>
        </div>
    )
}

export default function Architecture() {
    return (
        <div className="max-w-[1100px] mx-auto space-y-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-1">System Architecture</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">Complete technical breakdown of ArcTreasury's autonomous AI treasury management system</p>
            </motion.div>

            {/* === LAYERED ARCHITECTURE === */}
            <div>
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[var(--color-accent)]" />
                    Layered Architecture
                </h3>
                <div className="space-y-0">
                    {LAYERS.map((layer, li) => (
                        <div key={layer.title}>
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.08 * li }}
                                className="rounded-xl border border-[var(--color-border)] overflow-hidden"
                                style={{ borderLeftWidth: 3, borderLeftColor: layer.color }}
                            >
                                <div className="px-5 py-3 flex items-center gap-3" style={{ background: `${layer.color}08` }}>
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color, boxShadow: `0 0 8px ${layer.color}60` }} />
                                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{layer.title}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-[var(--color-border-light)]">
                                    {layer.items.map((item) => (
                                        <div key={item.name} className="px-5 py-3">
                                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.name}</p>
                                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            {li < LAYERS.length - 1 && <VerticalConnector />}
                        </div>
                    ))}
                </div>
            </div>

            {/* === DATA FLOW === */}
            <div>
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-[var(--color-accent)]" />
                    Agent Decision Flow (30s Cycle)
                </h3>
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[22px] top-6 bottom-6 w-px bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent)]/30 to-transparent hidden md:block" />
                    <div className="space-y-4">
                        {FLOW_STEPS.map((step, i) => (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex gap-4 items-start"
                            >
                                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-accent)]/40 flex items-center justify-center z-10">
                                    <span className="font-mono text-sm font-bold text-[var(--color-accent)]">{step.num}</span>
                                </div>
                                <div className="flex-1 card-flat !py-3 !px-4">
                                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{step.title}</h4>
                                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* === SMART CONTRACT MATRIX === */}
            <div>
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[var(--color-accent)]" />
                    Smart Contract Function Matrix
                </h3>
                <div className="card-flat overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Function</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Access</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Description</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase text-center">Secured</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CONTRACT_FUNCS.map((f, i) => (
                                <motion.tr
                                    key={f.fn}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.03 * i }}
                                    className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                                >
                                    <td className="py-2.5 px-3 font-mono text-sm text-[var(--color-accent)]">{f.fn}</td>
                                    <td className="py-2.5 px-3">
                                        <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold ${
                                            f.access === 'Agent' ? 'bg-blue-500/15 text-blue-400' :
                                            f.access === 'Owner' ? 'bg-red-500/15 text-red-400' :
                                            'bg-purple-500/15 text-purple-400'
                                        }`}>{f.access}</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-sm text-[var(--color-text-secondary)]">{f.desc}</td>
                                    <td className="py-2.5 px-3 text-center"><ShieldCheck className="w-4 h-4 text-[var(--color-success)] mx-auto" /></td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* === INTEGRATION MAP === */}
            <div>
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[var(--color-accent)]" />
                    Integration Map
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { icon: Database, title: 'USYC (Hashnote)', desc: 'Agent parks surplus capital in tokenized T-Bills for ~4.5% APY. Autonomous deposit/withdraw based on obligation schedule and liquidity needs.', status: 'Active' },
                        { icon: Zap, title: 'StableFX (Arc)', desc: 'On-chain USDC↔EURC swaps at Stork Oracle rates. Agent monitors rate bands and executes at optimal spread with 0.015% fee.', status: 'Active' },
                        { icon: Globe, title: 'Circle CCTP V2', desc: 'Cross-chain USDC transfers via burn→attestation→mint. Supports Arc ↔ Ethereum, Base, Arbitrum Sepolia testnets.', status: 'Active' },
                        { icon: Wallet, title: 'Circle CPN', desc: 'Instant cross-border nanopayments for micro-settlements. Registered wallet endpoints for EUR/USD payment streams.', status: 'Planned' },
                        { icon: Brain, title: 'Gemini 2.5 Flash', desc: 'AI decision engine processes treasury state + market signals. Returns typed decisions with confidence scores and risk rationale.', status: 'Active' },
                        { icon: TrendingUp, title: 'Stork Oracle', desc: 'Real-time WebSocket price feeds with REST fallback. Provides USDC/EURC FX rates and USYC yield data for AI analysis.', status: 'Active' },
                    ].map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.06 * i }}
                            className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <item.icon className="w-5 h-5 text-[var(--color-accent)]" />
                                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full ${
                                    item.status === 'Active' ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]'
                                }`}>{item.status}</span>
                            </div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{item.title}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* === TECH STACK === */}
            <div>
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[var(--color-accent)]" />
                    Tech Stack
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {TECH_STACK.map((t, i) => (
                        <motion.div
                            key={t.name}
                            className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all duration-200 group"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.04 * i }}
                        >
                            <t.icon className="w-4 h-4 text-[var(--color-accent)] mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* === DEPLOYED CONTRACTS === */}
            <div className="card-flat bg-[var(--color-bg-secondary)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-heading text-base font-semibold mb-1">Arc Testnet Contracts</h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">Verify deployed contracts on ArcScan — Chain ID 5042002</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                            <span className="text-[0.65rem] font-mono text-[var(--color-text-muted)]">Treasury: 0x624bfC2a...dd44</span>
                            <span className="text-[0.65rem] font-mono text-[var(--color-text-muted)]">USDC: 0xe91eEBa8...Add6</span>
                            <span className="text-[0.65rem] font-mono text-[var(--color-text-muted)]">EURC: 0x7B703236...E23</span>
                            <span className="text-[0.65rem] font-mono text-[var(--color-text-muted)]">USYC: 0x17ae4a69...E90</span>
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
