import { useEffect, useState } from "react";

export function HyperText({ text, className, duration, animateOnLoad, trigger }: any) {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    if (!animateOnLoad && !trigger) {
      setDisplayText(text);
      return;
    }
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, duration ? duration / text.length : 50);
    
    return () => clearInterval(interval);
  }, [text, duration, animateOnLoad, trigger]);

  return <span className={className}>{displayText || text}</span>;
}
