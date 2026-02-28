import { useState, useEffect, useCallback, useRef } from 'react'

export function useApi(fetcher, { interval = 0, fallback = null } = {}) {
    const [data, setData] = useState(fallback)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isDemo, setIsDemo] = useState(false)
    const mountedRef = useRef(true)

    const load = useCallback(async () => {
        try {
            const result = await fetcher()
            if (mountedRef.current) {
                setData(result)
                setError(null)
                setIsDemo(false)
                setLoading(false)
            }
        } catch (err) {
            if (mountedRef.current) {
                if (fallback !== null) {
                    setData(fallback)
                    setIsDemo(true)
                }
                setError(err)
                setLoading(false)
            }
        }
    }, [fetcher, fallback])

    useEffect(() => {
        mountedRef.current = true
        load()
        let timer
        if (interval > 0) timer = setInterval(load, interval)
        return () => { mountedRef.current = false; clearInterval(timer) }
    }, [load, interval])

    return { data, loading, error, isDemo, refresh: load }
}
