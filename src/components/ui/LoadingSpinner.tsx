import { ComponentProps, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type DotLoaderProps = {
  frames?: number[][];
  dotClassName?: string;
  isPlaying?: boolean;
  duration?: number;
  repeatCount?: number;
  onComplete?: () => void;
} & ComponentProps<"div">;

const defaultFrames = [
  [0, 1, 2], [7, 8, 9], [14, 15, 16], [21, 22, 23],
];

export const DotLoader = ({ frames = defaultFrames, isPlaying = true, duration = 100, dotClassName, className, repeatCount = -1, onComplete, ...props }: DotLoaderProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const currentIndex = useRef(0);
  const repeats = useRef(0);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyFrameToDots = useCallback((dots: HTMLDivElement[], frameIndex: number) => {
    const frame = frames[frameIndex];
    if (!frame) return;
    dots.forEach((dot, index) => {
      dot.classList.toggle("bg-green-500", frame.includes(index));
      dot.classList.toggle("bg-gray-800", !frame.includes(index));
    });
  }, [frames]);

  useEffect(() => {
    currentIndex.current = 0;
    repeats.current = 0;
  }, [frames]);

  useEffect(() => {
    if (isPlaying) {
      if (currentIndex.current >= frames.length) currentIndex.current = 0;
      const dotElements = gridRef.current?.children;
      if (!dotElements) return;
      const dots = Array.from(dotElements) as HTMLDivElement[];
      interval.current = setInterval(() => {
        applyFrameToDots(dots, currentIndex.current);
        if (currentIndex.current + 1 >= frames.length) {
          if (repeatCount !== -1 && repeats.current + 1 >= repeatCount) {
            clearInterval(interval.current!);
            onComplete?.();
          }
          repeats.current++;
        }
        currentIndex.current = (currentIndex.current + 1) % frames.length;
      }, duration);
    } else {
      if (interval.current) clearInterval(interval.current);
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [frames, isPlaying, applyFrameToDots, duration, repeatCount, onComplete]);

  return (
    <div {...props} ref={gridRef} className={cn("grid w-fit grid-cols-7 gap-0.5", className)}>
      {Array.from({ length: 49 }).map((_, i) => (
        <div key={i} className={cn("h-1.5 w-1.5 rounded-sm bg-gray-800 transition-colors duration-200", dotClassName)} />
      ))}
    </div>
  );
};
