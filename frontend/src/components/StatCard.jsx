import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function StatCard({ label, value, sub, icon: Icon, color = 'var(--color-accent)', delay = 0 }) {
    // We add a brief flash effect when value changes
    const [flash, setFlash] = useState(false)

    useEffect(() => {
        setFlash(true)
        const t = setTimeout(() => setFlash(false), 300)
        return () => clearTimeout(t)
    }, [value])

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            whileHover={{ y: -2 }}
            style={{
                boxShadow: flash ? `0 0 15px ${color}33` : undefined,
                borderColor: flash ? `${color}66` : undefined,
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
            }}
        >
            <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">{label}</p>
                {Icon && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300" style={{ background: flash ? `${color}33` : `${color}14` }}>
                        <Icon className="w-4 h-4 transition-colors duration-300" style={{ color }} />
                    </div>
                )}
            </div>
            <p className="font-mono text-2xl font-semibold text-[var(--color-text-primary)] leading-none mb-1 transition-colors duration-300" style={{ color: flash ? color : undefined }}>{value}</p>
            {sub && <p className="text-xs text-[var(--color-text-muted)]">{sub}</p>}
        </motion.div>
    )
}

