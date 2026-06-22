import { motion, useReducedMotion } from "framer-motion"
import type React from "react"
import { useId, useState } from "react"
import { HyperText } from "./hyper-text"

interface HudButtonProps {
  children: React.ReactNode
  variant?: "primary" | "secondary"
  style?: "style1" | "style2"
  size?: "small" | "default" | "large"
  onClick?: () => void
  delay?: number
  enableAnimations?: boolean
  className?: string
}

export function HudButton({
  children,
  variant = "primary",
  style = "style1",
  size = "default",
  onClick,
  delay = 0,
  enableAnimations = true,
  className = ""
}: HudButtonProps) {
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion
  const [isHovered, setIsHovered] = useState(false)
  const isDark = true

  const getColors = () => {
    if (variant === "primary") {
      return {
        main: "#00ff88",
        gradient: "#00ff88",
        text: "text-[#00ff88] font-mono tracking-widest",
        glow: "rgba(0, 255, 136, 0.4)",
        border: "#00ff88"
      }
    } else {
      return {
        main: "#00e5ff",
        gradient: "#00e5ff",
        text: "text-[#00e5ff] font-mono tracking-widest",
        glow: "rgba(0, 229, 255, 0.4)",
        border: "#00e5ff"
      }
    }
  }

  const colors = getColors()

  const buttonVariants: any = {
    hidden: { opacity: 0, y: 20, scale: 0.95, filter: shouldAnimate ? "blur(4px)" : "blur(0px)" },
    show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.8, delay, duration: shouldAnimate ? undefined : 0 } },
  }

  const containerVariants: any = {
    hover: { scale: 1.02, y: -2, rotateX: 2, transition: { type: "spring", stiffness: 400, damping: 25, mass: 0.6 } },
    tap: { scale: 0.98, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 500, damping: 30, mass: 0.5 } },
  }

  const glowVariants: any = {
    initial: { opacity: 0, scale: 0.8 },
    hover: { opacity: variant === "primary" ? 0.6 : 0.3, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 20 } },
  }

  const dotVariants: any = {
    hidden: { scale: 0, opacity: 0, filter: "blur(2px)" },
    show: (i: number) => ({ scale: 1, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 400, damping: 25, delay: delay + 0.3 + (i * 0.05) } }),
    hover: { scale: 1.2, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 25, mass: 0.4 } },
  }

  const shimmerVariants: any = {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: "100%", opacity: [0, 0.5, 0], transition: { duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" } },
  }

  const uniqueId = useId().replace(/:/g, '')
  const gradientId1 = `gradient1-${uniqueId}`
  const gradientId2 = `gradient2-${uniqueId}`
  const gradientId = `gradient-${uniqueId}`

  const getSizeStyles = () => {
    if (style === "style1") return { width: "182px", height: "44px", textClass: "text-sm tracking-wider" }
    switch (size) {
      case "small": return { width: "140px", height: "39px", textClass: "text-xs tracking-wide" }
      case "large": return { width: "234px", height: "65px", textClass: "text-base tracking-wider" }
      default: return { width: "187px", height: "52px", textClass: "text-sm tracking-wider" }
    }
  }

  const sizeStyles = getSizeStyles()

  const renderStyle1SVG = () => (
    <svg width="100%" height="100%" viewBox="0 0 182 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 z-0">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="182" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor={colors.gradient} stopOpacity="0.2" />
          <stop offset="1" stopColor={colors.gradient} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d="M181.788.5H13.7L4.609,9.593V43.221H170.048l11.74-11.74Z" fill={`url(#${gradientId})`} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: shouldAnimate ? 0.8 : 0, delay: delay + 0.2, ease: "easeOut" }} />
      <motion.path d="M170.256,43.721H4.108V9.386L13.494,0H182.288V31.688Zm-165.148-1H169.842l11.446-11.447V1H13.908l-8.8,8.8Z" fill={colors.border} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: shouldAnimate ? 0.6 : 0, delay: delay + 0.4, ease: "easeOut" }} />
      {[ { cx: "169.908", cy: "7.326", index: 0 }, { cx: "169.908", cy: "11.908", index: 1 }, { cx: "174.373", cy: "7.326", index: 2 }, { cx: "174.373", cy: "11.908", index: 3 } ].map((dot) => (
        <motion.circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r="1.161" fill={colors.main} variants={dotVariants} initial="hidden" animate="show" whileHover="hover" custom={dot.index} />
      ))}
      {[ { cx: "0.621", cy: "19.214", index: 4 }, { cx: "0.621", cy: "24.506", index: 5 } ].map((dot) => (
        <motion.circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r="0.621" fill={colors.main} variants={dotVariants} initial="hidden" animate="show" whileHover="hover" custom={dot.index} />
      ))}
    </svg>
  )

  return (
    <motion.button
      className={`relative cursor-pointer transform-gpu flex items-center justify-center ${className}`}
      variants={shouldAnimate ? buttonVariants : undefined}
      initial={shouldAnimate ? "hidden" : "show"}
      animate="show"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ width: sizeStyles.width, height: sizeStyles.height, perspective: "1000px" }}
    >
      <motion.div className="absolute inset-0 rounded-lg" style={{ background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`, filter: "blur(10px)", }} variants={shouldAnimate ? glowVariants : undefined} initial="initial" animate={isHovered ? "hover" : "initial"} />
      
      {shouldAnimate && variant === "primary" && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <motion.div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)", width: "30%", height: "100%" }} variants={shimmerVariants} initial="initial" animate="animate" />
        </div>
      )}

      <motion.div variants={shouldAnimate ? containerVariants : undefined} className="relative cursor-pointer h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {renderStyle1SVG()}
        <div className="absolute inset-0 flex items-center justify-center z-10 gap-2">
          {children}
        </div>
      </motion.div>
    </motion.button>
  )
}
