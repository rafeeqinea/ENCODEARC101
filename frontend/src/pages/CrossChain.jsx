import { motion } from 'framer-motion'
import { Globe, ArrowRight, Layers, Zap, ShieldCheck, ExternalLink, CircleDot } from 'lucide-react'

const CHAINS = [
    { name: 'Arc Testnet', id: '5042002', status: 'Primary', active: true },
    { name: 'Ethereum Sepolia', id: '11155111', status: 'USYC Source', active: true },
    { name: 'Polygon', id: '137', status: 'Gateway Ready', active: false },
    { name: 'Arbitrum', id: '42161', status: 'Gateway Ready', active: false },
    { name: 'Base', id: '8453', status: 'Gateway Ready', active: false },
    { name: 'Avalanche', id: '43114', status: 'Gateway Ready', active: false },
]

const FLOW_STEPS = [
    {
        num: '01',
        title: 'Capital Sourcing',
        desc: 'USDC enters the ArcTreasury vault from any supported chain via Circle Gateway or direct deposit on Arc.',
        tools: ['USDC', 'Circle Gateway', 'Circle Wallets'],
    },
    {
        num: '02',
        title: 'Intelligent Routing',
        desc: 'The AI agent evaluates balances, FX rates, and obligations to determine optimal capital allocation across yield vaults and currencies.',
        tools: ['Gemini AI', 'Stork Oracle', 'StableFX'],
    },
    {
        num: '03',
        title: 'Cross-Currency Settlement',
        desc: 'When EURC obligations arise, USDC is atomically swapped via StableFX. Yield surplus moves to USYC vault. All on one interface.',
        tools: ['StableFX', 'USYC', 'Arc Bridge Kit'],
    },
    {
        num: '04',
        title: 'Multi-Chain Payout',
        desc: 'Funded obligations settle on the destination chain with sub-second finality on Arc, or via CCTP/Gateway for cross-chain delivery.',
        tools: ['CCTP', 'Arc', 'Circle CPN'],
    },
]

const PRODUCTS = [
    { name: 'USDC', desc: 'Base treasury currency and native gas on Arc', role: 'Settlement layer' },
    { name: 'EURC', desc: 'European stablecoin for cross-currency obligations', role: 'Multi-currency' },
    { name: 'USYC', desc: 'Tokenized T-Bills — 4.5% APY for idle capital', role: 'Yield optimization' },
    { name: 'StableFX', desc: 'Institutional USDC↔EURC FX engine', role: 'Currency conversion' },
    { name: 'Circle Gateway', desc: 'Unified USDC balance across multiple chains', role: 'Chain abstraction' },
    { name: 'Circle Wallets', desc: 'Programmable wallet infrastructure for agents', role: 'Key management' },
    { name: 'Arc Bridge Kit', desc: 'Cross-chain asset bridging on Arc', role: 'Interoperability' },
    { name: 'CCTP', desc: 'Cross-chain transfer protocol for native USDC', role: 'Cross-chain' },
]

function FlowArrow() {
    return (
        <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-[var(--color-accent)] opacity-50" />
        </div>
    )
}

export default function CrossChain() {
    return (
        <div className="max-w-[1100px] mx-auto space-y-6">
            <div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-1">Cross-Chain & Gateway</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">Arc as a unified liquidity hub — one treasury surface, multiple chains</p>
            </div>

            {/* Chain Status Grid */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Supported Chains</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CHAINS.map((chain) => (
                        <div key={chain.name} className={`p-3 rounded-xl border transition-colors ${chain.active ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5' : 'border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <CircleDot className={`w-3.5 h-3.5 ${chain.active ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`} />
                                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{chain.name}</span>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] font-mono">Chain ID: {chain.id}</p>
                            <span className={`inline-block mt-1 text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded ${
                                chain.status === 'Primary' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' :
                                chain.active ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                                'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]'
                            }`}>{chain.status}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Capital Flow Diagram */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Capital Flow Pipeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-stretch">
                    {FLOW_STEPS.map((step, i) => (
                        <>
                            <div key={step.num} className={`p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] ${i === 0 ? '' : ''}`}>
                                <span className="font-mono text-xl font-bold text-[var(--color-accent)] opacity-30">{step.num}</span>
                                <h4 className="font-heading text-sm font-semibold text-[var(--color-text-primary)] mt-1 mb-2">{step.title}</h4>
                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">{step.desc}</p>
                                <div className="flex flex-wrap gap-1">
                                    {step.tools.map(t => (
                                        <span key={t} className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border border-[var(--color-border-light)]">{t}</span>
                                    ))}
                                </div>
                            </div>
                            {i < FLOW_STEPS.length - 1 && <FlowArrow key={`arrow-${i}`} />}
                        </>
                    ))}
                </div>
            </motion.div>

            {/* Circle Product Map */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Circle Product Integration Map</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {PRODUCTS.map((p) => (
                        <div key={p.name} className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] hover:border-[var(--color-accent)]/40 transition-colors">
                            <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1">{p.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-2">{p.desc}</p>
                            <span className="text-[0.6rem] font-semibold uppercase px-1.5 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)]">{p.role}</span>
                        </div>
                    ))}
                </div>
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
                            <p className="text-xs text-[var(--color-text-secondary)]">Malachite BFT consensus delivers &lt;500ms finality — critical for real-time FX execution.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Selective Privacy</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">Shield treasury balances and operations selectively while maintaining compliance.</p>
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
                <a href="https://developers.circle.com/gateway" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
                    Circle Gateway <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a href="https://developers.circle.com/bridge-kit" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
                    Bridge Kit <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
                    ArcScan <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    )
}
