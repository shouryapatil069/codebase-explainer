import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
  selected?: number | null;
}

const buttonVariants = {
  initial: { gap: 0, paddingLeft: ".5rem", paddingRight: ".5rem" },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 } as any;

export function ExpandableTabs({ tabs, className, activeColor = "text-[#00e5ff]", onChange, selected: defaultSelected = null }: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(defaultSelected);

  const handleSelect = (index: number) => {
    setSelected(index);
    onChange?.(index);
  };

  const Separator = () => <div className="mx-1 h-[24px] w-[1px] bg-[#00ff88]/20" aria-hidden="true" />;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 rounded-[8px] border border-[#00ff88]/20 bg-[#020605] p-1.5 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]", className)}>
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={selected === index}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-[4px] px-4 py-2 text-sm font-mono tracking-wider transition-all duration-300",
              selected === index ? cn("bg-[#00ff88]/10 shadow-[0_0_15px_rgba(0,255,136,0.2)] border border-[#00ff88]/50", activeColor) : "text-[#00ff88]/50 border border-transparent hover:bg-[#00ff88]/5 hover:text-[#00ff88] hover:border-[#00ff88]/20"
            )}
          >
            <Icon size={18} />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span variants={spanVariants} initial="initial" animate="animate" exit="exit" transition={transition} className="overflow-hidden whitespace-nowrap text-xs uppercase font-bold">
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
