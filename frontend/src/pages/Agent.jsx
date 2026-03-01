import { useState, useMemo, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Bot, Play, Clock, Zap, Loader2, Check, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import StatCard from '../components/StatCard'
import DecisionItem from '../components/DecisionItem'
import DecisionDetailModal from '../components/DecisionDetailModal'
import { formatTimestamp } from '../lib/formatters'
import { api } from '../lib/api'
import { useCountUp } from '../hooks/useCountUp'

const FILTERS = ['All', 'YIELD_DEPOSIT', 'YIELD_WITHDRAW', 'FX_SWAP', 'PAYOUT']
const FILTER_LABELS = { All: 'All', YIELD_DEPOSIT: 'Yield', YIELD_WITHDRAW: 'Withdrawals', FX_SWAP: 'Swaps', PAYOUT: 'Payouts' }

export default function Agent() {
    const { agent, decisions, triggerRun } = useOutletContext()
    const agentData = agent.data || {}
    const allDecisions = decisions.data || []
    const [filter, setFilter] = useState('All')
    const [runState, setRunState] = useState('idle')
    const [selectedDecision, setSelectedDecision] = useState(null)

    // Animated
    const animatedDecisions = useCountUp(agentData.total_decisions || 0, 1500, 0)

    const filtered = useMemo(() => {
        if (filter === 'All') return allDecisions
        return allDecisions.filter((d) => d.action === filter)
    }, [allDecisions, filter])

    const handleRun = async () => {
        if (runState !== 'idle') return
        setRunState('analyzing')

        // Simulate analysis phase UX
        await new Promise(r => setTimeout(r, 800))

        setRunState('executing')
        try {
            const result = await api.triggerRun()
            decisions.refresh()
            setRunState('complete')
            // Auto-open the new decision in the detail modal
            if (result?.decision) {
                setSelectedDecision(result.decision)
            }
            setTimeout(() => setRunState('idle'), 5000)
        } catch {
            setRunState('error')
            setTimeout(() => setRunState('idle'), 4000)
        }
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Agent status cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Status" value={agentData.status === 'active' ? 'Active' : 'Idle'} icon={Bot} delay={0} />
                <StatCard label="Total Decisions" value={animatedDecisions} icon={Zap} delay={0.05} />
                <StatCard label="Cycle Interval" value={`${agentData.cycle_interval || 30}s`} icon={Clock} delay={0.1} />
                <StatCard label="Last Decision" value={formatTimestamp(agentData.last_decision_time)} icon={Play} delay={0.15} />
            </div>

            {/* Strategy parameters */}
            <div className="card-flat">
                <h3 className="font-heading text-base font-semibold mb-3">Strategy Parameters</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {agentData.strategy && Object.entries(agentData.strategy).map(([key, val]) => (
                        <div key={key} className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)]">
                            <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                                {key.replace(/_/g, ' ')}
                            </p>
                            <p className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">
                                {typeof val === 'number' && val < 1 ? `${(val * 100).toFixed(1)}%` : typeof val === 'number' ? `$${val.toLocaleString()}` : val}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decision feed */}
            <div className="card-flat relative">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-base font-semibold">Decision Feed</h3>
                    <div className="flex items-center gap-3">
                        <AnimatePresence>
                            {runState === 'complete' && allDecisions[0] && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" />
                                    <span className="text-[0.65rem] font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
                                        Cycle Complete — {allDecisions[0].action}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={handleRun}
                            disabled={runState !== 'idle' && runState !== 'error'}
                            className={`neon-btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold transition-colors disabled:opacity-50 min-w-[120px] justify-center ${runState === 'error' ? 'bg-[var(--color-danger)] hover:bg-[var(--color-danger)]' : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]'}`}
                        >
                            {runState === 'analyzing' && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</>}
                            {runState === 'executing' && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing…</>}
                            {runState === 'complete' && <><Check className="w-3.5 h-3.5" /> Complete</>}
                            {runState === 'error' && <><span className="w-3.5 h-3.5">⚠</span> Failed — Retry</>}
                            {runState === 'idle' && <><Play className="w-3.5 h-3.5" /> Run Cycle</>}
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === f
                                ? 'bg-[var(--color-accent)] text-white'
                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                }`}
                        >
                            {FILTER_LABELS[f]}
                        </button>
                    ))}
                </div>

                <div className="divide-y divide-[var(--color-border-light)] max-h-[600px] overflow-y-auto">
                    {filtered.map((d, i) => (
                        <DecisionItem key={d.id} decision={d} index={i} onSelect={setSelectedDecision} />
                    ))}
                </div>
            </div>

            {/* Decision Detail Modal */}
            <DecisionDetailModal
                decision={selectedDecision}
                open={!!selectedDecision}
                onClose={() => setSelectedDecision(null)}
            />
        </div>
    )
}
