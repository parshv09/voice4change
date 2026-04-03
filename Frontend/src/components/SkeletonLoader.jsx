import React from "react";
import { motion } from "framer-motion";

/**
 * Glassmorphic Skeleton Shimmer Loader
 * Updated to use the Home page (Landing page) gray-950/gray-900 theme
 * 
 * Variants:
 * - "cards"  → Grid of glassmorphic placeholder cards (for feedback grids)
 * - "table"  → Table rows with shimmer blocks (for feedback management table)
 * - "stats"  → Stat cards row (for dashboard stat headers)
 * - "chart"  → Single chart area placeholder
 */

const shimmerStyle = {
  // Using blue-300 with low opacity for the shimmer
  background: "linear-gradient(90deg, transparent 0%, rgba(147,197,253,0.06) 40%, rgba(147,197,253,0.12) 50%, rgba(147,197,253,0.06) 60%, transparent 100%)",
  backgroundSize: "200% 100%",
};

const ShimmerBlock = ({ className = "", style = {} }) => (
  <motion.div
    animate={{ backgroundPosition: ["-200% 0", "200% 0"] }}
    transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
    className={`rounded-lg ${className}`}
    style={{
      backgroundColor: "#1f2937", // gray-800
      ...shimmerStyle,
      ...style,
    }}
  />
);

/* ─── SKELETON CARD ─── */
const SkeletonCard = () => (
  <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-800 space-y-4 h-full">
    {/* Title */}
    <div className="flex justify-between items-start">
      <ShimmerBlock className="h-5 w-3/5" />
      <ShimmerBlock className="h-6 w-14 rounded-md" />
    </div>
    {/* Description lines */}
    <div className="space-y-2.5">
      <ShimmerBlock className="h-3 w-full" />
      <ShimmerBlock className="h-3 w-4/5" />
      <ShimmerBlock className="h-3 w-2/3" />
    </div>
    {/* Metadata row */}
    <div className="flex gap-3 pt-2">
      <ShimmerBlock className="h-8 w-28 rounded-lg" />
      <ShimmerBlock className="h-8 w-32 rounded-lg" />
    </div>
    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
      <div className="flex gap-2">
        <ShimmerBlock className="h-6 w-16 rounded-full" />
        <ShimmerBlock className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-3">
        <ShimmerBlock className="h-5 w-5 rounded-full" />
        <ShimmerBlock className="h-5 w-5 rounded-full" />
      </div>
    </div>
  </div>
);

/* ─── SKELETON STAT CARD ─── */
const SkeletonStatCard = () => (
  <div className="p-5 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800/50 backdrop-blur-xl">
    <div className="flex items-center justify-between">
      <div className="space-y-3 flex-1">
        <ShimmerBlock className="h-3 w-20" />
        <ShimmerBlock className="h-8 w-14" />
      </div>
      <ShimmerBlock className="h-12 w-12 rounded-xl" />
    </div>
  </div>
);

/* ─── SKELETON TABLE ROW ─── */
const SkeletonTableRow = () => (
  <tr className="border-b border-gray-800">
    <td className="px-6 py-5">
      <div className="flex items-start gap-4">
        <ShimmerBlock className="h-10 w-10 rounded-xl flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <ShimmerBlock className="h-4 w-3/4" />
          <ShimmerBlock className="h-3 w-full" />
          <ShimmerBlock className="h-2.5 w-1/3" />
        </div>
      </div>
    </td>
    <td className="px-6 py-5"><ShimmerBlock className="h-6 w-24 rounded-lg" /></td>
    <td className="px-6 py-5">
      <div className="flex items-center gap-3">
        <ShimmerBlock className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5">
          <ShimmerBlock className="h-3.5 w-20" />
          <ShimmerBlock className="h-2.5 w-28" />
        </div>
      </div>
    </td>
    <td className="px-6 py-5"><ShimmerBlock className="h-6 w-20 rounded-full" /></td>
    <td className="px-6 py-5 text-right"><ShimmerBlock className="h-7 w-24 rounded-lg ml-auto" /></td>
  </tr>
);

/* ─── SKELETON CHART ─── */
const SkeletonChart = () => (
  <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-5 md:p-6">
    <div className="flex justify-between items-start mb-6">
      <div className="space-y-2">
        <ShimmerBlock className="h-5 w-40" />
        <ShimmerBlock className="h-3 w-56" />
      </div>
      <ShimmerBlock className="h-9 w-9 rounded-lg" />
    </div>
    <div className="h-64 flex items-end gap-3 px-4 pt-4">
      {[60, 85, 45, 70, 55, 40, 75].map((h, i) => (
        <motion.div
          key={i}
          animate={{ backgroundPosition: ["-200% 0", "200% 0"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
          className="flex-1 rounded-t-md"
          style={{
            height: `${h}%`,
            backgroundColor: "#1f2937", // gray-800
            ...shimmerStyle,
          }}
        />
      ))}
    </div>
  </div>
);

/* ─── MAIN EXPORT ─── */
const SkeletonLoader = ({ variant = "cards", count = 6 }) => {
  switch (variant) {
    case "stats":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      );

    case "table":
      return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-gray-950/80 px-6 py-5 flex gap-6">
            {["w-2/5", "w-1/6", "w-1/6", "w-1/6", "w-[150px]"].map((w, i) => (
              <ShimmerBlock key={i} className={`h-3 ${w}`} />
            ))}
          </div>
          <table className="w-full">
            <tbody>
              {Array.from({ length: count }).map((_, i) => (
                <SkeletonTableRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      );

    case "chart":
      return <SkeletonChart />;

    case "cards":
    default:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      );
  }
};

export default SkeletonLoader;
export { SkeletonCard, SkeletonStatCard, SkeletonTableRow, SkeletonChart };
