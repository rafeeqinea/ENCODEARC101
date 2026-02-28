import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Globe, Key, Server, CheckCircle2, XCircle, Shield, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'

function StatusDot({ ok }) {
    return (
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`} />
    )
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)
    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <button onClick={handleCopy} className="p-1 rounded hover:bg-[var(--color-bg-secondary)] transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />}
        </button>
    )
}

export default function SettingsPage() {
    const navigate = useNavigate()
    const [wallet, setWallet] = useState(null)
    const [status, setStatus] = useState(null)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const [w, s] = await Promise.all([api.getWallet(), api.getStatus()])
                setWallet(w)
                setStatus(s)
            } catch { }
            setChecking(false)
        }
        load()
    }, [])

    const contracts = {
        treasury: '0x624bfC2a364C83c42F980F878c2177F76230dd44',
        usdc: '0xe91eEBa8C8D3fD2Aed35319AD106Cf1bf29eAdd6',
        eurc: '0x7B70323630E887f514A33388B99dd86CA0855E23',
        usyc: '0x17ae4a6987d10044340AAbFB4108F77e85313E90',
    }

    const integrations = [
        { name: 'Arc Testnet RPC', endpoint: 'rpc.testnet.arc.network', status: wallet?.blockchain_available },
        { name: 'Circle StableFX', endpoint: 'api-sandbox.circle.com', status: true },
        { name: 'Stork Oracle', endpoint: 'rest.jp.stork-oracle.network', status: true },
        { name: 'Gemini AI', endpoint: 'generativelanguage.googleapis.com', status: true },
        { name: 'USYC Teller', endpoint: 'Ethereum Sepolia (arch. integrated)', status: true },
        { name: 'Circle CPN', endpoint: 'Conceptual integration', status: null },
    ]

    return (
        <div className="max-w-[1100px] mx-auto space-y-6">
            <div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-1">Settings</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">Network configuration, integrations, and wallet management</p>
            </div>

            {/* Network & Wallet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-[var(--color-accent)]" />
                        <h3 className="font-heading text-base font-semibold">Network</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Chain</span>
                            <span className="font-mono text-sm font-semibold">Arc Testnet</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Chain ID</span>
                            <span className="font-mono text-sm font-semibold">5042002</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">RPC</span>
                            <span className="font-mono text-xs">rpc.testnet.arc.network</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Gas Token</span>
                            <span className="font-mono text-sm font-semibold">USDC (native)</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Consensus</span>
                            <span className="font-mono text-sm font-semibold">Malachite BFT</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Finality</span>
                            <span className="text-sm font-semibold text-[var(--color-success)]">&lt;500ms</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-[var(--color-accent)]" />
                        <h3 className="font-heading text-base font-semibold">Agent Wallet</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Address</p>
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-[var(--color-text-primary)] truncate flex-1">{wallet?.address || '...'}</p>
                                {wallet?.address && <CopyButton text={wallet.address} />}
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Gas Balance</span>
                            <span className="font-mono text-sm font-semibold">{wallet?.balance_usdc?.toFixed(4) || '0'} USDC</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Blockchain</span>
                            <div className="flex items-center gap-1.5">
                                <StatusDot ok={wallet?.blockchain_available} />
                                <span className="text-sm">{wallet?.blockchain_available ? 'Connected' : 'Offline'}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Data Source</span>
                            <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${wallet?.source === 'on-chain' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'}`}>
                                {wallet?.source || 'seed'}
                            </span>
                        </div>
                        <a href={`https://testnet.arcscan.app/address/${wallet?.address}`} target="_blank" rel="noopener noreferrer"
                           className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
                            View on ArcScan <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Deployed Contracts */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-2 mb-4">
                    <Server className="w-5 h-5 text-[var(--color-accent)]" />
                    <h3 className="font-heading text-base font-semibold">Deployed Contracts</h3>
                </div>
                <div className="space-y-2">
                    {Object.entries(contracts).map(([name, addr]) => (
                        <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
                            <div>
                                <p className="text-sm font-semibold text-[var(--color-text-primary)] capitalize">{name === 'treasury' ? 'ArcTreasury Vault' : name.toUpperCase()}</p>
                                <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">{addr}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <CopyButton text={addr} />
                                <a href={`https://testnet.arcscan.app/address/${addr}`} target="_blank" rel="noopener noreferrer"
                                   className="p-1 rounded hover:bg-[var(--color-bg-secondary)] transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Integration Status */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center gap-2 mb-4">
                    <Key className="w-5 h-5 text-[var(--color-accent)]" />
                    <h3 className="font-heading text-base font-semibold">Integration Status</h3>
                </div>
                <div className="space-y-2">
                    {integrations.map((int) => (
                        <div key={int.name} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <div className="flex items-center gap-3">
                                {int.status === null ? (
                                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-text-muted)]" />
                                ) : (
                                    <StatusDot ok={int.status} />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{int.name}</p>
                                    <p className="text-xs text-[var(--color-text-muted)] font-mono">{int.endpoint}</p>
                                </div>
                            </div>
                            <span className={`text-[0.65rem] font-semibold uppercase px-2 py-0.5 rounded ${
                                int.status === null ? 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]' :
                                int.status ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                                'bg-[var(--color-danger)]/20 text-[var(--color-danger)]'
                            }`}>
                                {int.status === null ? 'Conceptual' : int.status ? 'Active' : 'Offline'}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Disconnect */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="font-heading text-base font-semibold mb-3 text-[var(--color-danger)]">Danger Zone</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">Disconnect your wallet and return to the landing page.</p>
                <button
                    onClick={() => {
                        sessionStorage.removeItem('arc-wallet')
                        sessionStorage.removeItem('arc-loaded')
                        navigate('/')
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[var(--color-danger)]/40 text-[var(--color-danger)] text-sm font-semibold hover:bg-[var(--color-danger)]/10 transition-colors"
                >
                    Disconnect Wallet
                </button>
            </motion.div>
        </div>
    )
}
