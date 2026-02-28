import { useOutletContext, Link } from 'react-router-dom'
import { DollarSign, Euro, Landmark, ArrowRight } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import StatCard from '../components/StatCard'
import DecisionItem from '../components/DecisionItem'
import HatchedAccent from '../components/HatchedAccent'
import StatusBadge from '../components/StatusBadge'
import { formatCurrency, formatDate, formatApy } from '../lib/formatters'
import { useCountUp } from '../hooks/useCountUp'

export default function Dashboard() {
    const { balances, decisions, yieldData, obligations } = useOutletContext()
    const bal = balances.data || {}
    const decs = (decisions.data || []).slice(0, 5)
    const yld = yieldData.data || {}
    const obls = (obligations.data || []).slice(0, 3)

    // Animated values
    const animatedUsdc = useCountUp(bal.usdc || 0)
    const animatedEurc = useCountUp(bal.eurc || 0)
    const animatedUsyc = useCountUp(bal.usyc || 0)
    const animatedTotal = useCountUp(bal.total_usd || 0)
    const animatedApy = useCountUp(yld.current_apy || 0, 1500, 4)

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Hero stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="USDC Balance" value={formatCurrency(animatedUsdc)} icon={DollarSign} delay={0} />
                <StatCard label="EURC Balance" value={formatCurrency(animatedEurc, 2, 'EUR')} icon={Euro} delay={0.05} />
                <StatCard label="USYC Balance" value={formatCurrency(animatedUsyc)} icon={Landmark} color="var(--color-success)" delay={0.1} />
            </div>

            {/* Total value with hatched accent */}
            <div className="flex items-center gap-4">
                <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Total Treasury Value</p>
                    <p className="treasury-value font-mono text-3xl font-bold text-[var(--color-text-primary)] transition-colors duration-300">
                        {formatCurrency(animatedTotal)}
                    </p>
                </div>
                <HatchedAccent className="flex-1 mt-4" height="4px" />
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Recent decisions */}
                <div className="lg:col-span-3 card-flat">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading text-base font-semibold">Recent Decisions</h3>
                        <Link to="/agent" className="text-xs text-[var(--color-accent)] font-medium hover:underline flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-[var(--color-border-light)]">
                        {decs.map((d, i) => (
                            <DecisionItem key={d.id} decision={d} index={i} compact />
                        ))}
                    </div>
                </div>

                {/* Yield performance mini chart */}
                <div className="lg:col-span-2 card-flat">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading text-base font-semibold">Yield Performance</h3>
                        <Link to="/yield" className="text-xs text-[var(--color-accent)] font-medium hover:underline flex items-center gap-1">
                            Details <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Current APY</p>
                    <p className="font-mono text-xl font-semibold text-[var(--color-success)] mb-3 transition-colors duration-300">
                        {formatApy(animatedApy)}
                    </p>
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={yld.history || []}>
                                <defs>
                                    <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="timestamp" hide />
                                <Tooltip
                                    contentStyle={{ background: '#fff', border: '1px solid #E5E1DB', borderRadius: 12, fontSize: 12 }}
                                    labelFormatter={() => ''}
                                    formatter={(v) => [formatCurrency(v), 'Yield']}
                                />
                                <Area type="monotone" dataKey="cumulative_yield" stroke="#F97316" fill="url(#yieldGrad)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Upcoming obligations */}
            <div className="card-flat">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-base font-semibold">Upcoming Obligations</h3>
                    <Link to="/obligations" className="text-xs text-[var(--color-accent)] font-medium hover:underline flex items-center gap-1">
                        Manage <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Recipient</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Amount</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Due</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {obls.map((o) => (
                                <tr key={o.id} className="border-b border-[var(--color-border-light)]">
                                    <td className="py-2.5 px-3 text-sm">{o.recipient}</td>
                                    <td className="py-2.5 px-3 text-sm font-mono">{formatCurrency(o.amount)} {o.currency}</td>
                                    <td className="py-2.5 px-3 text-sm text-[var(--color-text-secondary)]">{formatDate(o.due_date)}</td>
                                    <td className="py-2.5 px-3"><StatusBadge status={o.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
