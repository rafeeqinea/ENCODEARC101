import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import ActivityTicker from '../components/ActivityTicker'
import FloatingParticles from '../components/FloatingParticles'
import ChatWidget from '../components/ChatWidget'
import { useTreasury } from '../hooks/useTreasury'
import { useWebSocket } from '../hooks/useWebSocket'
import { useDarkMode } from '../hooks/useDarkMode'

export default function DashboardLayout() {
    const treasury = useTreasury()
    const ws = useWebSocket()
    const location = useLocation()
    const { isDark, toggle: toggleDark } = useDarkMode()

    return (
        <div className="flex min-h-screen bg-[var(--color-bg-primary)] transition-colors duration-200 relative overflow-hidden">
            {/* ── Ambient background ── */}
            {/* Blurred orbs — same vibe as landing, very subtle */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[var(--color-accent)] opacity-[0.025] blur-[140px]" />
                <div className="absolute bottom-[-20%] left-[-8%] w-[50%] h-[50%] rounded-full bg-[#8B5CF6] opacity-[0.02] blur-[140px]" />
                <div className="absolute top-[40%] left-[50%] w-[35%] h-[35%] rounded-full bg-[var(--color-success)] opacity-[0.015] blur-[120px]" />
                {/* Subtle dot grid overlay */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle, var(--color-text-muted) 0.5px, transparent 0.5px)`,
                    backgroundSize: '32px 32px',
                    opacity: 0.04
                }} />
            </div>

            {/* Dark mode particles */}
            {isDark && <FloatingParticles />}

            <Sidebar agentStatus={treasury.agent.data} isDemo={treasury.isDemo} isDark={isDark} />
            <div className="flex-1 ml-[260px] flex flex-col min-w-0 relative z-[1]">
                <TopBar isDemo={treasury.isDemo} connected={ws.connected} isDark={isDark} onToggleDark={toggleDark} />
                <main className="flex-1 p-6 overflow-x-hidden">
                    {/* Activity Ticker */}
                    <ActivityTicker decisions={treasury.decisions.data || []} />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            <Outlet context={{ ...treasury, isDark }} />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            <ChatWidget />
        </div>
    )
}
