import { useState, useEffect, useCallback } from 'react'

export function useDarkMode() {
    const [isDark, setIsDark] = useState(() => {
        try {
            const saved = localStorage.getItem('arctreasury-theme')
            return saved !== null ? saved === 'dark' : true
        } catch {
            return true
        }
    })

    useEffect(() => {
        const root = document.documentElement
        if (isDark) {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
        try {
            localStorage.setItem('arctreasury-theme', isDark ? 'dark' : 'light')
        } catch { /* ignore */ }
    }, [isDark])

    const toggle = useCallback(() => setIsDark((prev) => !prev), [])

    return { isDark, toggle }
}
