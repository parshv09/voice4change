import React from "react";
import { motion } from "framer-motion";

/**
 * Premium Button Spinner - Morphing Dots Pulse
 * Like the iMessage typing indicator but with glow effects.
 * Compact inline animation for submit/action buttons.
 */
const ButtonSpinner = ({ text = "Processing..." }) => {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="inline-flex gap-[3px] items-center">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.span
            key={i}
            animate={{
              y: [0, -4, 0],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
            className="inline-block w-[5px] h-[5px] rounded-full bg-white"
            style={{
              boxShadow: "0 0 6px rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </span>
      <span className="text-sm">{text}</span>
    </span>
  );
};

export default ButtonSpinner;
