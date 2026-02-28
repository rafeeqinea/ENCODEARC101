import { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowLeftRight, TrendingDown, TrendingUp, RefreshCw, Check, Loader2 } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import StatCard from '../components/StatCard'
import HatchedAccent from '../components/HatchedAccent'
import { formatRate, formatPercent, formatCurrency, formatTimestamp } from '../lib/formatters'
import { api } from '../lib/api'
import { useCountUp } from '../hooks/useCountUp'

export default function FXMonitor() {
    const context = useOutletContext() || {}
    const fxData = context.fxData || {}
    const fx = fxData.data || {}
    const history = fx.history || []
    const swaps = fx.swaps || []
    const [range, setRange] = useState('24H')

    // StableFX quote state
    const [quoteAmount, setQuoteAmount] = useState('10000')
    const [quoteDirection, setQuoteDirection] = useState('USDC→EURC')
    const [quote, setQuote] = useState(null)
    const [quoteLoading, setQuoteLoading] = useState(false)
    const [tradeStatus, setTradeStatus] = useState(null) // null | 'executing' | 'completed'
    const [liveRate, setLiveRate] = useState(null)

    // Wait, let's preserve the rest
    useEffect(() => {
        async function fetchRate() {
            try {
                const data = await api.getStableFxRate()
                setLiveRate(data)
            } catch { /* ignore */ }
        }
        fetchRate()
        const timer = setInterval(fetchRate, 30000)
        return () => clearInterval(timer)
    }, [])

    const filteredHistory = (() => {
        const now = Date.now()
        const hours = { '1H': 1, '6H': 6, '24H': 24, '7D': 168 }[range] || 24
        const cutoff = now - hours * 3600000
        return history.filter((p) => new Date(p.timestamp).getTime() > cutoff)
    })()

    const animatedRate = useCountUp(liveRate?.rate || fx.current_rate || 0, 1500, 4)
    const animatedChangePct = useCountUp(fx.change_pct || 0, 1500, 2)
    const animatedChange24h = useCountUp(Math.abs(fx.change_24h || 0), 1500, 4)
    const isDown = (fx.change_24h || 0) < 0

    const handleGetQuote = useCallback(async () => {
        setQuoteLoading(true)
        setQuote(null)
        setTradeStatus(null)
        try {
            const [from, to] = quoteDirection === 'USDC→EURC' ? ['USDC', 'EURC'] : ['EURC', 'USDC']
            const data = await api.getStableFxQuote(from, to, quoteAmount)
            setQuote(data)
        } catch { /* ignore */ }
        setQuoteLoading(false)
    }, [quoteAmount, quoteDirection])

    const handleTrade = useCallback(async () => {
        if (!quote?.id) return
        setTradeStatus('executing')
        try {
            await api.createStableFxTrade(quote.id)
            setTradeStatus('completed')
        } catch {
            setTradeStatus(null)
        }
    }, [quote])

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Header pill */}
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-success)] pulse-live" />
                    <span className="text-[0.65rem] font-medium font-mono text-[var(--color-success)] uppercase tracking-wider">StableFX Active</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label="USDC / EURC Rate"
                    value={animatedRate}
                    sub={liveRate ? `Source: ${liveRate.source}` : undefined}
                    icon={ArrowLeftRight}
                    color="var(--color-info)"
                    delay={0}
                />
                <StatCard
                    label="24h Change"
                    value={formatPercent(animatedChangePct)}
                    sub={`${isDown ? '-' : '+'}${animatedChange24h}`}
                    icon={isDown ? TrendingDown : TrendingUp}
                    color={isDown ? 'var(--color-danger)' : 'var(--color-success)'}
                    delay={0.05}
                />
                <div className="card flex items-center gap-4">
                    <div>
                        <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">AI Forecast</p>
                        <p className="font-heading text-lg font-bold text-[var(--color-text-primary)] capitalize">{fx.forecast_direction || '—'}</p>
                    </div>
                    <div className="ml-auto">
                        {fx.forecast_direction === 'down' ? (
                            <TrendingDown className="w-8 h-8 text-[var(--color-danger)] opacity-40" />
                        ) : (
                            <TrendingUp className="w-8 h-8 text-[var(--color-success)] opacity-40" />
                        )}
                    </div>
                </div>
            </div>

            <HatchedAccent height="3px" />

            {/* ── StableFX Live Quote ── */}
            <div className="card-flat">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="font-heading text-base font-semibold">Get Live Quote</h3>
                        <span className="badge badge-info text-[0.6rem]">Powered by Circle StableFX</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-end gap-3 mb-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Amount</label>
                        <input
                            type="number"
                            value={quoteAmount}
                            onChange={(e) => setQuoteAmount(e.target.value)}
                            className="w-40 px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                        />
                    </div>

                    {/* Direction */}
                    <div>
                        <label className="block text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Direction</label>
                        <select
                            value={quoteDirection}
                            onChange={(e) => setQuoteDirection(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                        >
                            <option value="USDC→EURC">USDC → EURC</option>
                            <option value="EURC→USDC">EURC → USDC</option>
                        </select>
                    </div>

                    {/* Get Quote Button */}
                    <button
                        onClick={handleGetQuote}
                        disabled={quoteLoading}
                        className="neon-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
                    >
                        {quoteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        {quoteLoading ? 'Fetching…' : 'Get Quote'}
                    </button>
                </div>

                {/* Quote Result */}
                <AnimatePresence>
                    {quote && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                <div>
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Rate</p>
                                    <p className="font-mono text-lg font-bold text-[var(--color-accent)]">{quote.rate}</p>
                                </div>
                                <div>
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">You Send</p>
                                    <p className="font-mono text-sm font-semibold">{quote.from?.amount} {quote.from?.currency}</p>
                                </div>
                                <div>
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">You Receive</p>
                                    <p className="font-mono text-sm font-semibold text-[var(--color-success)]">{quote.to?.amount} {quote.to?.currency}</p>
                                </div>
                                <div>
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Fee</p>
                                    <p className="font-mono text-sm">{quote.fee?.amount} {quote.fee?.currency}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleTrade}
                                    disabled={tradeStatus !== null}
                                    className="neon-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-success)] text-white text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
                                >
                                    {tradeStatus === 'executing' ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing…</>
                                    ) : tradeStatus === 'completed' ? (
                                        <><Check className="w-3.5 h-3.5" /> Trade Complete</>
                                    ) : (
                                        <><ArrowLeftRight className="w-3.5 h-3.5" /> Execute Trade</>
                                    )}
                                </button>
                                <span className="text-[0.65rem] text-[var(--color-text-muted)]">
                                    Quote ID: {quote.id}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Chart */}
            <div className="card-flat">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-base font-semibold">USDC/EURC Rate</h3>
                    <div className="flex gap-1">
                        {['1H', '6H', '24H', '7D'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${range === r
                                    ? 'bg-[var(--color-accent)] text-white'
                                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-72 w-full min-h-[288px]">
                    {filteredHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredHistory}>
                                <defs>
                                    <linearGradient id="fxGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.15} />
                                        <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                    axisLine={{ stroke: 'var(--color-border)' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    tickFormatter={(v) => v.toFixed(3)}
                                    tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'IBM Plex Mono' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={55}
                                />
                                <Tooltip
                                    contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12, backdropFilter: 'blur(16px)' }}
                                    labelFormatter={(t) => new Date(t).toLocaleString()}
                                    formatter={(v) => [formatRate(v), 'Rate']}
                                />
                                <Area type="monotone" dataKey="rate" stroke="#F97316" fill="url(#fxGrad)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
                            <span className="text-sm font-medium">Loading FX Data...</span>
                        </div>
                    )}
                </div>
                <p className="text-[0.6rem] text-[var(--color-text-muted)] mt-2 text-right">Powered by Circle StableFX</p>
            </div>

            {/* Swap history */}
            <div className="card-flat">
                <h3 className="font-heading text-base font-semibold mb-4">Swap History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Time</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Direction</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Amount</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {swaps.map((s, i) => (
                                <tr key={i} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                    <td className="py-2.5 px-3 text-sm text-[var(--color-text-secondary)] whitespace-nowrap">{formatTimestamp(s.timestamp)}</td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                        <span className="badge badge-info text-[0.7rem]">{s.direction}</span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-sm whitespace-nowrap">{formatCurrency(s.amount)}</td>
                                    <td className="py-2.5 px-3 font-mono text-sm whitespace-nowrap">{formatRate(s.rate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
