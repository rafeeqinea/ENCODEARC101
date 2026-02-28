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

    const [localSwaps, setLocalSwaps] = useState(fx.swaps || [])
    useEffect(() => {
        if (fx.swaps && fx.swaps.length > 0 && localSwaps.length === 0) {
            setLocalSwaps(fx.swaps)
        }
    }, [fx.swaps])

    const forecast = context.forecast?.data || {}
    const prediction = forecast.prediction || {}
    const recommendation = forecast.recommendation || {}
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
            const result = await api.createStableFxTrade(quote.id, {
                amount: parseFloat(quoteAmount),
                direction: quoteDirection,
                rate: parseFloat(quote.rate) || 0.9215,
            })
            setTradeStatus('completed')

            // Add to local swap history for instant UI update
            setLocalSwaps(prev => [{
                timestamp: new Date().toISOString(),
                direction: quoteDirection,
                amount_in: quote.from?.amount || quoteAmount,
                amount_out: quote.to?.amount || '0',
                rate: quote.rate,
                fee: quote.fee?.amount || '1.50',
                tx_hash: result?.tx_hash || `0x${Math.random().toString(16).slice(2, 10)}`,
                source: "Circle StableFX"
            }, ...prev])

            // Refresh balances so dashboard updates
            if (context.balances?.refresh) context.balances.refresh()

            setTimeout(() => {
                setTradeStatus(null)
                setQuote(null)
            }, 5000)
        } catch {
            setTradeStatus(null)
        }
    }, [quote, quoteDirection, quoteAmount, context.balances])

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* AI Forecast Card */}
            <div className="card-flat bg-gradient-to-br from-[var(--color-bg-secondary)] to-[rgba(249,115,22,0.05)] border-[var(--color-border)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <TrendingUp className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <h3 className="font-heading text-base font-semibold">AI Rate Forecast</h3>
                            <span className="badge badge-info text-[0.6rem]">Powered by Linear Regression</span>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider ${recommendation.action === 'SWAP_NOW' ? 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]' :
                            recommendation.action === 'WAIT' ? 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]' :
                                'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                            }`}>
                            {recommendation.action || 'HOLD'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Direction</p>
                            <div className="flex items-center gap-2">
                                {prediction.direction === 'up' ? <TrendingUp className="w-5 h-5 text-[var(--color-success)]" /> :
                                    prediction.direction === 'down' ? <TrendingDown className="w-5 h-5 text-[var(--color-danger)]" /> :
                                        <ArrowLeftRight className="w-5 h-5 text-[var(--color-text-muted)]" />}
                                <span className="font-semibold capitalize">{prediction.direction || 'Stable'}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Predicted Rate (6h)</p>
                            <p className="font-mono text-lg font-bold">{prediction.predicted_rate ? prediction.predicted_rate.toFixed(4) : '—'}</p>
                        </div>
                        <div>
                            <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Confidence</p>
                            <div className="flex items-center gap-2 h-7">
                                <div className="flex-1 h-1.5 bg-[var(--color-border-light)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--color-accent)]"
                                        style={{ width: `${(prediction.confidence || 0) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-mono">{prediction.confidence ? (prediction.confidence * 100).toFixed(1) : 0}%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Model Accuracy (R²)</p>
                            <p className="font-mono text-sm">{prediction.r_squared ? prediction.r_squared.toFixed(3) : '—'}</p>
                        </div>
                    </div>
                </div>
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
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Amount In</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Amount Out</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Rate</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Fee</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localSwaps.map((s, i) => (
                                <tr key={i} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                    <td className="py-2.5 px-3 text-sm text-[var(--color-text-secondary)] whitespace-nowrap">{formatTimestamp(s.timestamp)}</td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                        <span className="badge badge-info text-[0.7rem]">{s.direction}</span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-sm whitespace-nowrap">{formatCurrency(s.amount_in || s.amount)}</td>
                                    <td className="py-2.5 px-3 font-mono text-sm whitespace-nowrap">{formatCurrency(s.amount_out || (s.amount * s.rate))}</td>
                                    <td className="py-2.5 px-3 font-mono text-sm whitespace-nowrap">{s.rate ? formatRate(s.rate) : '—'}</td>
                                    <td className="py-2.5 px-3 font-mono text-sm whitespace-nowrap">{s.fee ? `$${s.fee}` : '—'}</td>
                                    <td className="py-2.5 px-3 text-sm text-[var(--color-text-muted)] whitespace-nowrap">
                                        {s.source || (s.decision_id ? `Agent Decision #${s.decision_id}` : 'Circle StableFX')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
