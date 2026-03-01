import { useState, useEffect, useMemo, useCallback } from 'react'
import { Receipt, Download, ExternalLink, Filter, Search, Copy, Check, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { formatCurrency, formatTimestamp } from '../lib/formatters'

const ACTION_COLORS = {
    deposit: 'var(--color-success)',
    withdraw: 'var(--color-danger)',
    swap: 'var(--color-info)',
    payout: 'var(--color-warning)',
    yield_deposit: 'var(--color-accent)',
    yield_withdraw: 'var(--color-accent)',
    escrow_create: '#8B5CF6',
    escrow_release: '#10B981',
    vesting_create: '#6366F1',
    vesting_release: '#06B6D4',
}

const ACTION_LABELS = {
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    swap: 'FX Swap',
    payout: 'Payout',
    yield_deposit: 'Yield Deposit',
    yield_withdraw: 'Yield Withdraw',
    escrow_create: 'Escrow Created',
    escrow_release: 'Escrow Released',
    vesting_create: 'Vesting Created',
    vesting_release: 'Vesting Released',
    FX_SWAP: 'FX Swap',
    YIELD_DEPOSIT: 'Yield Deposit',
    YIELD_WITHDRAW: 'Yield Withdraw',
    HOLD: 'Hold',
    PAYOUT: 'Payout',
}

export default function Transactions() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [expandedTx, setExpandedTx] = useState(null)
    const [copiedHash, setCopiedHash] = useState(null)

    useEffect(() => {
        async function fetchTxs() {
            try {
                const data = await api.getTransactions()
                setTransactions(data)
            } catch { /* ignore */ }
            setLoading(false)
        }
        fetchTxs()
        const timer = setInterval(fetchTxs, 15000)
        return () => clearInterval(timer)
    }, [])

    const filtered = useMemo(() => {
        let txs = transactions
        if (filter !== 'all') txs = txs.filter(t => t.action === filter)
        if (search) {
            const s = search.toLowerCase()
            txs = txs.filter(t =>
                (t.tx_hash && t.tx_hash.toLowerCase().includes(s)) ||
                (t.recipient && t.recipient.toLowerCase().includes(s)) ||
                (t.action && t.action.toLowerCase().includes(s))
            )
        }
        return txs
    }, [transactions, filter, search])

    const copyHash = useCallback((hash) => {
        navigator.clipboard.writeText(hash)
        setCopiedHash(hash)
        setTimeout(() => setCopiedHash(null), 2000)
    }, [])

    const downloadCSV = useCallback(() => {
        const headers = ['Timestamp', 'Action', 'Token', 'Amount', 'Fee', 'Recipient', 'Tx Hash', 'Status', 'Source']
        const rows = filtered.map(t => [
            t.timestamp,
            t.action,
            t.token || '',
            t.amount || '',
            t.fee || '0',
            t.recipient || '',
            t.tx_hash || '',
            t.on_chain ? 'On-Chain' : 'Off-Chain',
            t.source || 'agent',
        ])
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `arctresury_transactions_${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }, [filtered])

    const totalVolume = useMemo(() =>
        transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0), [transactions])
    const totalFees = useMemo(() =>
        transactions.reduce((sum, t) => sum + (parseFloat(t.fee) || 0), 0), [transactions])
    const onChainCount = useMemo(() =>
        transactions.filter(t => t.on_chain).length, [transactions])

    const actionTypes = useMemo(() => {
        const types = new Set(transactions.map(t => t.action))
        return ['all', ...Array.from(types)]
    }, [transactions])

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Transactions', value: transactions.length, color: 'var(--color-accent)' },
                    { label: 'Total Volume', value: `$${formatCurrency(totalVolume)}`, color: 'var(--color-success)' },
                    { label: 'Total Fees', value: `$${totalFees.toFixed(2)}`, color: 'var(--color-warning)' },
                    { label: 'On-Chain Txs', value: onChainCount, color: 'var(--color-info)' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="card-flat"
                    >
                        <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="font-mono text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="card-flat">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search by tx hash, recipient, action..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors appearance-none"
                        >
                            {actionTypes.map(t => (
                                <option key={t} value={t}>{t === 'all' ? 'All Actions' : (ACTION_LABELS[t] || t)}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)] pointer-events-none" />
                    </div>

                    {/* Download */}
                    <button
                        onClick={downloadCSV}
                        className="neon-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="card-flat overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Receipt className="w-4.5 h-4.5 text-[var(--color-accent)]" />
                        <h3 className="font-heading text-base font-semibold">Transaction History</h3>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">{filtered.length} transactions</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Time</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Action</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Token</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Amount</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Fee</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Recipient</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Tx Hash</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filtered.map((tx, i) => (
                                    <motion.tr
                                        key={tx.id || i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: Math.min(i * 0.02, 0.5) }}
                                        className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
                                        onClick={() => setExpandedTx(expandedTx === i ? null : i)}
                                    >
                                        <td className="py-2.5 px-3 text-xs text-[var(--color-text-secondary)] whitespace-nowrap font-mono">
                                            {formatTimestamp(tx.timestamp)}
                                        </td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: `${ACTION_COLORS[tx.action] || 'var(--color-text-muted)'}20`,
                                                    color: ACTION_COLORS[tx.action] || 'var(--color-text-muted)',
                                                }}
                                            >
                                                {ACTION_LABELS[tx.action] || tx.action}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-sm whitespace-nowrap">{tx.token || '—'}</td>
                                        <td className="py-2.5 px-3 font-mono text-sm font-semibold whitespace-nowrap">
                                            {tx.amount ? `$${formatCurrency(tx.amount)}` : '—'}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-xs text-[var(--color-warning)] whitespace-nowrap">
                                            {tx.fee && parseFloat(tx.fee) > 0 ? `$${parseFloat(tx.fee).toFixed(2)}` : '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-xs font-mono text-[var(--color-text-muted)] whitespace-nowrap">
                                            {tx.recipient ? `${tx.recipient.slice(0, 6)}...${tx.recipient.slice(-4)}` : '—'}
                                        </td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                            {tx.tx_hash ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-xs text-[var(--color-accent)]">
                                                        {tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-6)}
                                                    </span>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); copyHash(tx.tx_hash) }}
                                                        className="p-0.5 hover:bg-[var(--color-bg-secondary)] rounded transition-colors"
                                                    >
                                                        {copiedHash === tx.tx_hash
                                                            ? <Check className="w-3 h-3 text-[var(--color-success)]" />
                                                            : <Copy className="w-3 h-3 text-[var(--color-text-muted)]" />}
                                                    </button>
                                                    {tx.on_chain && (
                                                        <a
                                                            href={`https://testnet.arcscan.app/tx/${tx.tx_hash.startsWith('0x') ? tx.tx_hash : '0x' + tx.tx_hash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={e => e.stopPropagation()}
                                                            className="p-0.5 hover:bg-[var(--color-bg-secondary)] rounded transition-colors"
                                                        >
                                                            <ExternalLink className="w-3 h-3 text-[var(--color-info)]" />
                                                        </a>
                                                    )}
                                                </div>
                                            ) : <span className="text-xs text-[var(--color-text-muted)]">—</span>}
                                        </td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 text-[0.65rem] font-semibold ${tx.on_chain
                                                ? 'text-[var(--color-success)]'
                                                : 'text-[var(--color-text-muted)]'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${tx.on_chain ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-muted)]'}`} />
                                                {tx.on_chain ? 'On-Chain' : 'Off-Chain'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && !loading && (
                    <div className="py-12 text-center text-[var(--color-text-muted)]">
                        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No transactions found</p>
                    </div>
                )}
            </div>

            {/* Expanded Receipt */}
            <AnimatePresence>
                {expandedTx !== null && filtered[expandedTx] && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="card-flat border-l-4"
                        style={{ borderLeftColor: ACTION_COLORS[filtered[expandedTx].action] || 'var(--color-accent)' }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading text-base font-semibold flex items-center gap-2">
                                <Receipt className="w-4 h-4" />
                                Transaction Receipt
                            </h3>
                            <button
                                onClick={() => {
                                    const tx = filtered[expandedTx]
                                    const receipt = `ArcTreasury Transaction Receipt\n${'='.repeat(40)}\nID: ${tx.id}\nTimestamp: ${tx.timestamp}\nAction: ${tx.action}\nToken: ${tx.token}\nAmount: $${tx.amount}\nFee: $${tx.fee || 0}\nRecipient: ${tx.recipient || 'N/A'}\nTx Hash: ${tx.tx_hash || 'N/A'}\nOn-Chain: ${tx.on_chain ? 'Yes' : 'No'}\nSource: ${tx.source || 'agent'}\n${'='.repeat(40)}\nArc Testnet | Chain ID: 5042002`
                                    const blob = new Blob([receipt], { type: 'text/plain' })
                                    const url = URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = `receipt_${tx.id || expandedTx}.txt`
                                    a.click()
                                    URL.revokeObjectURL(url)
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            >
                                <Download className="w-3 h-3" />
                                Download Receipt
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Action', value: ACTION_LABELS[filtered[expandedTx].action] || filtered[expandedTx].action },
                                { label: 'Amount', value: filtered[expandedTx].amount ? `$${formatCurrency(filtered[expandedTx].amount)}` : '—' },
                                { label: 'Fee Charged', value: filtered[expandedTx].fee ? `$${parseFloat(filtered[expandedTx].fee).toFixed(4)}` : '$0.00' },
                                { label: 'Net Amount', value: filtered[expandedTx].amount ? `$${formatCurrency(parseFloat(filtered[expandedTx].amount) - parseFloat(filtered[expandedTx].fee || 0))}` : '—' },
                                { label: 'Token', value: filtered[expandedTx].token || '—' },
                                { label: 'Recipient', value: filtered[expandedTx].recipient || 'Treasury' },
                                { label: 'Tx Hash', value: filtered[expandedTx].tx_hash ? `${filtered[expandedTx].tx_hash.slice(0, 12)}...` : '—' },
                                { label: 'Timestamp', value: formatTimestamp(filtered[expandedTx].timestamp) },
                            ].map(item => (
                                <div key={item.label}>
                                    <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">{item.label}</p>
                                    <p className="font-mono text-sm font-medium">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        {filtered[expandedTx].snapshot && (
                            <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
                                <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Decision Context</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <p className="text-[0.6rem] text-[var(--color-text-muted)]">FX Rate</p>
                                        <p className="font-mono text-sm">{filtered[expandedTx].snapshot?.fx_rate?.toFixed(4) || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.6rem] text-[var(--color-text-muted)]">Balance Source</p>
                                        <p className="font-mono text-sm">{filtered[expandedTx].snapshot?.balance_source || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.6rem] text-[var(--color-text-muted)]">Confidence</p>
                                        <p className="font-mono text-sm">{filtered[expandedTx].confidence ? `${(filtered[expandedTx].confidence * 100).toFixed(1)}%` : '—'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
