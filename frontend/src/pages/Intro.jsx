import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ArcLogo from '../components/ArcLogo';

const INTRO_STYLES = `
@keyframes intro-glow {
    0%, 100% { box-shadow: 0 0 60px rgba(249,115,22,0.15), 0 0 120px rgba(249,115,22,0.05); }
    50% { box-shadow: 0 0 80px rgba(249,115,22,0.3), 0 0 160px rgba(249,115,22,0.1); }
}
@keyframes intro-ring {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

export default function Intro() {
    const navigate = useNavigate();
    const [exiting, setExiting] = useState(false);

    const handleEnter = () => {
        setExiting(true);
        setTimeout(() => navigate('/connect'), 800);
    };

    return (
        <AnimatePresence>
            {!exiting ? (
                <motion.div
                    className="h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
                    onClick={handleEnter}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                >
                    <style>{INTRO_STYLES}</style>

                    {/* Ambient glow behind logo */}
                    <div className="absolute w-[500px] h-[500px] rounded-full opacity-20"
                        style={{
                            background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)',
                            animation: 'intro-glow 4s ease-in-out infinite',
                        }}
                    />

                    {/* Outer rotating ring */}
                    <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-[rgba(249,115,22,0.15)]"
                        style={{ animation: 'intro-ring 20s linear infinite', willChange: 'transform' }} />
                    <div className="absolute w-[340px] h-[340px] rounded-full border border-[rgba(249,115,22,0.08)]"
                        style={{ animation: 'intro-ring 30s linear infinite reverse', willChange: 'transform' }} />

                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 mb-8"
                    >
                        <ArcLogo size={100} />
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative z-10 text-4xl md:text-5xl font-bold tracking-tight text-white mb-2"
                    >
                        ArcTreasury
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="relative z-10 text-sm text-zinc-500 tracking-[0.3em] uppercase mb-12"
                    >
                        Autonomous Treasury Agent
                    </motion.p>

                    {/* Enter button */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                        onClick={handleEnter}
                        className="relative z-10 flex items-center gap-2 px-8 py-3 rounded-full border border-[rgba(249,115,22,0.3)] bg-[rgba(249,115,22,0.08)] text-[#F97316] text-sm font-semibold uppercase tracking-widest hover:bg-[rgba(249,115,22,0.15)] hover:border-[rgba(249,115,22,0.5)] transition-all duration-300 group"
                    >
                        Enter
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    {/* Bottom hint */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.5 }}
                        className="absolute bottom-8 text-[0.6rem] text-zinc-700 tracking-widest uppercase"
                    >
                        Click anywhere to continue
                    </motion.p>
                </motion.div>
            ) : (
                <motion.div
                    className="h-screen bg-[#050505] flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                />
            )}
        </AnimatePresence>
    );
}
