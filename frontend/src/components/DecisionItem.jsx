import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ArrowLeftRight, CreditCard, Minus } from 'lucide-react'
import { formatCurrency, formatTimestamp, truncateHash } from '../lib/formatters'

const ACTION_CONFIG = {
    YIELD_DEPOSIT: { icon: TrendingUp, color: 'var(--color-success)', label: 'Yield Deposit', glow: 'rgba(34,197,94,0.3)' },
    YIELD_WITHDRAW: { icon: TrendingDown, color: 'var(--color-warning)', label: 'Yield Withdraw', glow: 'rgba(249,115,22,0.3)' },
    FX_SWAP: { icon: ArrowLeftRight, color: 'var(--color-info)', label: 'FX Swap', glow: 'rgba(37,99,235,0.3)' },
    PAYOUT: { icon: CreditCard, color: 'var(--color-danger)', label: 'Payout', glow: 'rgba(220,38,38,0.3)' },
    HOLD: { icon: Minus, color: 'var(--color-text-muted)', label: 'Hold', glow: 'transparent' },
}

export default function DecisionItem({ decision, index = 0, compact = false }) {
    const config = ACTION_CONFIG[decision.action] || ACTION_CONFIG.HOLD
    const Icon = config.icon

    return (
        <motion.div
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
        >
            <div
                className="glow-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${config.color}14`, '--glow-color': config.glow }}
            >
                <Icon className="w-4 h-4" style={{ color: config.color }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold" style={{ color: config.color }}>{config.label}</span>
                    <span className="font-mono text-xs text-[var(--color-text-primary)] font-medium">{formatCurrency(decision.amount)}</span>
                    {!compact && decision.confidence && (
                        <span className="text-[0.65rem] text-[var(--color-text-muted)]">
                            {(decision.confidence * 100).toFixed(0)}% conf
                        </span>
                    )}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed truncate">{decision.reason}</p>
                {!compact && (
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[0.65rem] text-[var(--color-text-muted)]">{formatTimestamp(decision.timestamp)}</span>
                        {decision.tx_hash && (
                            <span className="font-mono text-[0.65rem] text-[var(--color-text-muted)]">{truncateHash(decision.tx_hash)}</span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
