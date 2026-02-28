import { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function ArcLogo({ size = 40 }) {
    const containerRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    // Mouse position relative to logo center
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring physics for organic feel
    const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
    const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

    // Track mouse near the logo
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only react within 120px radius
            if (distance < 120) {
                setIsHovering(true);
                // Normalize and scale the pull effect (max 8px displacement)
                const pull = Math.max(0, (120 - distance) / 120) * 8;
                const angle = Math.atan2(dy, dx);
                mouseX.set(Math.cos(angle) * pull);
                mouseY.set(Math.sin(angle) * pull);
            } else {
                setIsHovering(false);
                mouseX.set(0);
                mouseY.set(0);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Blob paths that morph continuously
    const blobVariants = {
        animate: {
            d: [
                "M20,2 C28,2 36,8 38,16 C40,24 36,34 28,38 C20,42 10,38 4,30 C-2,22 2,10 10,4 C14,2 18,2 20,2Z",
                "M22,0 C32,2 40,10 38,20 C36,30 30,40 20,38 C10,36 0,28 2,18 C4,8 14,-2 22,0Z",
                "M18,2 C26,0 38,6 40,16 C42,26 34,38 24,40 C14,42 2,34 0,24 C-2,14 8,4 18,2Z",
                "M20,2 C28,2 36,8 38,16 C40,24 36,34 28,38 C20,42 10,38 4,30 C-2,22 2,10 10,4 C14,2 18,2 20,2Z",
            ],
            transition: {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
            }
        }
    };

    // When hovering, blob stretches toward cursor
    const hoverVariants = {
        animate: {
            d: [
                "M20,0 C32,0 42,8 40,18 C38,28 30,42 18,40 C6,38 -2,28 0,18 C2,8 10,0 20,0Z",
                "M22,-2 C34,0 44,12 40,22 C36,32 26,44 16,40 C6,36 -4,26 0,16 C4,6 12,-2 22,-2Z",
                "M20,0 C32,0 42,8 40,18 C38,28 30,42 18,40 C6,38 -2,28 0,18 C2,8 10,0 20,0Z",
            ],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }
        }
    };

    return (
        <motion.div
            ref={containerRef}
            className="relative cursor-pointer"
            style={{
                width: size,
                height: size,
                x: springX,
                y: springY,
            }}
        >
            {/* Glow (dark mode) */}
            <div className="absolute inset-[-4px] dark:bg-orange-500/15 rounded-full blur-lg transition-opacity duration-300"
                style={{ opacity: isHovering ? 0.4 : 0.15 }}
            />

            <svg viewBox="0 0 40 40" width={size} height={size} className="relative z-10">
                <defs>
                    <radialGradient id="blobGrad" cx="35%" cy="35%">
                        <stop offset="0%" stopColor="#FBBF24" />
                        <stop offset="100%" stopColor="#F97316" />
                    </radialGradient>
                </defs>

                {/* Main blob */}
                <motion.path
                    d="M20,2 C28,2 36,8 38,16 C40,24 36,34 28,38 C20,42 10,38 4,30 C-2,22 2,10 10,4 C14,2 18,2 20,2Z"
                    initial={{ d: "M20,2 C28,2 36,8 38,16 C40,24 36,34 28,38 C20,42 10,38 4,30 C-2,22 2,10 10,4 C14,2 18,2 20,2Z" }}
                    fill="url(#blobGrad)"
                    variants={isHovering ? hoverVariants : blobVariants}
                    animate="animate"
                    style={{ filter: isHovering ? 'drop-shadow(0 0 6px rgba(249,115,22,0.5))' : 'none' }}
                />

                {/* Inner highlight */}
                <ellipse cx="15" cy="13" rx="5" ry="3" fill="rgba(255,255,255,0.15)" />

                {/* Lightning bolt */}
                <text
                    x="20"
                    y="22"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="14"
                    fill="white"
                    style={{ pointerEvents: 'none' }}
                >
                    ⚡
                </text>
            </svg>
        </motion.div>
    );
}
