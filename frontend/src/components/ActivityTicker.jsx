import { useMemo } from 'react'

const ICONS = { FX_SWAP: '⚡', YIELD_DEPOSIT: '📈', YIELD_WITHDRAW: '📉', PAYOUT: '💰', HOLD: '⏸' }

export default function ActivityTicker({ decisions = [] }) {
    const items = useMemo(() => {
        const recent = decisions.slice(0, 8)
        return recent.map((d) => {
            const icon = ICONS[d.action] || '⚡'
            const amt = d.amount ? `$${Number(d.amount).toLocaleString()}` : ''
            return `${icon} ${d.action?.replace('_', ' ')} ${amt} ${d.token || ''} — ${d.reason?.slice(0, 50) || ''}`.trim()
        })
    }, [decisions])

    if (!items.length) return null

    const content = items.join('   •   ')

    return (
        <div className="ticker-wrap overflow-hidden whitespace-nowrap text-[0.7rem] font-mono text-[var(--color-text-muted)] mb-4 opacity-60 hover:opacity-100 transition-opacity">
            <div className="ticker-content inline-block">
                <span className="ticker-text">{content}   •   </span>
                <span className="ticker-text">{content}   •   </span>
            </div>
        </div>
    )
}
