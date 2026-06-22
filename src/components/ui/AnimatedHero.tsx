import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HyperText } from "@/components/ui/hyper-text";

interface StatusProps {
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "warning";
  scale?: number;
  text?: string;
  customColors?: {
    gradientStart?: string;
    gradientEnd?: string;
    stroke?: string;
    text?: string;
  };
}

export function AnimatedHero({
  className,
  variant = "primary",
  scale = 1,
  text = "ACTIVE",
  customColors
}: StatusProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = true; 

  const getColors = () => {
    if (customColors) {
      return {
        gradientStart: customColors.gradientStart || (isDark ? "#4ade80" : "#16a34a"),
        gradientEnd: customColors.gradientEnd || (isDark ? "#15803d" : "#166534"),
        stroke: customColors.stroke || (isDark ? "#4ade80" : "#16a34a"),
        text: customColors.text || (isDark ? "text-green-300" : "text-white/80")
      };
    }

    switch (variant) {
      case "primary":
        return {
          gradientStart: isDark ? "#4ade80" : "#16a34a",
          gradientEnd: isDark ? "#15803d" : "#166534",
          stroke: isDark ? "#4ade80" : "#16a34a",
          text: isDark ? "text-green-300" : "text-white/80"
        };
      case "secondary":
        return {
          gradientStart: isDark ? "#64748b" : "#374151",
          gradientEnd: isDark ? "#334155" : "#1f2937",
          stroke: isDark ? "#64748b" : "#374151",
          text: isDark ? "text-slate-300" : "text-white/80"
        };
      case "danger":
        return {
          gradientStart: isDark ? "#f87171" : "#dc2626",
          gradientEnd: isDark ? "#b91c1c" : "#991b1b",
          stroke: isDark ? "#f87171" : "#dc2626",
          text: isDark ? "text-red-300" : "text-white/80"
        };
      case "warning":
        return {
          gradientStart: isDark ? "#fbbf24" : "#d97706",
          gradientEnd: isDark ? "#b45309" : "#92400e",
          stroke: isDark ? "#fbbf24" : "#d97706",
          text: isDark ? "text-amber-300" : "text-white/80"
        };
      default:
        return {
          gradientStart: isDark ? "#4ade80" : "#16a34a",
          gradientEnd: isDark ? "#15803d" : "#166534",
          stroke: isDark ? "#4ade80" : "#16a34a",
          text: isDark ? "text-green-300" : "text-white/80"
        };
    }
  };

  const colors = getColors();

  const containerVariants = {
    hidden: { opacity: 0, x: -100, scale: scale },
    visible: { opacity: 1, x: 0, scale: scale, transition: { duration: 0.8, ease: "easeOut" } as any }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ transformOrigin: "left center" }}
    >
      <div className="relative w-48 h-12">
        <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
           <defs>
              <linearGradient id={`grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.gradientStart} />
                <stop offset="100%" stopColor={colors.gradientEnd} />
              </linearGradient>
           </defs>
           <rect x="0" y="0" width="100" height="30" rx="4" fill={`url(#grad-${variant})`} stroke={colors.stroke} strokeWidth="2" opacity="0.2" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-start pl-4 pb-3">
          <HyperText
            text={text}
            className={`${colors.text} text-sm font-mono tracking-wider font-semibold`}
            duration={1000}
            animateOnLoad={true}
            trigger={true}
          />
        </div>
      </div>
    </motion.div>
  );
}
