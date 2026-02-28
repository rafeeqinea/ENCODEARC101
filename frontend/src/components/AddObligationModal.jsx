import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AddObligationModal({ open, onClose, onSubmit }) {
    const [form, setForm] = useState({ recipient: '', amount: '', currency: 'USDC', due_date: '' })

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({ ...form, amount: parseFloat(form.amount) })
        setForm({ recipient: '', amount: '', currency: 'USDC', due_date: '' })
        onClose()
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 w-full max-w-md shadow-lg transition-colors duration-200"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-heading text-lg font-semibold">Add Obligation</h3>
                            <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--color-bg-secondary)]">
                                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Recipient</label>
                                <input
                                    required
                                    value={form.recipient}
                                    onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                                    placeholder="Vendor A - Invoice #1234"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Amount</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
                                        placeholder="25000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Currency</label>
                                    <select
                                        value={form.currency}
                                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                                    >
                                        <option value="USDC">USDC</option>
                                        <option value="EURC">EURC</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Due Date</label>
                                <input
                                    required
                                    type="date"
                                    value={form.due_date}
                                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
                            >
                                Create Obligation
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
