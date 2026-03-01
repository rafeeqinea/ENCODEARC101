import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Globe, Key, Server, CheckCircle2, XCircle, Shield, RefreshCw, ExternalLink, Copy, Check, Save, Sliders, Loader2 } from 'lucide-react'
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

function Toggle({ value, onChange, label }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-secondary)]">
            <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
            <button onClick={() => onChange(!value)}
                className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
        </div>
    )
}

export default function SettingsPage() {
    const navigate = useNavigate()
    const [wallet, setWallet] = useState(null)
    const [checking, setChecking] = useState(true)
    const [settings, setSettings] = useState(null)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [health, setHealth] = useState(null)

    useEffect(() => {
        async function load() {
            try {
                const [w, s, h] = await Promise.all([api.getWallet(), api.getSettings(), api.getHealth()])
                setWallet(w)
                setSettings(s)
                setHealth(h)
            } catch { }
            setChecking(false)
        }
        load()
        // Re-check health every 30s
        const iv = setInterval(async () => {
            try { setHealth(await api.getHealth()) } catch {}
        }, 30000)
        return () => clearInterval(iv)
    }, [])

    const handleSave = async () => {
        if (!settings) return
        setSaving(true)
        try {
            await api.updateSettings(settings)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch { }
        setSaving(false)
    }

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const contracts = {
        treasury: '0x624bfC2a364C83c42F980F878c2177F76230dd44',
        usdc: '0xe91eEBa8C8D3fD2Aed35319AD106Cf1bf29eAdd6',
        eurc: '0x7B70323630E887f514A33388B99dd86CA0855E23',
        usyc: '0x17ae4a6987d10044340AAbFB4108F77e85313E90',
    }

    const integrations = [
        { name: 'Arc Testnet RPC', endpoint: 'rpc.testnet.arc.network', status: health ? health.arc_rpc : undefined },
        { name: 'Circle StableFX', endpoint: 'api-sandbox.circle.com', status: health ? health.circle_stablefx : undefined },
        { name: 'Stork Oracle', endpoint: 'rest.jp.stork-oracle.network', status: health ? health.stork_oracle : undefined },
        { name: 'Ollama AI', endpoint: 'localhost:11434 (local)', status: health ? health.ollama_ai : undefined },
        { name: 'CCTP V2 Bridge', endpoint: 'iris-api-sandbox.circle.com', status: health ? health.cctp_bridge : undefined },
        { name: 'USYC Teller', endpoint: 'Ethereum Sepolia (arch. integrated)', status: health ? health.usyc_teller : undefined },
        { name: 'Circle CPN', endpoint: 'Conceptual integration', status: health ? health.cpn : null },
    ]

    return (
        <div className="max-w-[1100px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-1">Settings</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">Agent parameters, network config, and integrations</p>
                </div>
                {settings && (
                    <button onClick={handleSave} disabled={saving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                            saved ? 'bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/40' :
                            'neon-btn bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'
                        }`}>
                        {saved ? <><Check className="w-4 h-4" /> Saved</> :
                         saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> :
                         <><Save className="w-4 h-4" /> Save Settings</>}
                    </button>
                )}
            </div>

            {/* Agent Strategy Settings */}
            {settings && (
                <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Sliders className="w-5 h-5 text-[var(--color-accent)]" />
                        <h3 className="font-heading text-base font-semibold">Agent Strategy</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Risk Tolerance</span>
                            <select value={settings.risk_tolerance} onChange={e => updateSetting('risk_tolerance', e.target.value)}
                                className="bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text-primary)] font-semibold px-3 py-1 rounded-lg border border-[var(--color-border)]">
                                <option value="conservative">Conservative</option>
                                <option value="moderate">Moderate</option>
                                <option value="aggressive">Aggressive</option>
                            </select>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Rebalance Threshold (%)</span>
                            <input type="number" step="0.5" min="1" max="20"
                                value={settings.rebalance_threshold} onChange={e => updateSetting('rebalance_threshold', parseFloat(e.target.value))}
                                className="w-20 bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text-primary)] font-mono font-semibold px-3 py-1 rounded-lg border border-[var(--color-border)] text-right" />
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Max Single Trade ($)</span>
                            <input type="number" step="1000" min="1000" max="1000000"
                                value={settings.max_single_trade} onChange={e => updateSetting('max_single_trade', parseFloat(e.target.value))}
                                className="w-28 bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text-primary)] font-mono font-semibold px-3 py-1 rounded-lg border border-[var(--color-border)] text-right" />
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Min Liquidity Buffer ($)</span>
                            <input type="number" step="5000" min="5000" max="500000"
                                value={settings.min_liquidity_buffer} onChange={e => updateSetting('min_liquidity_buffer', parseFloat(e.target.value))}
                                className="w-28 bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text-primary)] font-mono font-semibold px-3 py-1 rounded-lg border border-[var(--color-border)] text-right" />
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                            <span className="text-sm text-[var(--color-text-secondary)]">Agent Cycle Interval (sec)</span>
                            <input type="number" step="5" min="10" max="300"
                                value={settings.agent_interval} onChange={e => updateSetting('agent_interval', parseInt(e.target.value))}
                                className="w-20 bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text-primary)] font-mono font-semibold px-3 py-1 rounded-lg border border-[var(--color-border)] text-right" />
                        </div>
                        <Toggle value={settings.auto_yield} onChange={v => updateSetting('auto_yield', v)} label="Auto Yield Optimization" />
                        <Toggle value={settings.auto_fx} onChange={v => updateSetting('auto_fx', v)} label="Auto FX Hedging" />
                    </div>
                </motion.div>
            )}

            {/* Notifications */}
            {settings && (
                <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
                    <h3 className="font-heading text-base font-semibold mb-4">Notifications</h3>
                    <div className="space-y-3">
                        <Toggle value={settings.notification_decisions} onChange={v => updateSetting('notification_decisions', v)} label="Agent Decision Alerts" />
                        <Toggle value={settings.notification_obligations} onChange={v => updateSetting('notification_obligations', v)} label="Obligation Due Alerts" />
                        <Toggle value={settings.notification_risk} onChange={v => updateSetting('notification_risk', v)} label="Risk Threshold Alerts" />
                    </div>
                </motion.div>
            )}

            {/* Network & Wallet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
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
                            <span className="text-sm text-[var(--color-text-secondary)]">Finality</span>
                            <span className="text-sm font-semibold text-[var(--color-success)]">&lt;500ms</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
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
                                ) : int.status === undefined ? (
                                    <Loader2 className="w-3 h-3 text-[var(--color-text-muted)] animate-spin" />
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
