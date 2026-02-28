import { motion } from 'framer-motion';

const blobPaths = [
    // Shape 1 - base blob
    "M40,20 C40,8 32,0 20,0 C8,0 0,8 0,20 C0,32 8,40 20,40 C32,40 40,32 40,20",
    // Shape 2 - slight tendril top-right
    "M40,18 C42,6 30,0 20,2 C8,0 -2,10 0,22 C2,34 10,42 22,40 C34,38 38,30 40,18",
    // Shape 3 - tendril bottom-left
    "M38,20 C40,8 30,-2 18,0 C6,2 0,12 -2,22 C0,34 8,40 20,42 C34,40 38,32 38,20",
    // Shape 4 - compressed
    "M42,22 C40,10 34,2 22,0 C10,0 2,8 0,18 C-2,30 6,42 18,40 C30,42 42,34 42,22",
];

export default function ArcLogo({ size = 40, className = "" }) {
    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            {/* Glow layer (dark mode only) */}
            <div className="absolute inset-0 dark:blur-md dark:bg-orange-500/20 rounded-full" />

            <svg viewBox="0 0 40 40" width={size} height={size}>
                <motion.path
                    d={blobPaths[0]}
                    fill="#F97316"
                    animate={{
                        d: blobPaths,
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.33, 0.66, 1],
                    }}
                    style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
                />
                {/* Inner highlight for depth */}
                <motion.ellipse
                    cx="16"
                    cy="14"
                    rx="6"
                    ry="4"
                    fill="rgba(255,255,255,0.2)"
                    animate={{
                        cx: [16, 18, 14, 16],
                        cy: [14, 16, 12, 14],
                        rx: [6, 5, 7, 6],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
                />
                {/* ⚡ bolt inside */}
                <text
                    x="50%"
                    y="54%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="16"
                    fill="white"
                    fontWeight="bold"
                >
                    ⚡
                </text>
            </svg>
        </div>
    );
}
