import * as React from "react";
import { cn } from "@/lib/utils";

export const PromptBox = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = React.useState("");

    React.useImperativeHandle(ref, () => internalTextareaRef.current!, []);
    
    React.useLayoutEffect(() => { 
      const textarea = internalTextareaRef.current; 
      if (textarea) { 
        textarea.style.height = "auto"; 
        const newHeight = Math.max(textarea.scrollHeight, 280); 
        textarea.style.height = `${newHeight}px`; 
      } 
    }, [value, props.value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { 
      setValue(e.target.value); 
      if (props.onChange) props.onChange(e); 
    };

    return (
      <div className={cn("flex flex-col rounded-[8px] p-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] transition-colors bg-[#020605] border border-[#00ff88]/20 cursor-text relative overflow-hidden group hover:border-[#00ff88]/40", className)}>
        <div className="absolute top-0 left-0 right-0 h-8 bg-[#050f0c] border-b border-[#00ff88]/20 flex items-center px-4 gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-[0_0_5px_rgba(255,95,86,0.5)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-[0_0_5px_rgba(255,189,46,0.5)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-[0_0_5px_rgba(39,201,63,0.5)]"></div>
          <span className="ml-2 text-[10px] text-[#00ff88]/60 font-mono tracking-widest uppercase">root@explainer:~#</span>
        </div>
        <textarea 
          ref={internalTextareaRef} 
          rows={10} 
          value={props.value !== undefined ? props.value : value} 
          onChange={handleInputChange} 
          placeholder=">_ PASTE_CODE_HERE..." 
          className="custom-scrollbar w-full resize-none border-0 bg-transparent p-4 pt-12 text-[#00ff88] font-mono text-sm placeholder:text-[#00ff88]/30 focus:ring-0 focus-visible:outline-none min-h-[280px] caret-[#00ff88]" 
          {...props} 
        />
      </div>
    );
  }
);
PromptBox.displayName = "PromptBox";

