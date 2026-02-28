import { DollarSign, Euro, Landmark, TrendingUp } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

const TOKENS = [
    { key: 'usdc', label: 'USDC', icon: DollarSign, color: '#3b82f6', bg: 'bg-blue-500', from: '#3b82f6', to: '#60a5fa' },
    { key: 'eurc', label: 'EURC', icon: Euro, color: '#8b5cf6', bg: 'bg-violet-500', from: '#8b5cf6', to: '#a78bfa' },
    { key: 'usyc', label: 'USYC', icon: Landmark, color: '#10b981', bg: 'bg-emerald-500', from: '#10b981', to: '#34d399' },
]

function formatCurrency(v) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

function MiniSparkline({ data, color }) {
    const chartData = data.map((v, i) => ({ v, i }))
    return (
        <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`color-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${color})`} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default function TreasuryOverview({ balances, totalValue }) {
    return (
        <section>
            {/* Banner */}
            <div className="glass-panel p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between border-slate-700/50 relative overflow-hidden">
                {/* Glow behind */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-400 mb-1">Total Treasury Value</p>
                    <div className="flex items-end gap-4">
                        <h2 className="text-5xl font-bold tracking-tight text-white">{formatCurrency(totalValue)}</h2>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            +2.4%
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {TOKENS.map(({ key, label, icon: Icon, color, bg }) => {
                    const data = balances[key] || { amount: 0, usdValue: 0, history: [] }
                    return (
                        <div key={key} className="glass-panel p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${color}, transparent)` }}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${bg} bg-opacity-20`}>
                                        <Icon className="h-5 w-5" style={{ color }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                                        <p className="text-2xl font-bold text-white mt-0.5">{new Intl.NumberFormat().format(data.amount)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <p className="text-sm text-slate-500">≈ {formatCurrency(data.usdValue)}</p>
                                <MiniSparkline data={data.history} color={color} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
