import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import ActivityTicker from '../components/ActivityTicker'
import FloatingParticles from '../components/FloatingParticles'
import { useTreasury } from '../hooks/useTreasury'
import { useWebSocket } from '../hooks/useWebSocket'
import { useDarkMode } from '../hooks/useDarkMode'

export default function DashboardLayout() {
    const treasury = useTreasury()
    const ws = useWebSocket()
    const location = useLocation()
    const { isDark, toggle: toggleDark } = useDarkMode()

    return (
        <div className="flex min-h-screen bg-[var(--color-bg-primary)] transition-colors duration-200">
            {/* Dark mode particles */}
            {isDark && <FloatingParticles />}

            <Sidebar agentStatus={treasury.agent.data} isDemo={treasury.isDemo} isDark={isDark} />
            <div className="flex-1 ml-[260px] flex flex-col min-w-0">
                <TopBar isDemo={treasury.isDemo} connected={ws.connected} isDark={isDark} onToggleDark={toggleDark} />
                <main className="flex-1 p-6 overflow-x-hidden">
                    {/* Activity Ticker */}
                    <ActivityTicker decisions={treasury.decisions.data || []} />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Outlet context={{ ...treasury, isDark }} />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}
