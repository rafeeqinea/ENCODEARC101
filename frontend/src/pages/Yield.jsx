import { useOutletContext } from 'react-router-dom'
import { Landmark, TrendingUp, Percent } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import StatCard from '../components/StatCard'
import HatchedAccent from '../components/HatchedAccent'
import { formatCurrency, formatApy, formatDate } from '../lib/formatters'
import { useCountUp } from '../hooks/useCountUp'

export default function Yield() {
    const { yieldData } = useOutletContext()
    const yld = yieldData.data || {}
    const history = yld.history || []

    const animatedDeposited = useCountUp(yld.total_deposited || 0)
    const animatedEarned = useCountUp(yld.total_earned || 0)
    const animatedApy = useCountUp(yld.current_apy || 0, 1500, 4)

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
                    sub="Cumulative since inception"
                    icon={TrendingUp}
                    color="var(--color-success)"
                    delay={0.05}
                />
                <StatCard
                    label="Current APY"
                    value={formatApy(animatedApy)}
                    sub={`${yld.days_active || 0} days active`}
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
                                axisLine={{ stroke: '#E5E1DB' }}
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
                                contentStyle={{ background: '#fff', border: '1px solid #E5E1DB', borderRadius: 12, fontSize: 12 }}
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
                <h3 className="font-heading text-base font-semibold mb-4">Daily Yield History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Date</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Cumulative Yield</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...history].reverse().map((entry, i) => (
                                <tr key={i} className="border-b border-[var(--color-border-light)]">
                                    <td className="py-2.5 px-3 text-sm text-[var(--color-text-secondary)]">{formatDate(entry.timestamp)}</td>
                                    <td className="py-2.5 px-3 font-mono text-sm text-[var(--color-success)]">{formatCurrency(entry.cumulative_yield)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
