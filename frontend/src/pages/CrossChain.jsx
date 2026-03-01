import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Globe, ArrowRight, Layers, Zap, ShieldCheck, ExternalLink, CircleDot, Loader2, CheckCircle2, Clock, ArrowLeftRight } from 'lucide-react'
import { api } from '../lib/api'

const CHAINS = [
    { name: 'Arc Testnet', id: 5042002, status: 'Primary', rpc: 'https://rpc.testnet.arc.network' },
    { name: 'Ethereum Sepolia', id: 11155111, status: 'USYC Source', rpc: 'https://ethereum-sepolia-rpc.publicnode.com' },
    { name: 'Base Sepolia', id: 84532, status: 'CCTP Ready', rpc: 'https://sepolia.base.org' },
    { name: 'Arbitrum Sepolia', id: 421614, status: 'CCTP Ready', rpc: 'https://sepolia-rollup.arbitrum.io/rpc' },
    { name: 'Polygon', id: 137, status: 'Gateway Ready', rpc: 'https://polygon-bor-rpc.publicnode.com' },
    { name: 'Avalanche', id: 43114, status: 'Gateway Ready', rpc: 'https://api.avax.network/ext/bc/C/rpc' },
]

const STATUS_COLORS = {
    pending: 'text-[var(--color-text-muted)]',
    burn_sent: 'text-[var(--color-warning)]',
    attesting: 'text-[var(--color-info)]',
    attested: 'text-[var(--color-info)]',
    mint_sent: 'text-[var(--color-info)]',
    completed: 'text-[var(--color-success)]',
    failed: 'text-[var(--color-danger)]',
}

export default function CrossChain() {
    const [routes, setRoutes] = useState([])
    const [transfers, setTransfers] = useState([])
    const [chainHealth, setChainHealth] = useState({}) // { chainId: true/false }
    const [fromChain, setFromChain] = useState(5042002)
    const [toChain, setToChain] = useState(11155111)
    const [amount, setAmount] = useState('1000')
    const [sending, setSending] = useState(false)
    const [lastResult, setLastResult] = useState(null)

    // Ping each chain's RPC to check if it's alive
    useEffect(() => {
        const checkChains = async () => {
            const results = {}
            await Promise.all(CHAINS.map(async (chain) => {
                try {
                    const resp = await fetch(chain.rpc, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 }),
                        signal: AbortSignal.timeout(5000),
                    })
                    results[chain.id] = resp.ok
                } catch {
                    results[chain.id] = false
                }
            }))
            setChainHealth(results)
        }
        checkChains()
        const iv = setInterval(checkChains, 30000) // re-check every 30s
        return () => clearInterval(iv)
    }, [])

    const load = useCallback(async () => {
        try {
            const [r, t] = await Promise.all([api.getBridgeRoutes(), api.getBridgeTransfers()])
            setRoutes(r)
            setTransfers(t)
        } catch {}
    }, [])

    useEffect(() => { load() }, [load])
    useEffect(() => { const iv = setInterval(load, 5000); return () => clearInterval(iv) }, [load])

    const handleTransfer = async () => {
        setSending(true)
        setLastResult(null)
        try {
            const result = await api.initiateBridgeTransfer({ from_chain: fromChain, to_chain: toChain, amount: parseFloat(amount) })
            setLastResult(result)
            await load()
        } catch (e) {
            setLastResult({ error: e.message })
        }
        setSending(false)
    }

    const activeChains = CHAINS.filter(c => chainHealth[c.id] !== false && c.id !== fromChain)

    return (
        <div className="max-w-[1100px] mx-auto space-y-6">
            <div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-1">Cross-Chain Bridge</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">CCTP V2 — burn/attest/mint USDC across chains in ~90 seconds</p>
            </div>

            {/* Chain Status Grid */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Supported Chains</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CHAINS.map((chain) => {
                        const alive = chainHealth[chain.id]
                        const pending = alive === undefined
                        const isUp = alive === true
                        return (
                        <div key={chain.name} className={`p-3 rounded-xl border transition-colors ${isUp ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5' : pending ? 'border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]' : 'border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                {pending ? <Loader2 className="w-3.5 h-3.5 text-[var(--color-text-muted)] animate-spin" /> :
                                 <CircleDot className={`w-3.5 h-3.5 ${isUp ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`} />}
                                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{chain.name}</span>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] font-mono">Chain ID: {chain.id}</p>
                            <span className={`inline-block mt-1 text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded ${
                                chain.status === 'Primary' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' :
                                isUp ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                                pending ? 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]' :
                                'bg-[var(--color-danger)]/20 text-[var(--color-danger)]'
                            }`}>{pending ? 'Checking...' : isUp ? chain.status : 'Offline'}</span>
                        </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Bridge Transfer Form */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Initiate Bridge Transfer</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1 block">From Chain</label>
                        <select value={fromChain} onChange={e => setFromChain(Number(e.target.value))}
                            className="w-full p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)]">
                            {CHAINS.filter(c => chainHealth[c.id] !== false).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center justify-center">
                        <ArrowLeftRight className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1 block">To Chain</label>
                        <select value={toChain} onChange={e => setToChain(Number(e.target.value))}
                            className="w-full p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)]">
                            {activeChains.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Amount (USDC)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] font-mono" />
                    </div>
                    <button onClick={handleTransfer} disabled={sending || !amount}
                        className="neon-btn px-4 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                        {sending ? 'Bridging...' : 'Bridge USDC'}
                    </button>
                </div>
                {lastResult && !lastResult.error && (
                    <div className="mt-4 p-3 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
                        <p className="text-sm text-[var(--color-success)] font-semibold">Transfer initiated: {lastResult.id}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">Burn TX: {lastResult.burn_tx?.slice(0, 20)}... — attestation in progress</p>
                    </div>
                )}
                {lastResult?.error && (
                    <div className="mt-4 p-3 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30">
                        <p className="text-sm text-[var(--color-danger)]">{lastResult.error}</p>
                    </div>
                )}
            </motion.div>

            {/* Transfer History */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Bridge Transfers ({transfers.length})</h3>
                {transfers.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] text-center py-6">No bridge transfers yet. Initiate one above.</p>
                ) : (
                    <div className="space-y-3">
                        {transfers.map((t) => (
                            <div key={t.id} className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-[var(--color-text-muted)]">{t.id}</span>
                                        <span className={`text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded ${
                                            t.status === 'completed' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                                            t.status === 'failed' ? 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]' :
                                            'bg-[var(--color-info)]/20 text-[var(--color-info)]'
                                        }`}>{t.status}</span>
                                    </div>
                                    <span className="font-mono text-sm font-bold text-[var(--color-accent)]">${t.amount?.toLocaleString()} USDC</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-3">
                                    <span>{t.from_chain_name}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                                    <span>{t.to_chain_name}</span>
                                </div>
                                {/* Step Progress */}
                                <div className="flex items-center gap-1">
                                    {t.steps?.map((step, i) => (
                                        <div key={step.step} className="flex items-center gap-1">
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded text-[0.6rem] font-semibold uppercase ${
                                                step.status === 'completed' ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' :
                                                step.status === 'in_progress' ? 'bg-[var(--color-info)]/15 text-[var(--color-info)]' :
                                                'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                                            }`}>
                                                {step.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> :
                                                 step.status === 'in_progress' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                                                 <Clock className="w-3 h-3" />}
                                                {step.step}
                                            </div>
                                            {i < t.steps.length - 1 && <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)]" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Why Arc */}
            <motion.div className="card-flat bg-gradient-to-br from-[var(--color-bg-secondary)] to-[rgba(249,115,22,0.05)]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Why Arc as Liquidity Hub</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">USDC Native Gas</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">No volatile token for fees. Costs are predictable in USD — perfect for autonomous agents.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Layers className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Sub-Second Finality</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">Malachite BFT delivers &lt;500ms finality — critical for real-time FX execution.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">CCTP V2 Native</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">Native USDC burns on source, mints on destination — no wrapped tokens, no liquidity pools.</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* External Links */}
            <div className="flex flex-wrap gap-3">
                <a href="https://docs.arc.network" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
                    Arc Docs <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a href="https://developers.circle.com/bridge-kit" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
                    CCTP V2 Docs <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
                    ArcScan <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    )
}
