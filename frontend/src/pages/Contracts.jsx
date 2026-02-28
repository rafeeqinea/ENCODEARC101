import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileCode2, ShieldCheck, ExternalLink, Copy, Check, Layers, Lock, Unlock, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Eye } from 'lucide-react'

function CopyBtn({ text }) {
    const [c, setC] = useState(false)
    return (
        <button onClick={() => { navigator.clipboard.writeText(text); setC(true); setTimeout(() => setC(false), 2000) }}
            className="p-1 rounded hover:bg-[var(--color-bg-secondary)] transition-colors">
            {c ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />}
        </button>
    )
}

const CONTRACTS = [
    { name: 'ArcTreasury', addr: '0x624bfC2a364C83c42F980F878c2177F76230dd44', desc: 'Main vault — holds USDC, EURC, USYC; executes agent decisions', type: 'Vault' },
    { name: 'MockUSDC', addr: '0xe91eEBa8C8D3fD2Aed35319AD106Cf1bf29eAdd6', desc: 'ERC20 USDC token on Arc Testnet', type: 'Token' },
    { name: 'MockEURC', addr: '0x7B70323630E887f514A33388B99dd86CA0855E23', desc: 'ERC20 EURC token on Arc Testnet', type: 'Token' },
    { name: 'MockUSYC', addr: '0x17ae4a6987d10044340AAbFB4108F77e85313E90', desc: 'ERC20 USYC token on Arc Testnet', type: 'Token' },
]

const FUNCTIONS = [
    { name: 'deposit(token, amount)', access: 'Agent', icon: ArrowDownToLine, desc: 'Deposits ERC20 tokens into the treasury vault', security: ['nonReentrant', 'onlyAgent'] },
    { name: 'withdraw(token, amount, to)', access: 'Agent', icon: ArrowUpFromLine, desc: 'Conditional withdrawal — funds obligations when due', security: ['nonReentrant', 'onlyAgent'] },
    { name: 'swapFX(from, to, amountIn)', access: 'Agent', icon: ArrowLeftRight, desc: 'Routes tokens through StableFX router for atomic USDC↔EURC swaps', security: ['nonReentrant', 'onlyAgent'] },
    { name: 'depositToYield(amount)', access: 'Agent', icon: ArrowDownToLine, desc: 'Parks idle USDC into USYC vault for 4.5% APY T-Bill yield', security: ['nonReentrant', 'onlyAgent'] },
    { name: 'withdrawFromYield(amount)', access: 'Agent', icon: ArrowUpFromLine, desc: 'Redeems USYC back to USDC for payout funding', security: ['nonReentrant', 'onlyAgent'] },
    { name: 'getBalances()', access: 'Public', icon: Eye, desc: 'Returns current treasury balances for USDC, EURC, USYC', security: ['view'] },
    { name: 'setAgent(newAgent)', access: 'Owner', icon: Lock, desc: 'Updates authorized AI agent address — owner-only governance', security: ['onlyOwner'] },
]

const SECURITY = [
    { feature: 'ReentrancyGuard', desc: 'All state-changing functions protected via OpenZeppelin nonReentrant modifier', icon: ShieldCheck },
    { feature: 'Agent-Gated Access', desc: 'Only the designated agent wallet or owner can execute treasury operations', icon: Lock },
    { feature: 'Immutable Token Refs', desc: 'USDC, EURC, USYC addresses set as immutable in constructor — zero storage reads', icon: Layers },
    { feature: 'Event Audit Trail', desc: 'Every operation emits typed events for off-chain indexing and compliance', icon: FileCode2 },
]

export default function Contracts() {
    const [expandedFn, setExpandedFn] = useState(null)

    return (
        <div className="max-w-[1100px] mx-auto space-y-6">
            <div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-1">Smart Contracts</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">Deployed on Arc Testnet — Solidity 0.8.20 with OpenZeppelin security</p>
            </div>

            {/* Deployed Contracts */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Deployed Contracts</h3>
                <div className="space-y-3">
                    {CONTRACTS.map((c) => (
                        <div key={c.name} className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] hover:border-[var(--color-accent)] transition-colors">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-heading text-sm font-bold text-[var(--color-text-primary)]">{c.name}</span>
                                    <span className={`text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded ${c.type === 'Vault' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'bg-[var(--color-info)]/20 text-[var(--color-info)]'}`}>{c.type}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <CopyBtn text={c.addr} />
                                    <a href={`https://testnet.arcscan.app/address/${c.addr}`} target="_blank" rel="noopener noreferrer"
                                       className="p-1 rounded hover:bg-[var(--color-bg-tertiary)] transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                                    </a>
                                </div>
                            </div>
                            <p className="font-mono text-xs text-[var(--color-text-muted)] mb-1">{c.addr}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Function Matrix */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Contract Function Matrix</h3>
                <div className="space-y-2">
                    {FUNCTIONS.map((fn) => {
                        const Icon = fn.icon
                        const isExpanded = expandedFn === fn.name
                        return (
                            <div key={fn.name}
                                className="rounded-xl border border-[var(--color-border-light)] overflow-hidden hover:border-[var(--color-accent)]/50 transition-colors cursor-pointer"
                                onClick={() => setExpandedFn(isExpanded ? null : fn.name)}>
                                <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-secondary)]">
                                    <Icon className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                                    <code className="text-sm font-mono text-[var(--color-accent)] flex-1">{fn.name}</code>
                                    <span className={`text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded ${
                                        fn.access === 'Owner' ? 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]' :
                                        fn.access === 'Agent' ? 'bg-[var(--color-info)]/20 text-[var(--color-info)]' :
                                        'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                                    }`}>{fn.access}</span>
                                </div>
                                {isExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-3 pb-3 bg-[var(--color-surface)]">
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-2 mb-2">{fn.desc}</p>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {fn.security.map((s) => (
                                                <span key={s} className="text-[0.6rem] font-mono px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border-light)]">{s}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Security Features */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Security Architecture</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SECURITY.map((s) => {
                        const Icon = s.icon
                        return (
                            <div key={s.feature} className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className="w-4 h-4 text-[var(--color-success)]" />
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{s.feature}</p>
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{s.desc}</p>
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Solidity Code Preview */}
            <motion.div className="card-flat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h3 className="font-heading text-base font-semibold mb-4">Contract Source</h3>
                <div className="rounded-xl bg-[#1a1a2e] p-4 overflow-x-auto">
                    <pre className="text-xs font-mono text-gray-300 leading-relaxed">{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ArcTreasury is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;
    IERC20 public immutable eurc;
    IERC20 public immutable usyc;
    address public agent;

    event FundsDeposited(address token, uint256 amount);
    event FundsWithdrawn(address token, uint256 amount, address to);
    event FXSwapExecuted(address from, address to, uint256 amountIn);
    event YieldDeposited(uint256 amount);
    event YieldWithdrawn(uint256 amount);
    event AgentUpdated(address newAgent);

    modifier onlyAgent() {
        require(msg.sender == agent || msg.sender == owner(),
                "Not authorized");
        _;
    }
    // ... full source at contracts/ArcTreasury.sol
}`}</pre>
                </div>
            </motion.div>

            {/* ArcScan Link */}
            <div className="card-flat bg-[var(--color-bg-secondary)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-heading text-base font-semibold mb-1">Verify on ArcScan</h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">View all deployed contracts and transactions on the Arc Testnet block explorer</p>
                    </div>
                    <a href="https://testnet.arcscan.app/address/0x624bfC2a364C83c42F980F878c2177F76230dd44" target="_blank" rel="noopener noreferrer"
                       className="neon-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors">
                        Open ArcScan <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </div>
    )
}
