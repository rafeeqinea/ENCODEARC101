import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Bot, ArrowLeftRight, TrendingUp, ClipboardList, Boxes, Zap, Fuel } from 'lucide-react'
import { motion } from 'framer-motion'
import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import ArcLogo from './ArcLogo'

const NAV_ITEMS = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/agent', icon: Bot, label: 'Agent' },
    { to: '/fx', icon: ArrowLeftRight, label: 'FX Monitor' },
    { to: '/yield', icon: TrendingUp, label: 'Yield' },
    { to: '/obligations', icon: ClipboardList, label: 'Obligations' },
    { to: '/architecture', icon: Boxes, label: 'Architecture' },
]

export default React.memo(function Sidebar({ agentStatus, isDemo }) {
    const location = useLocation()
    const [wallet, setWallet] = useState(null)

    // Fetch wallet balance
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
        <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)] flex flex-col z-50 transition-colors duration-200 overflow-y-auto hidden-scrollbar">
            {/* Logo */}
            <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                    <ArcLogo size={40} />
                    <div>
                        <span className="font-heading text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
                            ArcTreasury
                        </span>
                        <p className="text-[0.65rem] text-[var(--color-text-muted)] leading-tight">AI-Powered Treasury Agent</p>
                    </div>
                </div>
            </div>

            <div className="mx-5 border-t border-[var(--color-border-light)]" />

            {/* Navigation with animated indicator */}
            <nav className="flex-1 px-3 py-3">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                    const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
                    return (
                        <NavLink
                            key={to}
                            to={to}
                            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-[0.8125rem] font-medium transition-all duration-150 nav-item ${isActive
                                ? 'sidebar-active bg-[var(--color-bg-secondary)] text-[var(--color-accent)]'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-indicator"
                                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[var(--color-accent)]"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}
                            <Icon className="w-[18px] h-[18px] nav-icon" />
                            {label}
                        </NavLink>
                    )
                })}
            </nav>

            {/* Agent Status with Heartbeat */}
            <div className="mx-5 border-t border-[var(--color-border-light)]" />
            <div className="px-5 py-2.5">
                <p className="text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Agent Status</p>
                <div className="flex items-center gap-2 mb-1">
                    <div className="relative w-2.5 h-2.5">
                        <span className="absolute inset-0 rounded-full bg-[var(--color-success)] agent-heartbeat" />
                        <span className="absolute inset-0 rounded-full agent-sonar" />
                    </div>
                    <span className="text-xs font-medium text-[var(--color-text-primary)]">
                        {agentStatus?.status === 'active' ? 'Active' : 'Idle'}
                    </span>
                    {isDemo && <span className="badge badge-warning text-[0.6rem]">Demo</span>}
                </div>
                <p className="text-[0.65rem] text-[var(--color-text-muted)]">
                    Decisions: <span className="font-mono font-medium">{agentStatus?.total_decisions ?? 0}</span>
                </p>
                <p className="text-[0.65rem] text-[var(--color-text-muted)]">
                    Cycle: <span className="font-mono font-medium">{agentStatus?.cycle_interval ?? 30}s</span>
                </p>
            </div>

            {/* Wallet */}
            {wallet && (
                <>
                    <div className="mx-5 border-t border-[var(--color-border-light)]" />
                    <div className="px-5 py-2.5">
                        <p className="text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Wallet</p>
                        <p className="text-[0.65rem] text-[var(--color-text-muted)] font-mono truncate">
                            ◉ {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                        </p>
                        <p className="text-[0.7rem] font-mono font-medium flex items-center gap-1" style={{ color: gasColor }}>
                            <Fuel className="w-3 h-3" />
                            {wallet.balance_usdc?.toFixed(3)} USDC
                        </p>
                    </div>
                </>
            )}

            {/* Network Info */}
            <div className="mx-5 border-t border-[var(--color-border-light)]" />
            <div className="px-5 py-2.5">
                <p className="text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Arc Testnet</p>
                <p className="text-[0.65rem] text-[var(--color-text-muted)] font-mono">Chain ID: 5042002</p>
            </div>

            {/* Footer */}
            <div className="mx-5 border-t border-[var(--color-border-light)]" />
            <div className="px-5 py-3">
                <p className="text-[0.6rem] text-[var(--color-text-muted)]">
                    Powered by <span className="font-semibold">Arc</span> · <span className="font-semibold">Circle</span>
                </p>
                <p className="text-[0.6rem] text-[var(--color-text-muted)]">Encode Hackathon 2026</p>
            </div>
        </aside>
    )
})
