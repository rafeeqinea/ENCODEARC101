import { useMemo } from 'react'

/**
 * Floating particles for dark mode only. Pure CSS animation, no canvas.
 */
export default function FloatingParticles({ count = 8 }) {
    const particles = useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: 1.5 + Math.random() * 1.5,
            delay: Math.random() * 8,
            duration: 15 + Math.random() * 10,
            drift: -20 + Math.random() * 40,
        })), [count])

    return (
        <div className="particles-container fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {particles.map((p) => (
                <span
                    key={p.id}
                    className="particle"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        '--drift': `${p.drift}px`,
                    }}
                />
            ))}
        </div>
    )
}
