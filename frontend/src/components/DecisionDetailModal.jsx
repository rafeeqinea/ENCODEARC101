import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, ArrowLeftRight, CreditCard, Minus, Brain, Shield, BarChart3, Wallet, ExternalLink, Zap } from 'lucide-react'
import { formatCurrency, formatTimestamp, truncateHash } from '../lib/formatters'

const ACTION_CONFIG = {
    YIELD_DEPOSIT: { icon: TrendingUp, color: 'var(--color-success)', label: 'Yield Deposit', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
    YIELD_WITHDRAW: { icon: TrendingDown, color: 'var(--color-warning)', label: 'Yield Withdraw', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)' },
    FX_SWAP: { icon: ArrowLeftRight, color: 'var(--color-info)', label: 'FX Swap', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.2)' },
    PAYOUT: { icon: CreditCard, color: 'var(--color-danger)', label: 'Payout', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.2)' },
    HOLD: { icon: Minus, color: 'var(--color-text-muted)', label: 'Hold', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' },
}

function ConfidenceBar({ value }) {
    const pct = Math.round((value || 0) * 100)
    const color = pct >= 85 ? 'var(--color-success)' : pct >= 65 ? 'var(--color-warning)' : 'var(--color-danger)'
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider">Confidence</span>
                <span className="font-mono text-sm font-bold" style={{ color }}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden border border-[var(--color-border-light)]">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
            </div>
        </div>
    )
}

function RiskGauge({ score, level }) {
    const color = score < 20 ? 'var(--color-success)' : score < 50 ? 'var(--color-warning)' : 'var(--color-danger)'
    return (
        <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ borderColor: color, background: `${color}10` }}>
                <span className="font-mono text-sm font-bold" style={{ color }}>{score}</span>
            </div>
            <div>
                <p className="text-xs font-semibold capitalize" style={{ color }}>{level} Risk</p>
                <p className="text-[0.65rem] text-[var(--color-text-muted)]">Score at decision time</p>
            </div>
        </div>
    )
}

function ForecastBadge({ forecast }) {
    if (!forecast) return null
    const dirColor = forecast.direction === 'up' ? 'var(--color-danger)' : forecast.direction === 'down' ? 'var(--color-success)' : 'var(--color-text-muted)'
    const arrow = forecast.direction === 'up' ? '\u2191' : forecast.direction === 'down' ? '\u2193' : '\u2194'
    return (
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ borderColor: dirColor, background: `${dirColor}10` }}>
                <span className="text-lg" style={{ color: dirColor }}>{arrow}</span>
            </div>
            <div>
                <p className="text-xs font-semibold" style={{ color: dirColor }}>
                    EURC/USDC {forecast.direction === 'up' ? 'Weakening' : forecast.direction === 'down' ? 'Strengthening' : 'Stable'}
                </p>
                <p className="text-[0.65rem] text-[var(--color-text-muted)] font-mono">
                    {forecast.change_pct > 0 ? '+' : ''}{forecast.change_pct?.toFixed(3)}% predicted | R\u00b2 {forecast.r_squared || 'N/A'}
                </p>
            </div>
        </div>
    )
}

export default function DecisionDetailModal({ decision, open, onClose }) {
    if (!decision) return null
    const config = ACTION_CONFIG[decision.action] || ACTION_CONFIG.HOLD
    const Icon = config.icon
    const snap = decision.snapshot || {}
    const bal = snap.balances || {}
    const forecast = snap.forecast || {}
    const risk = snap.risk || {}
    const rec = snap.recommendation || {}

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                >
                    {/* Blurred backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal content */}
                    <motion.div
                        className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl hidden-scrollbar"
                        initial={{ opacity: 0, scale: 0.92, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 30 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border-light)] px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
                                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                                </div>
                                <div>
                                    <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">{config.label}</h2>
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)] font-mono">{decision.id} &middot; {formatTimestamp(decision.timestamp)}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors">
                                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            {/* Amount + Token */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Amount</p>
                                    <p className="font-mono text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(decision.amount)}</p>
                                </div>
                                <div className="flex-1 p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Token Pair</p>
                                    <p className="font-mono text-lg font-semibold text-[var(--color-text-primary)]">{decision.token || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Confidence bar */}
                            <ConfidenceBar value={decision.confidence} />

                            {/* AI Reasoning */}
                            <div className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-4 h-4 text-[var(--color-accent)]" />
                                    <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                                        {snap.balance_source === 'seed' ? 'Agent' : 'AI'} Reasoning
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    {decision.reason}
                                </p>
                            </div>

                            {/* Forecast + Risk row */}
                            {(forecast.direction || risk.score !== undefined) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Forecast */}
                                    <div className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <BarChart3 className="w-4 h-4 text-[var(--color-info)]" />
                                            <span className="text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">ML Forecast</span>
                                        </div>
                                        <ForecastBadge forecast={forecast} />
                                        {rec.action && (
                                            <div className="mt-3 pt-3 border-t border-[var(--color-border-light)]">
                                                <p className="text-[0.65rem] text-[var(--color-text-muted)]">
                                                    Recommendation: <span className="font-mono font-semibold text-[var(--color-text-primary)]">{rec.action}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Risk */}
                                    <div className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Shield className="w-4 h-4 text-[var(--color-warning)]" />
                                            <span className="text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Risk Assessment</span>
                                        </div>
                                        <RiskGauge score={risk.score || 0} level={risk.level || 'low'} />
                                        {risk.var && (
                                            <div className="mt-3 pt-3 border-t border-[var(--color-border-light)] flex justify-between">
                                                <span className="text-[0.65rem] text-[var(--color-text-muted)]">VaR (95%)</span>
                                                <span className="font-mono text-xs font-semibold">{formatCurrency(risk.var.var_95 || 0)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Treasury Snapshot */}
                            {bal.usdc !== undefined && (
                                <div className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Wallet className="w-4 h-4 text-[var(--color-text-muted)]" />
                                        <span className="text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Treasury at Decision Time</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <p className="text-[0.65rem] text-[var(--color-text-muted)]">USDC</p>
                                            <p className="font-mono text-sm font-semibold">{formatCurrency(bal.usdc)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[0.65rem] text-[var(--color-text-muted)]">EURC</p>
                                            <p className="font-mono text-sm font-semibold">{formatCurrency(bal.eurc, 2, 'EUR')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[0.65rem] text-[var(--color-text-muted)]">USYC</p>
                                            <p className="font-mono text-sm font-semibold">{formatCurrency(bal.usyc)}</p>
                                        </div>
                                    </div>
                                    {snap.fx_rate && (
                                        <div className="mt-3 pt-3 border-t border-[var(--color-border-light)] flex justify-between">
                                            <span className="text-[0.65rem] text-[var(--color-text-muted)]">EURC/USDC Rate</span>
                                            <span className="font-mono text-xs font-semibold">{snap.fx_rate.toFixed(4)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Transaction */}
                            {decision.tx_hash && (
                                <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
                                    <div>
                                        <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Transaction Hash</p>
                                        <p className="font-mono text-xs text-[var(--color-text-secondary)]">{decision.tx_hash}</p>
                                    </div>
                                    <a
                                        href={`https://testnet.arcscan.app/tx/${decision.tx_hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" /> View on ArcScan
                                    </a>
                                </div>
                            )}

                            {/* Source badge */}
                            <div className="flex items-center justify-center gap-2 pt-2">
                                <Zap className="w-3 h-3 text-[var(--color-accent)]" />
                                <span className="text-[0.6rem] text-[var(--color-text-muted)]">
                                    Powered by {decision.metadata?.source === 'ai-agent-v1' ? 'Local LLM' : 'ArcTreasury Agent'} on Arc Testnet
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
