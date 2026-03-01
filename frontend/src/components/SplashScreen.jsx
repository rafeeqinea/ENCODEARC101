import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import ArcLogo from './ArcLogo'

const STATUS_ITEMS = [
    { loading: 'Connecting to Arc Testnet...', done: 'Connected', delay: 1.5 },
    { loading: 'Loading StableFX rates...', done: 'Live', delay: 1.9 },
    { loading: 'Initializing AI Agent...', done: 'Active', delay: 2.3 },
]

function TypewriterText({ text, startDelay = 0 }) {
    const [displayed, setDisplayed] = useState('')
    useEffect(() => {
        let i = 0
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                if (i < text.length) {
                    setDisplayed(text.slice(0, i + 1))
                    i++
                } else clearInterval(interval)
            }, 35)
            return () => clearInterval(interval)
        }, startDelay * 1000)
        return () => clearTimeout(timer)
    }, [text, startDelay])
    return <span>{displayed}<span className="animate-pulse">|</span></span>
}

function StatusLine({ loading, done, delay }) {
    const [complete, setComplete] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setComplete(true), delay * 1000 + 300)
        return () => clearTimeout(t)
    }, [delay])

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.3 }}
            className="flex items-center gap-2 text-sm font-mono"
        >
            {complete ? (
                <span className="text-[#22C55E]" style={{ textShadow: '0 0 8px rgba(34,197,94,0.5)' }}>
                    <Check className="w-3.5 h-3.5 inline mr-1" />
                    {done}
                </span>
            ) : (
                <span className="text-[#6B7280]">
                    <Loader2 className="w-3.5 h-3.5 inline mr-1 animate-spin" />
                    {loading}
                </span>
            )}
        </motion.div>
    )
}

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 z-[100] bg-[#0F0F0F] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col items-center gap-4"
                >
                    <ArcLogo size={80} />
                    <h1 className="text-4xl font-bold text-white font-heading mt-2" style={{ textShadow: '0 0 20px rgba(249,115,22,0.3)' }}>
                        ArcTreasury
                    </h1>
                </motion.div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-[#9CA3AF] font-mono"
                >
                    <TypewriterText text="AI-Powered Autonomous Treasury Agent" startDelay={0.8} />
                </motion.p>

                {/* Power line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.2, duration: 0.4, ease: 'easeOut' }}
                    className="w-64 h-[1px] origin-center"
                    style={{ background: '#F97316', boxShadow: '0 0 10px rgba(249,115,22,0.5)' }}
                />

                {/* Status lines */}
                <div className="flex flex-col gap-2">
                    {STATUS_ITEMS.map((item) => (
                        <StatusLine key={item.loading} {...item} />
                    ))}
                </div>
            </div>
        </div>
    )
}
