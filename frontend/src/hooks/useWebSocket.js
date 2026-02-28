import { useState, useEffect, useRef, useCallback } from 'react'

export function useWebSocket(url = '/ws') {
    const [messages, setMessages] = useState([])
    const [connected, setConnected] = useState(false)
    const wsRef = useRef(null)
    const reconnectTimer = useRef(null)

    const connect = useCallback(() => {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const wsUrl = `${protocol}//${window.location.host}${url}`
            const ws = new WebSocket(wsUrl)

            ws.onopen = () => setConnected(true)
            ws.onclose = () => {
                setConnected(false)
                reconnectTimer.current = setTimeout(connect, 5000)
            }
            ws.onerror = () => ws.close()
            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data)
                    setMessages((prev) => [data, ...prev].slice(0, 100))
                } catch { /* ignore non-JSON */ }
            }
            wsRef.current = ws
        } catch {
            reconnectTimer.current = setTimeout(connect, 5000)
        }
    }, [url])

    useEffect(() => {
        connect()
        return () => {
            clearTimeout(reconnectTimer.current)
            wsRef.current?.close()
        }
    }, [connect])

    return { messages, connected }
}
