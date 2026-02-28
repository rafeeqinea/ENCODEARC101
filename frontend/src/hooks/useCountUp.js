import { useState, useEffect, useRef } from 'react'

/**
 * Animates a number counting up from 0 to target.
 * @param {number} target - Final value
 * @param {number} duration - Animation duration in ms (default 1500)
 * @param {number} decimals - Decimal places (default 2)
 * @returns {string} Current animated value as formatted string
 */
export function useCountUp(target, duration = 1500, decimals = 2) {
    const [value, setValue] = useState(0)
    const prevTarget = useRef(0)

    useEffect(() => {
        if (!target || target === prevTarget.current) return
        prevTarget.current = target
        const start = performance.now()
        const startVal = 0

        function step(now) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(startVal + (target - startVal) * eased)
            if (progress < 1) requestAnimationFrame(step)
        }

        requestAnimationFrame(step)
    }, [target, duration])

    return Number(value).toFixed(decimals)
}
