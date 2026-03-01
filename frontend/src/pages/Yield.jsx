import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { Landmark, TrendingUp, Percent, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import StatCard from '../components/StatCard'
import HatchedAccent from '../components/HatchedAccent'
import { formatCurrency, formatApy, formatDate, formatTimestamp } from '../lib/formatters'
import { useCountUp } from '../hooks/useCountUp'
import { api } from '../lib/api'

export default function Yield() {
    const { yieldData } = useOutletContext()
    // Local state for polling
    const [localData, setLocalData] = useState(yieldData.data || {})

    useEffect(() => {
        // Init if outlet context has it
        if (yieldData.data && !localData.total_deposited) {
            setLocalData(yieldData.data)
        }

        // Poll every 10s
        const timer = setInterval(async () => {
            try {
                const res = await api.getYield()
                setLocalData(res)
            } catch (e) {
                console.error("Failed to poll yield", e)
            }
        }, 10000)

        return () => clearInterval(timer)
    }, [yieldData.data])

    const yld = localData || {}
    const history = yld.history || []

    const animatedDeposited = useCountUp(yld.total_deposited || 0)
    const animatedEarned = useCountUp(yld.total_earned || 0, 1000, 2)
    const animatedApy = useCountUp(yld.current_apy || 0, 1500, 4)

    // Compute earning rate
    const hourlyRate = (yld.total_deposited || 0) * (0.045 / (365.25 * 24))

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label="Total Deposited"
                    value={formatCurrency(animatedDeposited)}
                    icon={Landmark}
                    delay={0}
                />
                <StatCard
                    label="Yield Earned"
                    value={formatCurrency(animatedEarned)}
                    sub={hourlyRate > 0 ? `Earning ${formatCurrency(hourlyRate)} / hr` : "Cumulative since inception"}
                    icon={TrendingUp}
                    color="var(--color-success)"
                    delay={0.05}
                />
                <StatCard
                    label="Current APY"
                    value={formatApy(animatedApy)}
                    sub={`${yld.days_active || Math.max(1, history.length)} yield events`}
                    icon={Percent}
                    color="var(--color-success)"
                    delay={0.1}
                />
            </div>

            <HatchedAccent height="3px" />

            {/* Main chart */}
            <div className="card-flat">
                <h3 className="font-heading text-base font-semibold mb-4">Cumulative Yield</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="yieldGradFull" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(t) => new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                axisLine={{ stroke: 'var(--color-border)' }}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={(v) => `$${v.toLocaleString()}`}
                                tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'IBM Plex Mono' }}
                                axisLine={false}
                                tickLine={false}
                                width={65}
                            />
                            <Tooltip
                                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12, color: 'var(--color-text-primary)' }}
                                labelFormatter={(t) => new Date(t).toLocaleDateString()}
                                formatter={(v) => [formatCurrency(v), 'Cumulative Yield']}
                            />
                            <Area type="monotone" dataKey="cumulative_yield" stroke="#F97316" fill="url(#yieldGradFull)" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Yield history table */}
            <div className="card-flat">
                <h3 className="font-heading text-base font-semibold mb-4">Yield History & Events</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Time</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Action</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Amount</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Cumulative Yield</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Trigger</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...history].reverse().map((entry, i) => (
                                <tr key={i} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                    <td className="py-2.5 px-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">{formatTimestamp(entry.timestamp)}</td>

                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                        {entry.type === 'deposit' ? (
                                            <span className="flex items-center gap-1 text-[var(--color-success)] text-xs font-semibold uppercase tracking-wider">
                                                <ArrowDownToLine className="w-3 h-3" /> Deposit
                                            </span>
                                        ) : entry.type === 'withdraw' ? (
                                            <span className="flex items-center gap-1 text-[var(--color-warning)] text-xs font-semibold uppercase tracking-wider">
                                                <ArrowUpFromLine className="w-3 h-3" /> Withdraw
                                            </span>
                                        ) : (
                                            <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider">Accrual</span>
                                        )}
                                    </td>

                                    <td className="py-2.5 px-3 font-mono text-sm">
                                        {entry.amount ? formatCurrency(entry.amount) : '—'}
                                    </td>

                                    <td className="py-2.5 px-3 font-mono text-sm text-[var(--color-success)]">
                                        {formatCurrency(entry.cumulative_yield)}
                                    </td>

                                    <td className="py-2.5 px-3 text-xs font-mono text-[var(--color-text-muted)]">
                                        {entry.decision_id ? (
                                            <Link to="/dashboard/agent" className="text-[var(--color-accent)] hover:underline">
                                                Agent #{entry.decision_id}
                                            </Link>
                                        ) : '—'}
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
