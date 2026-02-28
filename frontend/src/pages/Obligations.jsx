import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import ObligationRow from '../components/ObligationRow'
import AddObligationModal from '../components/AddObligationModal'
import StatCard from '../components/StatCard'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/formatters'

export default function Obligations() {
    const context = useOutletContext() || {}
    const { obligations } = context
    const obls = obligations?.data || []
    const [modalOpen, setModalOpen] = useState(false)

    const stats = useMemo(() => {
        const pending = obls.filter((o) => o.status === 'pending')
        const overdue = obls.filter((o) => o.status === 'overdue')
        const paid = obls.filter((o) => o.status === 'paid')
        return {
            pendingCount: pending.length,
            pendingTotal: pending.reduce((s, o) => s + o.amount, 0),
            overdueCount: overdue.length,
            overdueTotal: overdue.reduce((s, o) => s + o.amount, 0),
            paidCount: paid.length,
            paidTotal: paid.reduce((s, o) => s + o.amount, 0),
        }
    }, [obls])

    const handleCreate = async (data) => {
        try {
            await api.createObligation({ ...data, due_date: new Date(data.due_date).toISOString() })
            obligations?.refresh()
        } catch {
            // In demo: add locally
            obls.push({
                id: `obl_${Date.now()}`,
                ...data,
                due_date: new Date(data.due_date).toISOString(),
                status: 'pending',
                funded_by: null,
            })
        }
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label="Pending"
                    value={`${stats.pendingCount} obligations`}
                    sub={formatCurrency(stats.pendingTotal)}
                    icon={Clock}
                    color="var(--color-warning)"
                    delay={0}
                />
                <StatCard
                    label="Overdue"
                    value={`${stats.overdueCount} obligations`}
                    sub={formatCurrency(stats.overdueTotal)}
                    icon={AlertTriangle}
                    color="var(--color-danger)"
                    delay={0.05}
                />
                <StatCard
                    label="Paid"
                    value={`${stats.paidCount} obligations`}
                    sub={formatCurrency(stats.paidTotal)}
                    icon={CheckCircle2}
                    color="var(--color-success)"
                    delay={0.1}
                />
            </div>

            {/* Table */}
            <div className="card-flat">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-base font-semibold">Payment Obligations</h3>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="neon-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Obligation
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-2 px-4 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Recipient</th>
                                <th className="py-2 px-4 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Amount</th>
                                <th className="py-2 px-4 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Currency</th>
                                <th className="py-2 px-4 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Due Date</th>
                                <th className="py-2 px-4 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Status</th>
                                <th className="py-2 px-4 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Funded By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {obls.map((o) => (
                                <ObligationRow key={o.id} obligation={o} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddObligationModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
        </div>
    )
}
