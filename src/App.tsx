import { useState } from 'react'
import { Toaster } from 'sonner'
import { toast } from 'sonner'
import { AnimatedHero } from './components/ui/AnimatedHero'
import { BentoGrid } from './components/ui/BentoGrid'
import { PromptBox } from './components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/Select'
import { HudButton } from './components/ui/HudButton'
import { Button } from './components/ui/Button'
import { ExpandableTabs } from './components/ui/Tabs'
import CodeBlock from './components/ui/CodeBlock'
import { DotLoader } from './components/ui/LoadingSpinner'
import { Badge } from './components/ui/Badge'
import MatrixRain from './components/ui/MatrixRain'
import { explainCode, ExplanationResult } from './lib/explainCode'
import { Code2, Settings2, FileText, Download, Copy, Trash2, CheckCircle2 } from 'lucide-react'

const TODO_EXAMPLE = `import React, { useState } from 'react';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input }]);
      setInput('');
    }
  };

  return (
    <div>
      <h1>Todo List</h1>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}`;

function App() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("JavaScript")
  const [isLoading, setIsLoading] = useState(false)
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null)
  const [activeTab, setActiveTab] = useState<number | null>(0)

  const handleExplain = () => {
    if (!code.trim()) {
      toast.error("Please paste some code first")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      const result = explainCode(code, language)
      setExplanation(result)
      setIsLoading(false)
      toast.success("Code explanation generated successfully")
    }, 1000)
  }

  const handleUseExample = () => {
    setCode(TODO_EXAMPLE)
    setLanguage("React")
  }

  const getExplanationText = () => {
    if (!explanation) return "";
    switch (explanation.mode) {
      case 'html':
        return `1. Simple Summary\n${explanation.simpleSummary}\n\n2. Main Purpose\n${explanation.mainPurpose}\n\n3. Page Structure\n${explanation.pageStructure}\n\n4. Important HTML Elements\n${explanation.importantElements}\n\n5. Section Breakdown\n${explanation.sectionBreakdown}` +
          (explanation.formExplanation ? `\n\n6. Form Explanation\n${explanation.formExplanation}` : '') +
          (explanation.tableExplanation ? `\n\n7. Table Explanation\n${explanation.tableExplanation}` : '') +
          `\n\n8. Accessibility & SEO\n${explanation.accessibilitySeo}` +
          (explanation.dataAttributes ? `\n\n9. Data Attributes\n${explanation.dataAttributes}` : '') +
          (explanation.externalFiles ? `\n\n10. External Files\n${explanation.externalFiles}` : '') +
          `\n\n11. Beginner Explanation\n${explanation.beginnerExplanation}\n\n12. Possible Improvements\n${explanation.improvements}`;
      case 'react':
        return `1. Simple Summary\n${explanation.simpleSummary}\n\n2. Main Purpose\n${explanation.mainPurpose}\n\n3. Components\n${explanation.components}\n\n4. State Management\n${explanation.stateManagement}\n\n5. Hooks Used\n${explanation.hooksUsed}` +
          (explanation.memoizedValues ? `\n\n6. Memoized Values\n${explanation.memoizedValues}` : '') +
          `\n\n7. Event Handlers\n${explanation.eventHandlers}\n\n8. JSX Structure\n${explanation.jsxStructure}\n\n9. Data Flow\n${explanation.dataFlow}\n\n10. Beginner Explanation\n${explanation.beginnerExplanation}\n\n11. Possible Improvements\n${explanation.improvements}`;
      case 'javascript':
        return `1. Simple Summary\n${explanation.simpleSummary}\n\n2. Main Purpose\n${explanation.mainPurpose}\n\n3. Important Parts\n${explanation.importantParts}\n\n4. Step-by-Step Flow\n${explanation.stepByStepFlow}` +
          (explanation.classBreakdown ? `\n\n5. Class Breakdown\n${explanation.classBreakdown}` : '') +
          `\n\n6. Function Breakdown\n${explanation.functionBreakdown}\n\n7. Data Flow\n${explanation.dataFlow}\n\n8. Beginner Explanation\n${explanation.beginnerExplanation}\n\n9. Possible Improvements\n${explanation.improvements}`;
      case 'python':
        return `1. Simple Summary\n${explanation.simpleSummary}\n\n2. Main Purpose\n${explanation.mainPurpose}\n\n3. Important Parts\n${explanation.importantParts}\n\n4. Step-by-Step Flow\n${explanation.stepByStepFlow}\n\n5. Function/Class Breakdown\n${explanation.functionClassBreakdown}\n\n6. Data Flow\n${explanation.dataFlow}\n\n7. Beginner Explanation\n${explanation.beginnerExplanation}\n\n8. Possible Improvements\n${explanation.improvements}`;
      case 'css':
        return `1. Simple Summary\n${explanation.simpleSummary}\n\n2. Main Purpose\n${explanation.mainPurpose}\n\n3. Selectors Used\n${explanation.selectorsUsed}\n\n4. Styling Groups\n${explanation.stylingGroups}\n\n5. Layout Techniques\n${explanation.layoutTechniques}` +
          (explanation.animationExplanation ? `\n\n6. Animations\n${explanation.animationExplanation}` : '') +
          `\n\n7. Responsive Design\n${explanation.responsiveDesign}\n\n8. Beginner Explanation\n${explanation.beginnerExplanation}\n\n9. Possible Improvements\n${explanation.improvements}`;
      case 'unknown':
        return `1. Simple Summary\n${explanation.simpleSummary}\n\n2. Main Purpose\n${explanation.mainPurpose}\n\n3. Detected Tokens\n${explanation.detectedTokens}\n\n4. Structure\n${explanation.structure}\n\n5. Beginner Explanation\n${explanation.beginnerExplanation}\n\n6. Possible Improvements\n${explanation.improvements}`;
      default:
        return "";
    }
  }

  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(getExplanationText())
      toast.success("Explanation copied successfully")
    }
  }

  const handleDownload = () => {
    if (explanation) {
      const blob = new Blob([getExplanationText()], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'code-explanation.txt'
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Explanation downloaded successfully")
    }
  }

  const handleClear = () => {
    setCode("")
    setLanguage("JavaScript")
    setExplanation(null)
    toast.success("Form cleared")
  }

  const tabs = [
    { title: "Explanation", icon: FileText },
    { title: "Detected Patterns", icon: Settings2 },
    { title: "Raw Text", icon: Code2 },
  ]

  return (
    <div className="min-h-screen bg-transparent text-white relative font-sans overflow-x-hidden z-10">
      {/* Absolute Background Elements */}
      <MatrixRain opacity={0.35} />
      
      {/* Dynamic Overlay above MatrixRain (z-index: 1) */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.25), rgba(0,0,0,0.85)), linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px)',
          backgroundSize: 'auto, 100% 4px'
        }}
      />

      {/* Global CSS Overlays */}
      <div className="scanline" style={{ zIndex: 2 }}></div>
      <div className="vignette" style={{ zIndex: 3 }}></div>

      <Toaster 
        toastOptions={{
          className: 'bg-[#050f0c] border border-[#00ff88]/30 text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]',
          style: { backdropFilter: 'blur(10px)' },
          classNames: {
            error: 'border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
            success: 'border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]',
          }
        }} 
      />
      
      <main className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <header className="flex flex-col items-center justify-center mb-16 text-center pt-8">
          <div className="flex justify-center mb-4 items-center">
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00e5ff] animate-matrix-glow" style={{ textShadow: '0 0 20px rgba(0,255,136,0.3)' }}>
               Codebase Explainer
             </h1>
             <span className="text-4xl md:text-6xl font-black text-[#00ff88] animate-blink ml-1">_</span>
          </div>
          <p className="text-[#00ff88]/70 mt-2 max-w-2xl text-lg md:text-xl text-center font-mono tracking-tight">
            Decode any codebase in plain English.
          </p>
          <div className="mt-6">
            <span className="inline-flex items-center rounded-full bg-[#050f0c]/80 px-4 py-1.5 text-xs font-medium text-[#00ff88] ring-1 ring-inset ring-[#00ff88]/30 backdrop-blur shadow-[0_0_10px_rgba(0,255,136,0.1)]">
              AI Code Analysis Engine • HTML • JS • React • Python • CSS
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-10">
             <HudButton onClick={() => document.getElementById("dashboard")?.scrollIntoView({ behavior: 'smooth' })}>
                Start Explaining
             </HudButton>
             <HudButton variant="secondary" onClick={handleUseExample}>
                Use Example
             </HudButton>
          </div>
        </header>

        {/* Main Dashboard */}
        <div id="dashboard" className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-20">
          
          {/* Left Card: Input */}
          <div className="flex flex-col gap-6 glass-panel glass-panel-hover rounded-[12px] p-6 lg:p-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold flex items-center gap-3 text-[#00ff88] font-mono tracking-wider">
                 <Code2 className="w-5 h-5" /> 
                 <span>INPUT_STREAM</span>
              </h2>
              <div className="w-full sm:w-48">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-[#111] border-white/10 text-white hover:bg-[#222] transition-colors rounded-xl">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl shadow-xl">
                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                    <SelectItem value="TypeScript">TypeScript</SelectItem>
                    <SelectItem value="React">React</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                    <SelectItem value="CSS">CSS</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <PromptBox 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
            />

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <HudButton onClick={handleExplain} size="small">
                 <CheckCircle2 className="w-4 h-4 mr-2" /> Explain Code
              </HudButton>
              <Button variant="outline" onClick={handleClear} className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl px-6 h-[39px]">
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
          </div>

          {/* Right Card: Output */}
          <div className="flex flex-col gap-6 glass-panel glass-panel-hover rounded-[12px] p-6 lg:p-8 relative">
            <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-[#00e5ff] font-mono tracking-wider">
                 <Settings2 className="w-5 h-5" /> 
                 <span>ANALYSIS_OUTPUT</span>
              </h2>
              <ExpandableTabs tabs={tabs} selected={activeTab} onChange={setActiveTab} activeColor="text-cyan-400" className="bg-[#111] border-white/5" />
            </div>

            <div className="flex-1 bg-[#020605] rounded-[8px] p-6 border border-[#00ff88]/20 min-h-[350px] overflow-y-auto custom-scrollbar shadow-inner relative">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 py-20">
                  <div className="w-48 h-1 bg-[#050f0c] border border-[#00ff88]/30 rounded overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full w-1/2 bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-[highlight_1.5s_infinite_ease-in-out]"></div>
                  </div>
                  <span className="text-[#00ff88] font-mono text-sm tracking-widest uppercase animate-pulse">ANALYZING CODE...</span>
                </div>
              ) : !explanation ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 py-20">
                  <Code2 className="w-12 h-12 mb-4 opacity-20" />
                  <p>Paste code and click explain to see the results here.</p>
                </div>
              ) : (
                <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {activeTab === 0 && (
                    <div className="space-y-8 pb-10">
                      <div>
                        <h3 className="text-sm text-cyan-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> 1. Simple Summary</h3>
                        <p className="text-gray-200 leading-relaxed text-lg">{explanation.simpleSummary}</p>
                      </div>
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      
                      <div>
                        <h3 className="text-sm text-green-400 font-bold uppercase tracking-wider mb-3">2. Main Purpose</h3>
                        <p className="text-gray-300 leading-relaxed">{explanation.mainPurpose}</p>
                      </div>
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                      {/* HTML MODE */}
                      {explanation.mode === 'html' && (
                        <>
                          <div><h3 className="text-sm text-yellow-400 font-bold uppercase tracking-wider mb-3">3. Page Structure</h3><div className="text-gray-300 space-y-2">{explanation.pageStructure.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-indigo-400 font-bold uppercase tracking-wider mb-3">4. Important HTML Elements</h3><div className="text-gray-300 space-y-2">{explanation.importantElements.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-blue-400 font-bold uppercase tracking-wider mb-3">5. Section Breakdown</h3><div className="text-gray-300 space-y-2">{explanation.sectionBreakdown.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          {explanation.formExplanation && (
                            <><div><h3 className="text-sm text-pink-400 font-bold uppercase tracking-wider mb-3">6. Form Explanation</h3><div className="text-gray-300 space-y-2">{explanation.formExplanation.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div></>
                          )}
                          {explanation.tableExplanation && (
                            <><div><h3 className="text-sm text-purple-400 font-bold uppercase tracking-wider mb-3">7. Table Explanation</h3><div className="text-gray-300 space-y-2">{explanation.tableExplanation.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div></>
                          )}
                          <div><h3 className="text-sm text-red-400 font-bold uppercase tracking-wider mb-3">8. Accessibility and SEO</h3><div className="text-gray-300 space-y-2">{explanation.accessibilitySeo.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          {explanation.dataAttributes && (
                            <><div><h3 className="text-sm text-teal-400 font-bold uppercase tracking-wider mb-3">9. Data Attributes</h3><div className="text-gray-300 space-y-2">{explanation.dataAttributes.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div></>
                          )}
                          {explanation.externalFiles && (
                            <><div><h3 className="text-sm text-emerald-400 font-bold uppercase tracking-wider mb-3">10. External Files</h3><div className="text-gray-300 space-y-2">{explanation.externalFiles.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div></>
                          )}
                        </>
                      )}

                      {/* REACT MODE */}
                      {explanation.mode === 'react' && (
                        <>
                          <div><h3 className="text-sm text-yellow-400 font-bold uppercase tracking-wider mb-3">3. Components</h3><div className="text-gray-300 space-y-2">{explanation.components.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-indigo-400 font-bold uppercase tracking-wider mb-3">4. State Management</h3><div className="text-gray-300 space-y-2">{explanation.stateManagement.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-blue-400 font-bold uppercase tracking-wider mb-3">5. Hooks Used</h3><div className="text-gray-300 space-y-2">{explanation.hooksUsed.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          {explanation.memoizedValues && (
                            <><div><h3 className="text-sm text-pink-400 font-bold uppercase tracking-wider mb-3">6. Memoized Values</h3><div className="text-gray-300 space-y-2">{explanation.memoizedValues.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div></>
                          )}
                          <div><h3 className="text-sm text-purple-400 font-bold uppercase tracking-wider mb-3">7. Event Handlers</h3><div className="text-gray-300 space-y-2">{explanation.eventHandlers.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-teal-400 font-bold uppercase tracking-wider mb-3">8. JSX Structure</h3><div className="text-gray-300 space-y-2">{explanation.jsxStructure.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-emerald-400 font-bold uppercase tracking-wider mb-3">9. Data Flow</h3><div className="text-gray-300 space-y-2">{explanation.dataFlow.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </>
                      )}

                      {/* JAVASCRIPT MODE */}
                      {explanation.mode === 'javascript' && (
                        <>
                          <div><h3 className="text-sm text-yellow-400 font-bold uppercase tracking-wider mb-3">3. Important Parts</h3><div className="text-gray-300 space-y-2">{explanation.importantParts.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-blue-400 font-bold uppercase tracking-wider mb-3">4. Step-by-Step Flow</h3><div className="text-gray-300 space-y-2">{explanation.stepByStepFlow.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          {explanation.classBreakdown && (
                            <><div><h3 className="text-sm text-indigo-400 font-bold uppercase tracking-wider mb-3">5. Class Breakdown</h3><div className="text-gray-300 space-y-2">{explanation.classBreakdown.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div></>
                          )}
                          <div><h3 className="text-sm text-pink-400 font-bold uppercase tracking-wider mb-3">6. Function Breakdown</h3><div className="text-gray-300 space-y-2">{explanation.functionBreakdown.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-emerald-400 font-bold uppercase tracking-wider mb-3">7. Data Flow</h3><div className="text-gray-300 space-y-2">{explanation.dataFlow.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </>
                      )}

                      {/* PYTHON MODE */}
                      {explanation.mode === 'python' && (
                        <>
                          <div><h3 className="text-sm text-yellow-400 font-bold uppercase tracking-wider mb-3">3. Important Parts</h3><div className="text-gray-300 space-y-2">{explanation.importantParts.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-blue-400 font-bold uppercase tracking-wider mb-3">4. Step-by-Step Flow</h3><div className="text-gray-300 space-y-2">{explanation.stepByStepFlow.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-pink-400 font-bold uppercase tracking-wider mb-3">5. Function/Class Breakdown</h3><div className="text-gray-300 space-y-2">{explanation.functionClassBreakdown.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-emerald-400 font-bold uppercase tracking-wider mb-3">6. Data Flow</h3><div className="text-gray-300 space-y-2">{explanation.dataFlow.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </>
                      )}

                      {/* CSS MODE */}
                      {explanation.mode === 'css' && (
                        <>
                          <div><h3 className="text-sm text-yellow-400 font-bold uppercase tracking-wider mb-3">3. Selectors Used</h3><div className="text-gray-300 space-y-2">{explanation.selectorsUsed.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-blue-400 font-bold uppercase tracking-wider mb-3">4. Styling Groups</h3><div className="text-gray-300 space-y-2">{explanation.stylingGroups.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-indigo-400 font-bold uppercase tracking-wider mb-3">5. Layout Techniques</h3><div className="text-gray-300 space-y-2">{explanation.layoutTechniques.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          {explanation.animationExplanation && (
                            <><div><h3 className="text-sm text-pink-400 font-bold uppercase tracking-wider mb-3">6. Animation/Transition</h3><div className="text-gray-300 space-y-2">{explanation.animationExplanation.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div></>
                          )}
                          <div><h3 className="text-sm text-emerald-400 font-bold uppercase tracking-wider mb-3">7. Responsive Design</h3><div className="text-gray-300 space-y-2">{explanation.responsiveDesign.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </>
                      )}

                      {/* UNKNOWN MODE */}
                      {explanation.mode === 'unknown' && (
                        <>
                          <div><h3 className="text-sm text-yellow-400 font-bold uppercase tracking-wider mb-3">3. Detected Tokens</h3><div className="text-gray-300 space-y-2">{explanation.detectedTokens.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <div><h3 className="text-sm text-blue-400 font-bold uppercase tracking-wider mb-3">4. Structure</h3><div className="text-gray-300 space-y-2">{explanation.structure.split('\n').map((l,i)=><p key={i}>{l.replace(/\*\*/g,'')}</p>)}</div></div><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </>
                      )}

                      <div>
                        <h3 className="text-sm text-amber-400 font-bold uppercase tracking-wider mb-3">Beginner Explanation</h3>
                        <p className="text-gray-300 leading-relaxed">{explanation.beginnerExplanation}</p>
                      </div>
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                      <div>
                        <h3 className="text-sm text-orange-400 font-bold uppercase tracking-wider mb-3">Possible Improvements</h3>
                        <ul className="text-gray-300 leading-relaxed space-y-2 list-disc list-inside">
                          {explanation.improvements.split('\n').filter(Boolean).map((line, i) => (
                            <li key={i}>{line.replace(/^- /, '')}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 1 && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-sm text-green-400 font-bold uppercase tracking-wider mb-4">Detected Patterns</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {explanation.patterns.map((p, i) => (
                            <div key={i} className="bg-[#1a1a20] border border-white/10 p-4 rounded-xl shadow-md">
                              <h4 className="text-green-400 font-bold mb-1">{p.name}</h4>
                              <p className="text-gray-400 text-sm">{p.description}</p>
                            </div>
                          ))}
                          {explanation.patterns.length === 0 && <span className="text-gray-500 text-sm">No specific patterns detected.</span>}
                        </div>
                      </div>
                      <div>
                         <h3 className="text-sm text-orange-400 font-bold uppercase tracking-wider mb-4">Code Structure Heatmap</h3>
                         <div className="flex justify-center">
                           <BentoGrid text={code.substring(0, 40) || "EMPTY"} />
                         </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 2 && (
                    <div className="h-full">
                      <CodeBlock text={JSON.stringify(explanation, null, 2)} language="json" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Button variant="outline" onClick={handleCopy} disabled={!explanation || isLoading} className="flex-1 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 rounded-xl h-[44px]">
                <Copy className="w-4 h-4 mr-2" /> Copy Output
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={!explanation || isLoading} className="flex-1 border-purple-500/20 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 rounded-xl h-[44px]">
                <Download className="w-4 h-4 mr-2" /> Download .txt
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="mt-32 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-500">
              Powerful Code Analysis
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="glass-panel p-8 rounded-[24px] flex flex-col items-center text-center gap-5 glass-panel-hover transition-all duration-300 cursor-default group">
                <div className="p-4 bg-green-500/10 rounded-2xl group-hover:bg-green-500/20 transition-colors">
                  <FileText className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Plain English</h3>
                <p className="text-gray-400 leading-relaxed">Get a simple, jargon-free summary of what the code does, perfect for beginners and non-technical founders.</p>
             </div>
             <div className="glass-panel p-8 rounded-[24px] flex flex-col items-center text-center gap-5 glass-panel-hover transition-all duration-300 cursor-default group">
                <div className="p-4 bg-cyan-500/10 rounded-2xl group-hover:bg-cyan-500/20 transition-colors">
                  <Settings2 className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Pattern Detection</h3>
                <p className="text-gray-400 leading-relaxed">Automatically detects imports, components, hooks, loops, conditionals, and API integration logic.</p>
             </div>
             <div className="glass-panel p-8 rounded-[24px] flex flex-col items-center text-center gap-5 glass-panel-hover transition-all duration-300 cursor-default group">
                <div className="p-4 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors">
                  <Download className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Export & Download</h3>
                <p className="text-gray-400 leading-relaxed">Copy the explanations instantly to your clipboard or download them as a standalone `.txt` document.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
