export interface DetectedPattern {
  name: string;
  description: string;
}

export type ExplanationResult = 
  | HtmlExplanation
  | ReactExplanation
  | JavascriptExplanation
  | PythonExplanation
  | CssExplanation
  | UnknownExplanation;

interface BaseExplanation {
  mode: string;
  simpleSummary: string;
  mainPurpose: string;
  beginnerExplanation: string;
  improvements: string;
  patterns: DetectedPattern[];
}

export interface HtmlExplanation extends BaseExplanation {
  mode: 'html';
  pageStructure: string;
  importantElements: string;
  sectionBreakdown: string;
  formExplanation?: string;
  tableExplanation?: string;
  accessibilitySeo: string;
  dataAttributes?: string;
  externalFiles?: string;
}

export interface ReactExplanation extends BaseExplanation {
  mode: 'react';
  components: string;
  stateManagement: string;
  hooksUsed: string;
  memoizedValues?: string;
  eventHandlers: string;
  jsxStructure: string;
  dataFlow: string;
}

export interface JavascriptExplanation extends BaseExplanation {
  mode: 'javascript';
  importantParts: string;
  stepByStepFlow: string;
  classBreakdown?: string;
  functionBreakdown: string;
  dataFlow: string;
}

export interface PythonExplanation extends BaseExplanation {
  mode: 'python';
  importantParts: string;
  stepByStepFlow: string;
  functionClassBreakdown: string;
  dataFlow: string;
}

export interface CssExplanation extends BaseExplanation {
  mode: 'css';
  selectorsUsed: string;
  stylingGroups: string;
  layoutTechniques: string;
  animationExplanation?: string;
  responsiveDesign: string;
}

export interface UnknownExplanation extends BaseExplanation {
  mode: 'unknown';
  detectedTokens: string;
  structure: string;
}

export function detectLanguageMode(code: string, selectedLanguage: string): 'html' | 'react' | 'javascript' | 'python' | 'css' | 'unknown' {
  const lang = selectedLanguage.toLowerCase();
  const lowerCode = code.toLowerCase();

  // 1. HTML
  if (lang === 'html' || 
      lowerCode.includes('<!doctype html') || 
      lowerCode.includes('<html') || 
      (lowerCode.includes('<body') && lowerCode.includes('<section'))) {
    return 'html';
  }

  // 2. React
  if (lang === 'react' || 
      code.includes('import React') || 
      code.includes('from "react"') || 
      code.includes('useState') || 
      code.includes('useEffect') || 
      code.includes('useMemo') || 
      (code.includes('export default function') && /return\s*\(?\s*</.test(code)) ||
      (code.includes('className=') && /<[A-Z]\w+/.test(code))) {
    return 'react';
  }

  // 3. JavaScript / TypeScript
  if (lang === 'javascript' || lang === 'typescript' || 
      code.includes('const ') || code.includes('let ') || code.includes('function ') || code.includes('=>')) {
    return 'javascript';
  }

  // 4. Python
  if (lang === 'python' || 
      code.includes('def ') || 
      (code.includes('import ') && !code.includes('from ')) || 
      code.includes('print(') || 
      (code.includes('class ') && code.includes(':')) ||
      code.includes('if __name__ == "__main__":')) {
    return 'python';
  }

  // 5. CSS
  if (lang === 'css' || 
      (code.includes('{') && code.includes(':') && code.includes(';') && (code.includes('color') || code.includes('padding') || code.includes('margin')))) {
    return 'css';
  }

  return 'unknown';
}

export function explainCode(code: string, language: string): ExplanationResult {
  const mode = detectLanguageMode(code, language);
  switch (mode) {
    case 'html': return explainHTML(code);
    case 'react': return explainReact(code);
    case 'javascript': return explainJavaScript(code);
    case 'python': return explainPython(code);
    case 'css': return explainCSS(code);
    default: return explainUnknown(code);
  }
}

// -------------------------------------------------------------
// HTML EXPLAINER
// -------------------------------------------------------------
function explainHTML(code: string): HtmlExplanation {
  const patterns: DetectedPattern[] = [];
  const lowerCode = code.toLowerCase();
  
  const titleMatch = code.match(/<title>([^<]+)<\/title>/i);
  const h1Match = code.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const strongMatch = code.match(/<strong[^>]*>([^<]+)<\/strong>/i);
  const brandMatch = code.match(/class="[^"]*brand[^"]*"[^>]*>([^<]+)<\//i);

  const rawTitle = titleMatch ? titleMatch[1].trim() : (h1Match ? h1Match[1].trim() : "Webpage");
  const brandName = strongMatch ? strongMatch[1].trim() : (brandMatch ? brandMatch[1].trim() : rawTitle.split('-')[0].trim() || "Website");
  const pageTitle = h1Match ? h1Match[1].trim() : rawTitle;

  const sectionBreakdownArr: string[] = [];
  const sectionRegex = /<section[^>]*id="([^"]+)"|<section[^>]*class="([^"]+)"/gi;
  let sMatch;
  while ((sMatch = sectionRegex.exec(code)) !== null) {
    const sectionName = (sMatch[1] || sMatch[2]).split(' ')[0].replace(/-/g, ' ');
    if (sectionName) sectionBreakdownArr.push(`- **${sectionName} section**`);
  }
  const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
  let h2Match;
  while ((h2Match = h2Regex.exec(code)) !== null) {
    sectionBreakdownArr.push(`- **${h2Match[1].trim()}**`);
  }
  const sections = Array.from(new Set(sectionBreakdownArr));
  
  const elements = ["header", "nav", "main", "section", "article", "aside", "form", "input", "select", "option", "checkbox", "textarea", "button", "table", "caption", "thead", "tbody", "tr", "th", "td", "footer", "link", "script", "meta"];
  const foundElements = elements.filter(el => lowerCode.includes(`<${el}`) || lowerCode.includes(`type="${el}"`));

  let summary = `This HTML builds a **${brandName}** layout (specifically: ${pageTitle}) with `;
  if (foundElements.includes("nav")) summary += "navigation, ";
  if (sections.length > 0) summary += "various content sections, ";
  if (foundElements.includes("table")) summary += "structured data tables, ";
  if (foundElements.includes("form")) summary += "and user input forms.";
  if (summary.endsWith(", ")) summary = summary.slice(0, -2) + ".";
  
  let purpose = `The primary purpose is to structure the layout and content for the **${pageTitle}**, providing the semantic foundation for the user interface.`;

  let structure = "";
  if (lowerCode.includes("<!doctype html>")) structure += "- **<!DOCTYPE html>**: Defines the document type.\n";
  if (lowerCode.includes("<html")) structure += "- **html tag**: The root of the document.\n";
  if (lowerCode.includes("<head")) structure += "- **head section**: Contains metadata, links, and scripts.\n";
  if (lowerCode.includes("<body")) structure += "- **body section**: Contains the visible content.\n";
  if (foundElements.includes("header")) structure += "- **header**: The top area of the page.\n";
  if (foundElements.includes("nav")) structure += "- **nav**: The navigation menu.\n";
  if (foundElements.includes("main")) structure += "- **main**: The primary content container.\n";
  if (foundElements.includes("section")) structure += "- **sections**: Grouped areas of related content.\n";
  if (foundElements.includes("footer")) structure += "- **footer**: The bottom area of the page.\n";

  let importantEls = foundElements.length > 0 ? foundElements.map(el => `- **${el}**`).join("\n") : "No major semantic elements detected.";
  let sectionBreakdown = sections.length > 0 ? sections.slice(0, 10).join("\n") : "Generic sections detected based on tags.";

  let formExp = "";
  if (foundElements.includes("form")) {
    const formLabels = Array.from(code.matchAll(/<form[^>]*aria-label="([^"]+)"/gi)).map(m => m[1]);
    formExp = `The code contains forms to collect user input.\n`;
    if (formLabels.length > 0) formExp += `Detected forms: ${formLabels.map(l => `**${l}**`).join(', ')}\n`;
    const formContent = code.match(/<form[\s\S]*?<\/form>/gi) || [];
    const fields = new Set<string>();
    formContent.forEach(f => {
      if (f.includes('<input')) fields.add('input fields');
      if (f.includes('<select')) fields.add('dropdowns');
      if (f.includes('<textarea')) fields.add('text areas');
      if (f.includes('<button')) fields.add('submit buttons');
    });
    formExp += Array.from(fields).map(f => `- **${f}**`).join('\n');
  }

  let tableExp = "";
  if (foundElements.includes("table")) {
    const captionMatch = code.match(/<caption>([^<]+)<\/caption>/i);
    const thMatches = Array.from(code.matchAll(/<th[^>]*>([^<]+)<\/th>/gi)).map(m => m[1].trim()).filter(Boolean);
    tableExp = `The code displays structured data in a table.\n`;
    if (captionMatch) tableExp += `**Table Purpose**: ${captionMatch[1].trim()}\n`;
    if (thMatches.length > 0) tableExp += `**Columns**: ${thMatches.join(', ')}\n`;
  }

  let a11y = "";
  if (code.match(/<nav[^>]*aria-label="([^"]+)"/i)) a11y += "- **aria-label on nav**: Provides screen readers with navigation context.\n";
  if (lowerCode.includes("alt=")) a11y += "- **alt text**: Describes images for visually impaired users.\n";
  if (lowerCode.includes("viewport")) a11y += "- **meta viewport**: Ensures the page is responsive on mobile.\n";
  if (!a11y) a11y = "No specific accessibility attributes detected.";

  let dataAttrs = "";
  const dataMatch = Array.from(code.matchAll(/data-([a-z-]+)="/g)).map(m => m[1]);
  if (dataMatch.length > 0) {
    const uniqueData = Array.from(new Set(dataMatch));
    dataAttrs = `Found custom data attributes: ${uniqueData.map(d => `**data-${d}**`).join(", ")}.`;
  }

  let external = "";
  if (lowerCode.includes('rel="stylesheet"')) external += "- **stylesheet link**: Connects the HTML to external CSS.\n";
  if (lowerCode.includes('script src')) external += "- **external script**: Loads JavaScript into the page.\n";

  let beginner = "HTML is like the skeleton of a house. ";
  if (foundElements.includes("header")) beginner += "**header** is the roof. ";
  if (foundElements.includes("nav")) beginner += "**nav** is the hallway. ";
  if (foundElements.includes("section")) beginner += "**section** tags group related furniture in a room. ";
  if (foundElements.includes("form")) beginner += "**form** acts like a mailbox collecting letters. ";

  let improvements = "";
  if (lowerCode.includes("<img") && !lowerCode.includes("alt=")) improvements += "- Add alt text for images to improve accessibility.\n";
  if (foundElements.includes("form")) improvements += "- Add validation feedback for form submissions.\n";
  improvements += "- Add responsive CSS to ensure layout works on mobile.\n";

  return {
    mode: 'html',
    simpleSummary: summary,
    mainPurpose: purpose,
    pageStructure: structure,
    importantElements: importantEls,
    sectionBreakdown: sectionBreakdown,
    formExplanation: formExp || undefined,
    tableExplanation: tableExp || undefined,
    accessibilitySeo: a11y,
    dataAttributes: dataAttrs || undefined,
    externalFiles: external || undefined,
    patterns: patterns,
    beginnerExplanation: beginner,
    improvements: improvements
  };
}

// -------------------------------------------------------------
// REACT EXPLAINER
// -------------------------------------------------------------
function explainReact(code: string): ReactExplanation {
  const patterns: DetectedPattern[] = [];
  const functionDefs = Array.from(code.matchAll(/(?:function\s+([A-Z]\w+)|(?:const|let|var)\s+([A-Z]\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>)/g));
  const components = functionDefs.map(m => m[1] || m[2]).filter(Boolean);
  
  const useStates = Array.from(code.matchAll(/const\s+\[\s*(\w+)\s*,\s*set[A-Z]\w*\s*\]\s*=\s*useState/g)).map(m => m[1]);
  const useMemos = Array.from(code.matchAll(/const\s+(\w+)\s*=\s*useMemo/g)).map(m => m[1]);
  const eventHandlers = Array.from(code.matchAll(/(?:const|function)\s+(handle\w+|onClick|onChange|onSubmit)/g)).map(m => m[1]);

  if (useStates.length > 0) patterns.push({ name: "Stateful Component", description: "Manages local state." });
  if (useMemos.length > 0) patterns.push({ name: "Memoization", description: "Caches expensive calculations." });
  if (code.includes("useEffect")) patterns.push({ name: "Side Effects", description: "Runs logic on mount/update." });

  let summary = `This React code defines UI components capable of rendering and managing state.`;
  if (components.length > 0) summary = `This React code defines the **${components[0]}** component.`;
  
  let purpose = `The purpose is to render an interactive web interface.`;
  
  let compDesc = components.length > 0 ? components.map(c => `- **${c}**: React component returning JSX.`).join('\n') : "No named components found.";
  let stateDesc = useStates.length > 0 ? useStates.map(s => `- **${s}**: State variable.`).join('\n') : "No local state (useState) detected.";
  
  let hooksDesc = "";
  if (code.includes("useState")) hooksDesc += "- **useState**: Used to store data that updates the UI when changed.\n";
  if (code.includes("useEffect")) hooksDesc += "- **useEffect**: Used to run side effects (like API calls or subscriptions) after render.\n";
  if (code.includes("useMemo")) hooksDesc += "- **useMemo**: Used to optimize performance by caching values.\n";
  if (!hooksDesc) hooksDesc = "No standard React hooks detected.";

  let memoDesc = useMemos.length > 0 ? useMemos.map(m => `- **${m}**: Memoized to avoid unnecessary recalculations.`).join('\n') : undefined;
  
  let eventDesc = eventHandlers.length > 0 ? Array.from(new Set(eventHandlers)).map(e => `- **${e}**: Handles user interactions.`).join('\n') : "No explicit event handler functions detected.";

  let jsx = "The component returns a JSX tree to define the visual layout.";
  if (code.includes(".map(")) jsx += " It uses `.map()` to render lists dynamically.";
  
  let flow = "Props / State → Component Logic → JSX Render";

  let beginner = "Think of a React component like a smart TV screen. The state is the current channel, and when you press a button (event handler), the state changes and the screen updates automatically.";
  
  let improvements = "- Add TypeScript interfaces for component props.\n";
  if (code.includes("fetch")) improvements += "- Handle loading and error states for data fetching.\n";

  return {
    mode: 'react',
    simpleSummary: summary,
    mainPurpose: purpose,
    components: compDesc,
    stateManagement: stateDesc,
    hooksUsed: hooksDesc,
    memoizedValues: memoDesc,
    eventHandlers: eventDesc,
    jsxStructure: jsx,
    dataFlow: flow,
    patterns: patterns,
    beginnerExplanation: beginner,
    improvements: improvements
  };
}

// -------------------------------------------------------------
// JAVASCRIPT EXPLAINER
// -------------------------------------------------------------
function explainJavaScript(code: string): JavascriptExplanation {
  const patterns: DetectedPattern[] = [];
  
  // 1. Detect structures
  const functionDefs = Array.from(code.matchAll(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>)/g)).map(m => m[1] || m[2]);
  const classDefs = Array.from(code.matchAll(/class\s+(\w+)/g)).map(m => m[1]);
  const varMatch = Array.from(code.matchAll(/(?:const|let|var)\s+(\w+)\s*=/g)).map(m => m[1]);
  const vars = Array.from(new Set(varMatch)).filter(v => !functionDefs.includes(v));

  const hasAsync = code.includes("async ") || code.includes("await ");
  const hasPromise = code.includes("Promise") || code.includes(".then(");
  const hasFetch = code.includes("fetch(");
  const hasDOM = code.includes("document.querySelector") || code.includes("document.getElementById") || code.includes("document.createElement");
  const hasEvents = code.includes("addEventListener");
  const hasStorage = code.includes("localStorage") || code.includes("sessionStorage");
  const hasLoops = code.match(/\b(for|while|forEach)\b/);
  const hasArrayMethods = code.match(/\.(map|filter|reduce|find)\b/);
  const hasObjects = code.includes("{") && code.includes(":");
  const hasArrays = code.includes("[") && code.includes("]");
  const hasConsole = code.includes("console.log");

  // Populate patterns (Main JavaScript Features Used)
  if (functionDefs.length > 0) patterns.push({ name: "Functions", description: "Reusable logic blocks." });
  if (classDefs.length > 0) patterns.push({ name: "Classes", description: "Object-oriented blueprints." });
  if (vars.length > 0) patterns.push({ name: "Variables", description: "Stores data references." });
  if (hasAsync || hasPromise) patterns.push({ name: "Asynchronous Logic", description: "Handles async operations." });
  if (hasFetch) patterns.push({ name: "API Calls", description: "Network requests via fetch." });
  if (hasDOM) patterns.push({ name: "DOM Manipulation", description: "Selects HTML elements." });
  if (hasEvents) patterns.push({ name: "Event Listeners", description: "Listens for user interactions." });
  if (hasStorage) patterns.push({ name: "Web Storage", description: "Browser persistence." });
  if (hasLoops) patterns.push({ name: "Loops", description: "Iterates over data." });
  if (hasArrayMethods) patterns.push({ name: "Array Methods", description: "Transforms and filters data." });

  // Overviews
  let summary = `This JavaScript code defines dynamic logic and processes data.`;
  if (hasDOM && hasEvents) summary = `This JavaScript code creates an interactive frontend by manipulating the DOM and handling user events.`;
  else if (hasFetch) summary = `This JavaScript code communicates with an external API to fetch and process data.`;
  else if (classDefs.length > 0) summary = `This JavaScript code uses Object-Oriented Programming (OOP) to define classes and methods.`;
  
  let purpose = `The main purpose is to execute instructions and manage data flow dynamically.`;

  // Important Parts (Main JavaScript Features Used)
  let parts = "";
  if (vars.length > 0) parts += `- **Variables**: Uses ${vars.length > 5 ? 'multiple variables' : vars.slice(0, 5).join(', ')} to store state.\n`;
  if (hasArrays) parts += `- **Arrays**: Uses arrays to manage lists of data.\n`;
  if (hasObjects) parts += `- **Objects**: Uses objects to group related properties.\n`;
  if (hasLoops) parts += `- **Loops**: Uses loops (for, while, or forEach) to repeat actions.\n`;
  if (hasArrayMethods) parts += `- **Array Methods**: Uses functional methods like map, filter, or reduce to process lists.\n`;
  if (hasFetch) parts += `- **Fetch/API**: Connects to an external server to send or receive data.\n`;
  if (hasAsync) parts += `- **Async/Await**: Waits for asynchronous operations to complete without blocking the code.\n`;
  if (hasPromise) parts += `- **Promises**: Handles future results of asynchronous tasks.\n`;
  if (hasDOM) parts += `- **DOM Selectors**: Finds elements on the web page using DOM methods.\n`;
  if (hasEvents) parts += `- **Event Listeners**: Reacts to user actions like clicks or keyboard inputs.\n`;
  if (hasStorage) parts += `- **Storage**: Saves data locally in the browser so it persists after a refresh.\n`;
  if (hasConsole) parts += `- **Console Output**: Prints information to the developer console for debugging or results.\n`;
  if (!parts) parts = "- Code executes basic instructions sequentially.\n";

  // Code Flow
  let flow = "1. Code execution begins.\n2. Variables and functions are defined.\n3. Processing logic is executed.\n4. Output is generated.";
  if (hasDOM && hasEvents) {
    flow = "1. HTML elements are selected from the DOM.\n2. Event listeners are attached to elements.\n3. When an event occurs, callback functions execute.\n4. The DOM or internal state is updated.";
  } else if (hasFetch && hasAsync) {
    flow = "1. Variables and async functions are initialized.\n2. An asynchronous API request is triggered.\n3. Code waits for the response.\n4. Data is parsed and processed.\n5. Results are used or displayed.";
  }

  // Class Breakdown
  const classBreakdownArr: string[] = [];
  if (classDefs.length > 0) {
    const methodRegex = /^\s*(async\s+)?([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/gm;
    let mMatch;
    while ((mMatch = methodRegex.exec(code)) !== null) {
      const isAsync = mMatch[1] ? "async " : "";
      const methodName = mMatch[2];
      if (["function", "if", "for", "switch", "while", "catch"].includes(methodName)) continue;
      classBreakdownArr.push(`- **${methodName}()**: ${isAsync}method defined inside a class.`);
    }
  }
  let classBreakdown = classDefs.length > 0 ? classDefs.map(c => `- **${c}**: Class definition.`).join('\n') + (classBreakdownArr.length ? '\n' + classBreakdownArr.join('\n') : '') : undefined;

  // Function Breakdown
  let funcBreakdownArr: string[] = [];
  const funcBlockRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>)/g;
  let fMatch;
  while ((fMatch = funcBlockRegex.exec(code)) !== null) {
    const name = fMatch[1] || fMatch[2];
    const isArrow = code.substring(fMatch.index, fMatch.index + 50).includes("=>") ? "Arrow function" : "Function";
    funcBreakdownArr.push(`- **${name}()**: ${isArrow} that encapsulates specific logic.`);
  }

  // Data Handling
  let dFlow = "Data is assigned to variables, passed into functions as arguments, and returned as results.";
  if (hasFetch) dFlow += "\nData is exchanged with external servers via API requests.";
  if (hasStorage) dFlow += "\nData is persisted in the browser's storage.";
  if (hasDOM) dFlow += "\nData is read from or written to HTML elements.";

  let beginner = "Think of this code like a recipe. The variables are your ingredients, the functions are the cooking steps, and the code runs from top to bottom to create the final dish.";
  
  let improvements = "";
  if (!code.includes("try") && !code.includes("catch") && (hasFetch || hasAsync || hasPromise)) improvements += "- Add try/catch blocks to handle potential network or async errors safely.\n";
  if (varMatch.length > 0 && code.includes("var ")) improvements += "- Use 'const' and 'let' instead of 'var' for safer variable scoping.\n";
  if (functionDefs.length === 0 && code.length > 200) improvements += "- Break down the code into smaller, reusable functions.\n";
  if (!improvements) improvements = "- Add input validation and error handling.\n- Add comments explaining complex logic.\n";

  return {
    mode: 'javascript',
    simpleSummary: summary,
    mainPurpose: purpose,
    importantParts: parts.trim(),
    stepByStepFlow: flow,
    classBreakdown: classBreakdown,
    functionBreakdown: funcBreakdownArr.length > 0 ? funcBreakdownArr.join('\n') : "No named functions detected.",
    dataFlow: dFlow,
    patterns: patterns,
    beginnerExplanation: beginner,
    improvements: improvements
  };
}

// -------------------------------------------------------------
// PYTHON EXPLAINER
// -------------------------------------------------------------
function explainPython(code: string): PythonExplanation {
  const patterns: DetectedPattern[] = [];
  
  const functionDefs = Array.from(code.matchAll(/def\s+(\w+)/g)).map(m => m[1]);
  const classDefs = Array.from(code.matchAll(/class\s+(\w+)/g)).map(m => m[1]);
  
  if (functionDefs.length > 0) patterns.push({ name: "Functions", description: "Python def blocks." });
  if (classDefs.length > 0) patterns.push({ name: "Classes", description: "Python OOP classes." });
  if (code.includes("import ")) patterns.push({ name: "Imports", description: "External module usage." });

  let summary = "This Python script defines functional logic and data structures.";
  let purpose = "To execute Python logic, process data, or define objects.";
  
  let parts = "";
  if (classDefs.length > 0) parts += `- **Classes**: ${classDefs.join(', ')}\n`;
  if (functionDefs.length > 0) parts += `- **Functions**: ${functionDefs.join(', ')}\n`;
  if (code.includes("print(")) parts += `- **print**: Used for terminal output.\n`;
  if (code.includes("for ") || code.includes("while ")) parts += `- **Loops**: Iteration structures.\n`;
  if (!parts) parts = "No major named structures detected.";

  let flow = "1. Imports and definitions are loaded.\n2. Classes and functions are initialized.\n3. Main execution flow runs.";
  
  let breakdown = "";
  if (classDefs.length > 0) breakdown += classDefs.map(c => `- **${c}**: Python class.`).join('\n') + '\n';
  if (functionDefs.length > 0) breakdown += functionDefs.map(f => `- **${f}()**: Python function.`).join('\n');
  if (!breakdown) breakdown = "No classes or functions defined.";

  let dFlow = "Inputs → Python Functions / Methods → Outputs / Print statements";
  let beginner = "Think of this Python code as a recipe. The functions are the steps, and the classes are the tools used to prepare the final dish.";
  
  let improvements = "- Add type hints for function arguments and return types.\n- Add docstrings to explain function purposes.\n";

  return {
    mode: 'python',
    simpleSummary: summary,
    mainPurpose: purpose,
    importantParts: parts,
    stepByStepFlow: flow,
    functionClassBreakdown: breakdown,
    dataFlow: dFlow,
    patterns: patterns,
    beginnerExplanation: beginner,
    improvements: improvements
  };
}

// -------------------------------------------------------------
// CSS EXPLAINER
// -------------------------------------------------------------
function explainCSS(code: string): CssExplanation {
  const patterns: DetectedPattern[] = [];
  
  const classSelectors = Array.from(code.matchAll(/\.([a-zA-Z0-9_-]+)\s*\{/g)).map(m => m[1]);
  const idSelectors = Array.from(code.matchAll(/#([a-zA-Z0-9_-]+)\s*\{/g)).map(m => m[1]);

  if (code.includes("flex")) patterns.push({ name: "Flexbox", description: "Used for layout alignment." });
  if (code.includes("grid")) patterns.push({ name: "CSS Grid", description: "Used for structured layouts." });
  if (code.includes("@media")) patterns.push({ name: "Media Queries", description: "Responsive design." });
  if (code.includes("transition") || code.includes("animation")) patterns.push({ name: "Animations", description: "Smooth visual changes." });

  let summary = "This CSS code defines the visual styling, layout, and presentation for HTML elements.";
  let purpose = "To control the appearance and structure of the user interface.";
  
  let selectors = "";
  if (classSelectors.length > 0) selectors += `- **Classes**: .${classSelectors.slice(0, 10).join(', .')}\n`;
  if (idSelectors.length > 0) selectors += `- **IDs**: #${idSelectors.slice(0, 10).join(', #')}\n`;
  if (!selectors) selectors = "Standard element selectors used.";

  let styling = "Groups properties like colors, margins, and padding to design elements.";
  let layout = "";
  if (code.includes("flex")) layout += "- Uses **Flexbox** for one-dimensional layouts.\n";
  if (code.includes("grid")) layout += "- Uses **Grid** for two-dimensional layouts.\n";
  if (code.includes("position: absolute")) layout += "- Uses **absolute positioning** for exact placement.\n";
  if (!layout) layout = "Uses standard block/inline flow layouts.";

  let anim = "";
  if (code.includes("transition")) anim += "- Uses **transitions** for smooth hover states.\n";
  if (code.includes("@keyframes")) anim += "- Uses **keyframes** for custom animations.\n";

  let responsive = code.includes("@media") ? "Uses media queries to adapt the design for mobile, tablet, or desktop screens." : "No explicit media queries detected.";
  
  let beginner = "CSS is the paint and interior design of a house. It dictates the colors, where the furniture is placed, and how things look when you interact with them.";
  let improvements = "- Group related selectors to reduce redundancy.\n- Use CSS variables for consistent theming and colors.\n";

  return {
    mode: 'css',
    simpleSummary: summary,
    mainPurpose: purpose,
    selectorsUsed: selectors,
    stylingGroups: styling,
    layoutTechniques: layout,
    animationExplanation: anim || undefined,
    responsiveDesign: responsive,
    patterns: patterns,
    beginnerExplanation: beginner,
    improvements: improvements
  };
}

// -------------------------------------------------------------
// UNKNOWN EXPLAINER
// -------------------------------------------------------------
function explainUnknown(code: string): UnknownExplanation {
  const patterns: DetectedPattern[] = [];
  
  return {
    mode: 'unknown',
    simpleSummary: "This snippet contains unrecognized or generic code.",
    mainPurpose: "To define configuration, text, or unrecognized commands.",
    detectedTokens: "No recognizable language keywords detected.",
    structure: "Flat text or data structure.",
    patterns: patterns,
    beginnerExplanation: "This looks like raw data or a language that isn't fully supported yet.",
    improvements: "Consider specifying the correct language format."
  };
}
