import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Shield, Activity, ArrowRight, CheckCircle2, Zap, TrendingUp, Globe, Bot } from 'lucide-react';
import { ethers } from 'ethers';
import ArcLogo from '../components/ArcLogo';

/* ── Animated grid background ── */
const GridBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Perspective grid */}
        <div className="absolute inset-0" style={{
            backgroundImage: `
                linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 100%)',
        }} />
        {/* Gradient orbs */}
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[#F97316] opacity-[0.06] blur-[150px]" />
        <div className="absolute bottom-[5%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#F97316] opacity-[0.04] blur-[120px]" />
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[600px] h-[600px] rounded-full bg-[#FBBF24] opacity-[0.03] blur-[180px]" />
    </div>
);

/* ── Floating particles ── */
const LANDING_PARTICLES = `
@keyframes landing-float {
    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
    50% { transform: translateY(-20px) scale(1.2); opacity: 0.7; }
}
@keyframes landing-drift {
    0% { transform: translate(0, 0); }
    25% { transform: translate(10px, -15px); }
    50% { transform: translate(-5px, -25px); }
    75% { transform: translate(-15px, -10px); }
    100% { transform: translate(0, 0); }
}
@keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(249,115,22,0.3), 0 0 60px rgba(249,115,22,0.1); }
    50% { box-shadow: 0 0 30px rgba(249,115,22,0.5), 0 0 80px rgba(249,115,22,0.2); }
}
@keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
}
@keyframes orbit-inner {
    0% { transform: rotate(0deg) translateX(145px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(145px) rotate(-360deg); }
}
@keyframes orbit-outer {
    0% { transform: rotate(0deg) translateX(210px) rotate(0deg); }
    100% { transform: rotate(-360deg) translateX(210px) rotate(360deg); }
}
`;

const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
            <div
                key={i}
                className="absolute rounded-full bg-[#F97316]"
                style={{
                    width: `${2 + Math.random() * 3}px`,
                    height: `${2 + Math.random() * 3}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.2 + Math.random() * 0.3,
                    animation: `landing-float ${4 + Math.random() * 6}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    willChange: 'transform, opacity',
                }}
            />
        ))}
    </div>
);

/* ── Orbiting icons around the hero visual ── */
const OrbitItem = ({ icon: Icon, delay, duration, ring = 'outer', size = 32 }) => (
    <div
        className="absolute left-1/2 top-1/2"
        style={{
            animation: `orbit-${ring} ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
            willChange: 'transform',
            marginLeft: -size / 2,
            marginTop: -size / 2,
        }}
    >
        <div className="w-8 h-8 rounded-lg bg-[rgba(20,20,20,0.8)] border border-[rgba(249,115,22,0.3)] flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-4 h-4 text-[#F97316]" />
        </div>
    </div>
);

/* ── Hero visual: pulsing AI core with orbit ring ── */
const HeroVisual = () => (
    <div className="relative w-[480px] h-[480px] mx-auto" style={{ overflow: 'visible' }}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-[rgba(249,115,22,0.1)]" />
        {/* Outer orbit path — 210px radius (240-210=30) */}
        <div className="absolute inset-[30px] rounded-full border border-dashed border-[rgba(249,115,22,0.08)]"
            style={{ animation: 'arch-rotate 40s linear infinite reverse', willChange: 'transform' }} />
        {/* Inner orbit path — 145px radius (240-145=95) */}
        <div className="absolute inset-[95px] rounded-full border border-dashed border-[rgba(249,115,22,0.12)]"
            style={{ animation: 'arch-rotate 30s linear infinite', willChange: 'transform' }} />

        {/* Center core — inset 140 → 200px diameter, 100px radius */}
        <div className="absolute inset-[140px] rounded-full bg-gradient-to-br from-[#F97316] to-[#FBBF24] flex items-center justify-center z-10"
            style={{ animation: 'glow-pulse 3s ease-in-out infinite', willChange: 'box-shadow' }}>
            <div className="text-center">
                <Bot className="w-12 h-12 text-white mx-auto mb-1" />
                <span className="text-[0.6rem] font-bold text-white/90 uppercase tracking-widest">AI Agent</span>
            </div>
        </div>

        {/* Orbiting icons — inner ring (closer, clockwise) */}
        <OrbitItem icon={TrendingUp} delay={0} duration={18} ring="inner" />
        <OrbitItem icon={Shield} delay={9} duration={18} ring="inner" />
        {/* Orbiting icons — outer ring (wider, counter-clockwise) */}
        <OrbitItem icon={Globe} delay={3} duration={26} ring="outer" />
        <OrbitItem icon={Zap} delay={16} duration={26} ring="outer" />
    </div>
);

/* ── Feature pill ── */
const FeaturePill = ({ icon: Icon, text, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[rgba(20,20,20,0.6)] border border-[rgba(249,115,22,0.15)] backdrop-blur-sm hover:border-[rgba(249,115,22,0.4)] transition-colors group"
    >
        <div className="w-8 h-8 rounded-lg bg-[#F97316]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F97316]/20 transition-colors">
            <Icon className="w-4 h-4 text-[#F97316]" />
        </div>
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{text}</span>
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
                    params: [{ chainId: '0x4cef52' }],
                });
            } catch (switchErr) {
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
        <div className="h-screen bg-[#050505] flex flex-col relative overflow-hidden">
            <style>{LANDING_PARTICLES}</style>
            <GridBackground />
            <FloatingParticles />

            {/* Nav */}
            <nav className="w-full px-8 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-[rgba(5,5,5,0.7)]">
                <div className="flex items-center gap-3">
                    <ArcLogo size={36} />
                    <span className="text-lg font-bold tracking-tight text-white">ArcTreasury</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                        <span className="text-xs font-mono text-[#22C55E]">Arc Testnet</span>
                    </div>
                    <a href="https://github.com/rafeeqinea/ENCODEARC101" target="_blank" rel="noopener noreferrer"
                        className="text-xs text-zinc-500 hover:text-[#F97316] transition-colors font-mono">
                        GitHub ↗
                    </a>
                </div>
            </nav>

            {/* Hero — split layout */}
            <main className="flex-1 flex items-center justify-center px-8 md:px-16 relative z-10 min-h-0">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-6xl w-full">

                    {/* Left: text + CTA */}
                    <div className="flex-1 flex flex-col items-start">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#F97316] bg-[#F97316]/10 border border-[#F97316]/20 px-3 py-1.5 rounded-full mb-4"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Encode × Arc Hackathon
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95] mb-4"
                        >
                            <span className="text-white">Your Treasury</span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#FBBF24] to-[#F97316]"
                                style={{
                                    backgroundSize: '200% auto',
                                    animation: 'shimmer 4s linear infinite',
                                    willChange: 'background-position',
                                }}>
                                Runs Itself.
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-sm md:text-base text-zinc-400 max-w-md mb-6 leading-relaxed"
                        >
                            An autonomous AI agent that manages stablecoins, optimizes yield,
                            hedges FX risk, and executes payouts — all settled on-chain, every 30 seconds.
                        </motion.p>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.35 }}
                            className="mb-6"
                        >
                            <button
                                onClick={connectWallet}
                                disabled={isConnecting || address}
                                className={`relative group overflow-hidden rounded-xl px-8 py-4 font-semibold text-base transition-all duration-300 ${
                                    address
                                        ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30'
                                        : 'bg-gradient-to-r from-[#F97316] to-[#FBBF24] text-white hover:scale-[1.03] active:scale-[0.98]'
                                }`}
                                style={!address ? { animation: 'glow-pulse 3s ease-in-out infinite', willChange: 'box-shadow' } : {}}
                            >
                                {!address && !isConnecting && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        style={{ animation: 'shimmer 3s linear infinite', backgroundSize: '200% auto', willChange: 'background-position' }} />
                                )}
                                <div className="flex items-center gap-3 relative z-10">
                                    {address ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Connected: {address}
                                        </>
                                    ) : isConnecting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Connecting to Arc...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="w-5 h-5" />
                                            Launch Dashboard
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                            {error && <p className="mt-3 text-red-400 text-sm font-medium">{error}</p>}
                        </motion.div>

                        {/* Feature pills — 2x2 grid */}
                        <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                            <FeaturePill icon={Bot} text="AI Agent — 30s loop" delay={0.5} />
                            <FeaturePill icon={Activity} text="Circle StableFX" delay={0.6} />
                            <FeaturePill icon={TrendingUp} text="USYC — 4.5% APY" delay={0.7} />
                            <FeaturePill icon={Globe} text="CCTP V2 Bridge" delay={0.8} />
                        </div>
                    </div>

                    {/* Right: solar system */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex-shrink-0"
                    >
                        <HeroVisual />
                    </motion.div>

                </div>
            </main>

            {/* Bottom stats */}
            <div className="w-full border-t border-white/5 bg-[rgba(5,5,5,0.8)] backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Blockchain', value: 'Arc Testnet', accent: true },
                        { label: 'Contracts', value: '4 Deployed' },
                        { label: 'Integrations', value: '6 Live' },
                        { label: 'Finality', value: '< 500ms' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 + i * 0.08 }}
                            className="text-center"
                        >
                            <p className={`font-mono text-base font-bold ${stat.accent ? 'text-[#F97316]' : 'text-white'}`}>{stat.value}</p>
                            <p className="text-[0.65rem] text-zinc-600 mt-1 uppercase tracking-wider">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
