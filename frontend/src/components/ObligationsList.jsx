import { useState } from 'react'
import { Plus, X, CreditCard, ChevronDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

const STATUS_CONFIG = {
    Pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
    Funded: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: AlertCircle },
    Paid: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
}

function formatCurrency(amount, currency) {
    const symbol = currency === 'EURC' ? '€' : '$'
    return `${symbol}${new Intl.NumberFormat('en-US').format(amount)}`
}

function AddObligationModal({ onClose, onSubmit }) {
    const [form, setForm] = useState({ recipient: '', amount: '', currency: 'USDC', dueDate: '' })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.recipient || !form.amount || !form.dueDate) return
        onSubmit({ ...form, amount: parseFloat(form.amount) })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-sm mx-auto overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-6 py-4 border-b border-indigo-500/20 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        <Plus className="h-4 w-4 text-indigo-400" />
                        New Obligation
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-900/50 p-1.5 rounded-lg">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Recipient</label>
                        <input type="text" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium" placeholder="Vendor Name" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Amount</label>
                            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-bold" placeholder="0.00" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Currency</label>
                            <div className="relative">
                                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer font-bold">
                                    <option value="USDC" className="bg-slate-900 text-slate-200">USDC</option>
                                    <option value="EURC" className="bg-slate-900 text-slate-200">EURC</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Due Date</label>
                        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all [color-scheme:dark] font-medium" required />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 border border-indigo-400/30 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 active:scale-95">
                            Confirm Obligation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function ObligationsList({ obligations, onAdd }) {
    const [showModal, setShowModal] = useState(false)

    return (
        <section className="glass-panel overflow-hidden relative">
            <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-5 bg-slate-800/20">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <CreditCard className="h-4 w-4 text-indigo-400" />
                    </div>
                    <h2 className="text-base font-bold text-white tracking-tight">Active Obligations</h2>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-700">{obligations.length}</span>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Add
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-slate-700/50 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/20">
                            <th className="px-6 py-4">Recipient</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {obligations.map((ob) => {
                            const statusConf = STATUS_CONFIG[ob.status] || STATUS_CONFIG.Pending
                            const StatusIcon = statusConf.icon
                            return (
                                <tr key={ob.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-200">{ob.recipient}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-white tracking-tight mr-1.5">{formatCurrency(ob.amount, ob.currency)}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-700 bg-slate-800 px-1.5 py-0.5 rounded">{ob.currency}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-medium">{ob.dueDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.color} ${statusConf.bg} ${statusConf.border}`}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {ob.status}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && <AddObligationModal onClose={() => setShowModal(false)} onSubmit={onAdd} />}
        </section>
    )
}
