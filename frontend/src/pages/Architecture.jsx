import { motion } from 'framer-motion'

const TECH_STACK = [
    { name: 'Solidity', desc: 'Smart Contracts on Arc' },
    { name: 'Python', desc: 'FastAPI + AI Agent' },
    { name: 'React', desc: 'Real-time Dashboard' },
    { name: 'Stork Oracle', desc: 'Price Feeds' },
    { name: 'StableFX', desc: 'USDC↔EURC Swaps' },
    { name: 'USYC', desc: 'T-Bill Yield Vault' },
    { name: 'Circle CPN', desc: 'Cross-border Payments' },
    { name: 'Arc Testnet', desc: 'Chain ID 5042002' },
]

const STEPS = [
    {
        num: '01',
        title: 'Market Data Ingestion',
        desc: 'Stork Oracle provides real-time USDC/EURC FX rates and USYC yield data via WebSocket and HTTP APIs. The agent continuously monitors these feeds for actionable signals.',
    },
    {
        num: '02',
        title: 'AI Decision Engine',
        desc: 'The Python agent analyzes market conditions, treasury balances, and payment obligations. It uses rule-based strategies (with ML forecasting planned) to decide: deposit idle capital to USYC, swap USDC→EURC at favorable rates, or withdraw for upcoming payments.',
    },
    {
        num: '03',
        title: 'On-Chain Execution',
        desc: 'Decisions are executed atomically on the ArcTreasury smart contract. The vault handles StableFX swaps, USYC vault deposits/withdrawals, and maintains access control so only the agent wallet can execute.',
    },
]

function ArchBox({ children, accent, className = '' }) {
    return (
        <div className={`relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors duration-200 ${className}`}>
            {accent && <div className="absolute inset-0 rounded-2xl hatched-subtle" />}
            <div className="relative">{children}</div>
        </div>
    )
}

function Arrow() {
    return (
        <div className="flex items-center justify-center">
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                <path d="M0 10 H32 M26 4 L34 10 L26 16" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    )
}

export default function Architecture() {
    return (
        <div className="max-w-[1100px] mx-auto space-y-8">
            <div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-1">System Architecture</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">How ArcTreasury's autonomous agent manages your treasury</p>
            </div>

            {/* Architecture diagram */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Inputs */}
                <ArchBox>
                    <p className="text-[0.65rem] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-2">Data Sources</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Stork Oracle</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">FX rates, yield data</p>
                    <div className="mt-3 border-t border-[var(--color-border-light)] pt-2">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Obligations</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Payment schedule</p>
                    </div>
                </ArchBox>

                <Arrow />

                {/* AI Agent (hero) */}
                <ArchBox accent className="md:col-span-1">
                    <p className="text-[0.65rem] uppercase tracking-wider text-[var(--color-accent)] font-semibold mb-2">AI Engine</p>
                    <p className="text-base font-bold text-[var(--color-text-primary)] mb-2">Python Agent</p>
                    <ul className="space-y-1">
                        <li className="text-xs text-[var(--color-text-secondary)]">• FX Forecasting</li>
                        <li className="text-xs text-[var(--color-text-secondary)]">• Risk Assessment</li>
                        <li className="text-xs text-[var(--color-text-secondary)]">• Decision Engine</li>
                        <li className="text-xs text-[var(--color-text-secondary)]">• Obligation Mgmt</li>
                    </ul>
                </ArchBox>

                <Arrow />

                {/* Treasury Vault */}
                <ArchBox>
                    <p className="text-[0.65rem] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-2">On-Chain</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Treasury Vault</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-2">Solidity on Arc</p>
                    <ul className="space-y-1">
                        <li className="text-xs text-[var(--color-text-secondary)]">• USDC / EURC / USYC</li>
                        <li className="text-xs text-[var(--color-text-secondary)]">• StableFX Swaps</li>
                        <li className="text-xs text-[var(--color-text-secondary)]">• USYC Yield Vault</li>
                        <li className="text-xs text-[var(--color-text-secondary)]">• Access Control</li>
                    </ul>
                </ArchBox>
            </motion.div>

            {/* Dashboard connection */}
            <div className="flex justify-center">
                <div className="flex flex-col items-center gap-2">
                    <svg width="2" height="30" viewBox="0 0 2 30"><line x1="1" y1="0" x2="1" y2="30" stroke="#F97316" strokeWidth="2" strokeDasharray="4 4" /></svg>
                    <ArchBox className="w-64 text-center">
                        <p className="text-[0.65rem] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1">Frontend</p>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">React Dashboard</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Real-time monitoring + WebSocket</p>
                    </ArchBox>
                </div>
            </div>

            {/* Data flow steps */}
            <div>
                <h3 className="font-heading text-lg font-semibold mb-4">Data Flow</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {STEPS.map((step, i) => (
                        <motion.div
                            key={step.num}
                            className="card"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08 }}
                        >
                            <span className="font-mono text-2xl font-bold text-[var(--color-accent)] opacity-30">{step.num}</span>
                            <h4 className="font-heading text-sm font-semibold text-[var(--color-text-primary)] mt-2 mb-2">{step.title}</h4>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Tech stack */}
            <div>
                <h3 className="font-heading text-lg font-semibold mb-4">Tech Stack</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TECH_STACK.map((t, i) => (
                        <motion.div
                            key={t.name}
                            className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * i }}
                        >
                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Circle integration */}
            <div className="card-flat">
                <h3 className="font-heading text-lg font-semibold mb-3">Circle Integration Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">USYC (Hashnote)</p>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Tokenized US T-Bills providing institutional-grade yield on idle USDC. The agent autonomously parks surplus capital for 4.5% APY.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">StableFX (Arc)</p>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">On-chain USDC↔EURC swap router. The agent monitors FX rates and executes swaps at optimal times to pre-fund EURC obligations.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Circle Payments Network</p>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Global payout rail for cross-border payments. Obligations funded by the treasury can be settled instantly via CPN bridges.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
