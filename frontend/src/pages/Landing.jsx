import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ShieldAlert, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ethers } from 'ethers';
import ArcLogo from '../components/ArcLogo';

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6 relative overflow-hidden group"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
        <div className="w-12 h-12 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-[var(--color-accent)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            {desc}
        </p>
    </motion.div>
);

export default function Landing() {
    const navigate = useNavigate();
    const [isConnecting, setIsConnecting] = useState(false);
    const [address, setAddress] = useState(null);
    const [error, setError] = useState(null);

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            if (!window.ethereum) {
                setError("No wallet detected. Please install MetaMask to connect.");
                setIsConnecting(false);
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            
            // Request Arc Testnet chain switch
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x4cef52' }], // 5042002
                });
            } catch (switchErr) {
                // Chain not added — add it
                if (switchErr.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x4cef52',
                            chainName: 'Arc Testnet',
                            nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                            rpcUrls: ['https://rpc.testnet.arc.network'],
                            blockExplorerUrls: ['https://testnet.arcscan.app'],
                        }],
                    });
                }
            }

            const accounts = await provider.send("eth_requestAccounts", []);

            if (accounts.length > 0) {
                const addr = accounts[0];
                const formatted = `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
                setAddress(formatted);
                sessionStorage.setItem('arc-wallet', addr);
                setTimeout(() => navigate('/dashboard'), 1500);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to connect wallet.");
            setIsConnecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-accent)] opacity-[0.03] blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--color-success)] opacity-[0.02] blur-[120px] pointer-events-none" />

            {/* Basic Nav */}
            <nav className="w-full px-8 py-6 flex items-center justify-between border-b border-[var(--color-border)]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <ArcLogo size={40} />
                    <span className="text-xl font-bold tracking-tight text-[var(--color-text)]">ArcTreasury</span>
                </div>
                <div className="text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                    <span className="w-2 h-2 inline-block bg-green-500 rounded-full mr-2 animate-pulse" />
                    Arc Testnet Live
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">

                {/* Left: Hero Copy */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex flex-col gap-6"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1.5 rounded-full w-fit mb-2">
                        <Activity className="w-3.5 h-3.5" />
                        Hackathon MVP
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-[var(--color-text)] tracking-tight leading-[1.1]">
                        Autonomous <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text)] to-[var(--color-text-muted)]">
                            Liquidity Engine.
                        </span>
                    </h1>

                    <p className="text-lg text-[var(--color-text-muted)] max-w-md leading-relaxed">
                        Connect your Arc wallet to unleash an Advanced AI Agent. Automate stablecoin yields, predict FX rates, and execute real-world payouts—all settled securely on-chain.
                    </p>

                    <div className="pt-8">
                        <button
                            onClick={connectWallet}
                            disabled={isConnecting || address}
                            className={`
                relative group overflow-hidden rounded-xl px-8 py-4 font-semibold text-lg transition-all duration-300
                ${address
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : 'bg-[var(--color-text)] text-[var(--color-bg)] hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]'}
              `}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                {address ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Connected: {address}
                                    </>
                                ) : isConnecting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[var(--color-bg)] border-t-transparent rounded-full animate-spin" />
                                        Authenticating Web3...
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="w-5 h-5" />
                                        Connect Arc Wallet
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                        {error && <p className="mt-3 text-red-400 text-sm font-medium">{error}</p>}
                    </div>
                </motion.div>

                {/* Right: Feature Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <FeatureCard
                        delay={0.2}
                        icon={ShieldAlert}
                        title="AI Decision Matrix"
                        desc="Powered by advanced Machine Learning Models. Analyzes Oracle data and balances to construct mathematically perfect trade payloads."
                    />
                    <FeatureCard
                        delay={0.3}
                        icon={Activity}
                        title="Circle StableFX"
                        desc="Instant atomic swaps between USDC and EURC using native Circle backend infrastructure."
                    />
                    <FeatureCard
                        delay={0.4}
                        icon={CheckCircle2}
                        title="Tokenized Yield"
                        desc="Idle capital is automatically parked in Hashnote USYC to earn risk-free 4.5% APY while waiting for obligations."
                    />
                    <FeatureCard
                        delay={0.5}
                        icon={Wallet}
                        title="Multi-Chain Payouts"
                        desc="Intelligent timelines auto-fund and execute corporate invoices exactly when they are due."
                    />
                </div>
            </main>
        </div>
    );
}
