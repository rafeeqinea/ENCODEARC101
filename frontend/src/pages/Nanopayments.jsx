import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Banknote, ArrowRight, Clock, Globe, ShieldCheck, Zap, Layers, ExternalLink, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

const NANO_FEATURES = [
    {
        icon: Zap,
        title: 'Sub-Dollar Settlements',
        desc: 'Agent handles micropayments as small as $0.01 USDC — vendor invoices, streaming yield, fractional payouts.',
    },
    {
        icon: Clock,
        title: '30-Second Evaluation Loop',
        desc: 'Every 30 seconds the AI agent evaluates pending obligations, enabling high-frequency micro-settlement.',
    },
    {
        icon: Globe,
        title: 'Cross-Border Ready',
        desc: 'USDC micropayments settle on Arc with sub-second finality, ready for CPN cross-border routing.',
    },
    {
        icon: ShieldCheck,
        title: 'Auditable Trail',
        desc: 'Every nanopayment links to an AI decision with confidence score, reasoning, and on-chain tx hash.',
    },
]

const getCpnFlow = (health) => [
    { step: 'Quote', desc: 'Agent requests FX quote from StableFX for cross-border obligation', status: health ? (health.circle_stablefx ? 'active' : 'offline') : 'loading' },
    { step: 'Create', desc: 'Payment intent created with amount, currency, and recipient address', status: health ? (health.ollama_ai ? 'active' : 'offline') : 'loading' },
    { step: 'Route', desc: 'CPN selects optimal BFI (Beneficiary Financial Institution) path', status: health ? (health.cpn ? 'active' : 'conceptual') : 'loading' },
    { step: 'Settle', desc: 'USDC transferred on-chain via ArcTreasury.withdraw()', status: health ? (health.arc_rpc ? 'active' : 'offline') : 'loading' },
    { step: 'Confirm', desc: 'WebSocket broadcasts payment confirmation to dashboard', status: health ? (health.arc_rpc ? 'active' : 'offline') : 'loading' },
]

const EXAMPLE_PAYOUTS = [
    { recipient: 'Vendor-EU-014', amount: '$0.50', currency: 'EURC', type: 'Micropayment', time: '< 1s' },
    { recipient: 'SaaS-Monthly', amount: '$2,499.00', currency: 'USDC', type: 'Recurring', time: '< 1s' },
    { recipient: 'Yield-Accrual', amount: '$0.21', currency: 'USDC', type: 'Streaming', time: '30s cycle' },
    { recipient: 'Freelancer-007', amount: '$150.00', currency: 'USDC', type: 'Conditional', time: '< 1s' },
    { recipient: 'EU-Office-Rent', amount: '$12,500.00', currency: 'EURC', type: 'Scheduled', time: 'On due date' },
]

export default function Nanopayments() {
    const [health, setHealth] = useState(null);

    useEffect(() => {
        const fetchHealth = () => api.getHealth().then(setHealth).catch(() => {});
        fetchHealth();
        const id = setInterval(fetchHealth, 30000);
        return () => clearInterval(id);
    }, []);

    const CPN_FLOW = getCpnFlow(health);

    return (
        <div className="max-w-[1100px] mx-auto space-y-6">
            <div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-1">Nanopayments</h2>
                <div className="flex items-center gap-2">
                    <p className="text-sm text-[var(--color-text-secondary)]">Circle CPN-ready micro-settlement infrastructure</p>
                    <span className="text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)]">Bonus Track</span>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NANO_FEATURES.map((f, i) => {
                    const Icon = f.icon
                    return (
                        <motion.div key={f.title} className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-[var(--color-accent)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-[var(--color-accent)]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{f.title}</h3>
                                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* CPN Payment Flow */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="font-heading text-base font-semibold mb-4">CPN Payment Flow</h3>
                <div className="flex flex-col md:flex-row items-stretch gap-2">
                    {CPN_FLOW.map((step, i) => (
                        <div key={step.step} className="flex-1 flex items-center gap-2">
                            <div className={`flex-1 p-3 rounded-xl border ${
                                step.status === 'active' ? 'border-[var(--color-success)]/40 bg-[var(--color-success)]/5' :
                                step.status === 'conceptual' ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5' :
                                step.status === 'offline' ? 'border-red-500/30 bg-red-500/5' :
                                'border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]'
                            }`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs font-bold text-[var(--color-accent)]">{i + 1}</span>
                                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">{step.step}</span>
                                    {step.status === 'loading' ? <Loader2 className="w-3 h-3 animate-spin text-[var(--color-text-muted)]" /> : (
                                    <span className={`text-[0.5rem] font-bold uppercase px-1 py-0.5 rounded ${
                                        step.status === 'active' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                                        step.status === 'conceptual' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' :
                                        step.status === 'offline' ? 'bg-red-500/20 text-red-400' :
                                        'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]'
                                    }`}>
                                        {step.status}
                                    </span>
                                    )}
                                </div>
                                <p className="text-[0.65rem] text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
                            </div>
                            {i < CPN_FLOW.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-[var(--color-accent)] opacity-40 flex-shrink-0 hidden md:block" />
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Example Payouts Table */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Example Agent Payouts</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Recipient</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Amount</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Currency</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Type</th>
                                <th className="py-2 px-3 text-[0.65rem] font-semibold text-[var(--color-text-muted)] uppercase">Settlement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {EXAMPLE_PAYOUTS.map((p, i) => (
                                <tr key={i} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                    <td className="py-2.5 px-3 text-sm font-mono">{p.recipient}</td>
                                    <td className="py-2.5 px-3 text-sm font-mono font-semibold">{p.amount}</td>
                                    <td className="py-2.5 px-3">
                                        <span className="badge badge-info text-[0.6rem]">{p.currency}</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-sm text-[var(--color-text-secondary)]">{p.type}</td>
                                    <td className="py-2.5 px-3 text-sm font-mono text-[var(--color-success)]">{p.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Yield Streaming */}
            <motion.div className="card-flat bg-gradient-to-br from-[var(--color-bg-secondary)] to-[rgba(249,115,22,0.05)]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-start gap-3">
                    <Banknote className="w-6 h-6 text-[var(--color-accent)] flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-heading text-base font-semibold mb-2">Yield-to-Payment Streaming</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
                            USYC yield accrues approximately <strong className="text-[var(--color-text-primary)]">$0.21 every 30 seconds</strong> at 4.5% APY on $150K deposited.
                            This earned yield is automatically routed to fulfill nano-sized obligations — creating a continuous stream of micro-settlements backed by real-world T-Bill returns.
                        </p>
                        <div className="flex gap-4">
                            <div className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                                <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">Per Cycle</p>
                                <p className="font-mono text-lg font-bold text-[var(--color-success)]">$0.21</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                                <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">Per Hour</p>
                                <p className="font-mono text-lg font-bold text-[var(--color-success)]">$25.34</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                                <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">Per Day</p>
                                <p className="font-mono text-lg font-bold text-[var(--color-success)]">$608.22</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* External Links */}
            <div className="flex flex-wrap gap-3">
                <a href="https://developers.circle.com/cpn" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
                    Circle CPN Docs <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a href="https://developers.circle.com/stablecoins/usdc-contract-addresses" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
                    USDC Contracts <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    )
}
