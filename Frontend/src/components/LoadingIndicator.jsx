import React from "react";
import { motion } from "framer-motion";

/**
 * Premium "Neural Constellation" Loading Animation
 * Updated to use the Home page (Landing page) Blue/Purple color theme.
 */
const LoadingIndicator = ({ message = "Processing...", variant = "constellation" }) => {
  if (variant === "bars") return <BarsLoader message={message} />;
  if (variant === "dots") return <DotsLoader message={message} />;
  return <ConstellationLoader message={message} />;
};

/* ─── CONSTELLATION LOADER (default, full-section) ─── */
const ConstellationLoader = ({ message }) => {
  const particles = [
    { size: 8, radius: 32, duration: 2.4, delay: 0, color: "#3b82f6" },    // blue-500
    { size: 6, radius: 32, duration: 2.4, delay: 0.8, color: "#a855f7" },  // purple-500
    { size: 5, radius: 32, duration: 2.4, delay: 1.6, color: "#6366f1" },  // indigo-500
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full min-h-[220px]">
      {/* Constellation Container */}
      <div className="relative w-24 h-24 mb-8">
        {/* Outer glow ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-4 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Central Core - Morphing shape */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              borderRadius: ["30%", "50%", "30%"],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #a855f7 50%, #4f46e5 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 30px rgba(59,130,246,0.6), 0 0 60px rgba(59,130,246,0.3)",
            }}
          >
            <motion.div
              animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-full h-full rounded-[inherit]"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 50%, #6366f1 100%)",
                backgroundSize: "200% 200%",
              }}
            />
          </motion.div>
        </div>

        {/* Orbiting Particles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
            className="absolute inset-0"
            style={{ transformOrigin: "center center" }}
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                top: `calc(50% - ${p.size / 2}px - ${p.radius}px)`,
                left: `calc(50% - ${p.size / 2}px)`,
              }}
            />
          </motion.div>
        ))}

        {/* Connecting beams (SVG) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96">
          <motion.circle
            cx="48" cy="48" r="30"
            fill="none"
            stroke="url(#beamGradient)"
            strokeWidth="0.5"
            strokeDasharray="4 6"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "48px 48px" }}
          />
          <motion.circle
            cx="48" cy="48" r="20"
            fill="none"
            stroke="url(#beamGradient)"
            strokeWidth="0.3"
            strokeDasharray="2 8"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "48px 48px" }}
          />
          <defs>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Equalizer Bars */}
      <div className="flex items-end gap-1 mb-5 h-6">
        {[0, 0.15, 0.3, 0.45, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ height: ["6px", "24px", "10px", "20px", "6px"] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
            className="w-[3px] rounded-full"
            style={{
              background: `linear-gradient(to top, #3b82f6, #a855f7)`,
              boxShadow: "0 0 6px rgba(59,130,246,0.5)",
            }}
          />
        ))}
      </div>

      {/* Message */}
      {message && (
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs font-semibold tracking-[0.25em] uppercase text-center"
          style={{
            background: "linear-gradient(90deg, #60a5fa, #c084fc, #93c5fd, #c084fc, #60a5fa)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <motion.span
            animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              background: "linear-gradient(90deg, #60a5fa, #c084fc, #93c5fd, #c084fc, #60a5fa)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {message}
          </motion.span>
        </motion.p>
      )}
    </div>
  );
};

/* ─── BARS / EQUALIZER LOADER (compact, for chart areas) ─── */
const BarsLoader = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-6 w-full min-h-[180px]">
    <div className="flex items-end gap-[5px] mb-5 h-10">
      {[0, 0.1, 0.2, 0.3, 0.2, 0.1, 0].map((delay, i) => (
        <motion.div
          key={i}
          animate={{
            height: ["8px", "40px", "16px", "32px", "8px"],
            opacity: [0.4, 1, 0.6, 0.9, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
          className="w-[4px] rounded-full"
          style={{
            background: `linear-gradient(to top, #3b82f6, ${i % 2 === 0 ? "#a855f7" : "#6366f1"})`,
            boxShadow: "0 0 8px rgba(59,130,246,0.4)",
          }}
        />
      ))}
    </div>
    {message && (
      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-gray-400">
        {message}
      </p>
    )}
  </div>
);

/* ─── DOTS LOADER (compact, for inline/small areas) ─── */
const DotsLoader = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-4 w-full min-h-[120px]">
    <div className="flex gap-2 mb-4">
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -12, 0],
            scale: [1, 1.3, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
          className="w-3 h-3 rounded-full"
          style={{
            background: i === 1 ? "#a855f7" : "#3b82f6",
            boxShadow: `0 0 12px ${i === 1 ? "rgba(168,85,247,0.5)" : "rgba(59,130,246,0.5)"}`,
          }}
        />
      ))}
    </div>
    {message && (
      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-gray-400">
        {message}
      </p>
    )}
  </div>
);

export default LoadingIndicator;
