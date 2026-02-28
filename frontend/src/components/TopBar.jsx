import { useLocation } from 'react-router-dom'
import { Signal, SignalZero, Sun, Moon, Fuel } from 'lucide-react'
import { motion } from 'framer-motion'
import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const PAGE_TITLES = {
    '/': 'Dashboard',
    '/agent': 'Agent',
    '/fx': 'FX Monitor',
    '/yield': 'Yield',
    '/obligations': 'Obligations',
    '/architecture': 'Architecture',
}

export default React.memo(function TopBar({ isDemo, connected, isDark, onToggleDark }) {
    const { pathname } = useLocation()
    const title = PAGE_TITLES[pathname] || 'ArcTreasury'
    const [wallet, setWallet] = useState(null)

    useEffect(() => {
        async function fetchWallet() {
            try {
                const data = await api.getWallet()
                setWallet(data)
            } catch { /* ignore */ }
        }
        fetchWallet()
        const timer = setInterval(fetchWallet, 30000)
        return () => clearInterval(timer)
    }, [])

    const gasColor = wallet?.balance_usdc > 10 ? 'var(--color-success)' : wallet?.balance_usdc > 5 ? 'var(--color-warning)' : 'var(--color-danger)'

    return (
        <header className="h-14 border-b border-[var(--color-border-light)] bg-[var(--color-surface)]/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-200">
            <div className="flex items-center gap-3">
                <h2 className="font-heading text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
            </div>
            <div className="flex items-center gap-3">
                {isDemo && (
                    <span className="badge badge-warning text-[0.7rem] flex items-center gap-1">
                        <SignalZero className="w-3 h-3" />
                        Demo Mode
                    </span>
                )}

                {/* Gas pill */}
                {wallet && (
                    <span className="flex items-center gap-1 text-[0.65rem] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]" style={{ color: gasColor }}>
                        <Fuel className="w-3 h-3" />
                        {wallet.balance_usdc?.toFixed(2)} USDC
                    </span>
                )}

                <span className={`flex items-center gap-1.5 text-[0.7rem] ${connected && !isDemo ? 'text-[var(--color-success)] live-glow' : isDemo ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                    <Signal className="w-3.5 h-3.5" />
                    {connected && !isDemo ? 'Live' : isDemo ? 'Demo' : 'Offline'}
                </span>
                {/* Dark mode toggle */}
                <button
                    onClick={onToggleDark}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors btn-press"
                    aria-label="Toggle dark mode"
                >
                    <motion.div
                        key={isDark ? 'moon' : 'sun'}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        {isDark
                            ? <Sun className="w-4 h-4 text-[var(--color-accent)]" />
                            : <Moon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        }
                    </motion.div>
                </button>
            </div>
        </header>
    )
})
