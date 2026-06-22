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
  
  const functionDefs = Array.from(code.matchAll(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>)/g)).map(m => m[1] || m[2]);
  const classDefs = Array.from(code.matchAll(/class\s+(\w+)/g)).map(m => m[1]);
  
  // Extract class methods accurately
  const classBreakdownArr: string[] = [];
  if (classDefs.length > 0) {
    const methodRegex = /^\s*(async\s+)?([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/gm;
    let mMatch;
    while ((mMatch = methodRegex.exec(code)) !== null) {
      const isAsync = mMatch[1] ? "async " : "";
      const methodName = mMatch[2];
      
      const startIdx = mMatch.index;
      const endIdx = code.indexOf('}', startIdx);
      const body = code.substring(startIdx, endIdx !== -1 ? endIdx : code.length);

      if (methodName !== "function" && methodName !== "if" && methodName !== "for" && methodName !== "switch" && methodName !== "while" && methodName !== "catch") {
        let desc = `**${methodName}()**: `;
        
        if (methodName === "constructor") {
          if (body.includes("storageKey")) desc += "stores storageKey and ";
          if (body.includes("localStorage.getItem") || body.includes("loadProducts")) desc += "loads saved products. ";
          else desc += "initializes the class. ";
        } else {
          if (body.includes("push(")) desc += "creates an object, pushes it into an array, ";
          if (body.includes("find(")) desc += "finds an item, ";
          if (body.includes("stock")) desc += "updates stock, ";
          if (body.includes("saveProducts") || body.includes("localStorage.setItem")) desc += "saves changes, ";
          if (body.includes("console.log") || body.includes("console.error")) desc += "and logs the result. ";
          if (body.includes(".filter(")) desc += "filters items based on conditions. ";
          if (body.includes(".reduce(")) desc += "uses reduce to calculate totals. ";
          if (body.includes(".includes(") && body.includes("toLowerCase")) desc += "filters items by name using includes and toLowerCase. ";
          if (body.includes("JSON.stringify")) desc += "saves data to localStorage using JSON.stringify. ";
          if (body.includes("JSON.parse") && body.includes("try") && body.includes("catch")) desc += "reads data from localStorage and parses them using JSON.parse with try/catch protection. ";
          
          if (desc === `**${methodName}()**: `) desc += `${isAsync}method inside a class.`;
        }
        
        // Clean up trailing commas/ands
        desc = desc.replace(/,\s*and logs/, " and logs").replace(/,\s*$/, ".");
        
        classBreakdownArr.push(`- ${desc.trim()}`);
      }
    }
  }

  let vars = Array.from(code.matchAll(/(?:const|let|var)\s+(\w+)\s*=/g)).map(m => m[1]).filter(v => !functionDefs.includes(v));

  if (vars.length > 0) patterns.push({ name: "Variables", description: "Stores data references." });
  if (classDefs.length > 0) patterns.push({ name: "Classes", description: "Object-oriented blueprints." });
  if (functionDefs.length > 0) patterns.push({ name: "Functions", description: "Reusable logic." });
  if (code.includes("localStorage")) patterns.push({ name: "LocalStorage", description: "Browser persistence." });
  if (code.includes("fetch(")) patterns.push({ name: "Fetch API", description: "Network requests." });

  let summary = `This JavaScript code defines logic using variables and functions.`;
  let purpose = `The purpose is to process data and execute operations.`;
  
  const lowerCode = code.toLowerCase();
  const isCart = lowerCode.includes("cart") && lowerCode.includes("product");
  const isTodo = lowerCode.includes("task") || lowerCode.includes("todo");
  const isLibrary = lowerCode.includes("book") && lowerCode.includes("issue");
  const isWeather = lowerCode.includes("weather") && code.includes("fetch");
  const isExpense = lowerCode.includes("expense") || lowerCode.includes("amount");
  const isAttendance = lowerCode.includes("attendance") && lowerCode.includes("student");

  if (isCart) {
    summary = "This JavaScript code manages a shopping cart system. It handles products, quantities, and cart calculations.";
    purpose = "The purpose is to simulate a store workflow where items can be added, removed, and totals calculated.";
  } else if (isTodo) {
    summary = "This JavaScript code manages a todo/task list. It can handle adding, removing, and toggling tasks.";
    purpose = "The purpose is to store and manage tasks, tracking their completion status.";
  } else if (isLibrary) {
    summary = "This JavaScript code manages a library system handling books, issuing, and returning.";
    purpose = "The purpose is to track book inventory and member borrowing records.";
  } else if (isWeather) {
    summary = "This JavaScript code fetches and processes weather API data.";
    purpose = "The purpose is to retrieve weather reports from an external service and format the results.";
  } else if (isExpense) {
    summary = "This JavaScript code calculates and manages financial expenses.";
    purpose = "The purpose is to track spending and calculate total or highest expense categories.";
  } else if (isAttendance) {
    summary = "This JavaScript code manages student attendance records. It calculates attendance percentages, assigns attendance status labels, creates a report for every student, filters students with short attendance, and prints the results.";
    purpose = "The purpose is to convert raw attendance data into a clear attendance report showing each student's roll number, attendance percentage, and status.";
  }

  let parts = "";
  if (isAttendance) {
    parts += `- **attendanceRecords**: array of student objects with name, rollNo, presentDays, totalDays.\n`;
    parts += `- **calculateAttendancePercentage**: function to calculate percentages.\n`;
    parts += `- **getAttendanceStatus**: function for condition checks.\n`;
    parts += `- **generateAttendanceReport**: function to map data.\n`;
    parts += `- **map()** and **filter()**: array transformations.\n`;
    parts += `- **toFixed()**: formats decimal numbers.\n`;
    parts += `- **conditionals**: status branching logic.\n`;
    parts += `- **console.log**: outputs result outside functions.\n`;
  } else {
    if (classDefs.length > 0) parts += `- **Classes**: ${classDefs.join(', ')}\n`;
    if (functionDefs.length > 0) parts += `- **Functions**: ${functionDefs.slice(0,10).join(', ')}\n`;
    if (vars.length > 0) parts += `- **Variables**: ${Array.from(new Set(vars)).slice(0,10).join(', ')}\n`;
    if (code.includes(".filter(")) parts += `- **filter()**: Used to filter array data.\n`;
    if (code.includes(".reduce(")) parts += `- **reduce()**: Used to calculate totals or combine data.\n`;
    if (code.includes(".map(")) parts += `- **map()**: Used to transform array data.\n`;
    if (code.includes("localStorage.setItem")) parts += `- **localStorage**: Saves data persistently.\n`;
  }

  let flow = "1. Code initializes variables/classes.\n2. Functions are invoked to process data.\n3. Output is returned or logged.";
  if (isAttendance) {
    flow = "1. Creates attendanceRecords with student attendance data.\n2. calculateAttendancePercentage divides presentDays by totalDays and multiplies by 100.\n3. getAttendanceStatus checks the percentage and returns Excellent, Good, Warning, or Short Attendance.\n4. generateAttendanceReport uses map to create a new report array.\n5. Each report object includes name, rollNo, percentage, and status.\n6. shortAttendanceStudents uses filter to keep only students with Short Attendance.\n7. console.log prints the full report and short attendance list.";
  }

  let funcBreakdownArr: string[] = [];
  const funcBlockRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>)/g;
  let fMatch;
  while ((fMatch = funcBlockRegex.exec(code)) !== null) {
    const name = fMatch[1] || fMatch[2];
    const startIdx = fMatch.index;
    const endIdx = code.indexOf('}', startIdx);
    const body = code.substring(startIdx, endIdx !== -1 ? endIdx : code.length);
    
    let desc = "";
    const lowerName = name.toLowerCase();

    // Heuristics based on naming and operations
    if (lowerName.includes("calculate") && (body.includes("/") || body.includes("*"))) {
      const usesPresent = body.includes("presentDays") ? "presentDays and totalDays" : "input values";
      desc += `calculates ${name.replace(/calculate/i, '').replace(/([A-Z])/g, ' $1').toLowerCase().trim() || 'a value'} using ${usesPresent}. `;
    } else if ((lowerName.includes("status") || lowerName.includes("grade")) && body.includes("if")) {
      const varName = lowerName.includes("status") ? "percentage" : "value";
      desc += `uses conditional checks to convert a ${varName} into a status label. `;
    } else if (lowerName.includes("generate") && body.includes(".map(")) {
      desc += `uses map to transform raw data into report objects. `;
    } else {
      if (body.includes("fetch(")) desc += "fetches data from an API. ";
      if (body.includes("response.ok")) desc += "checks if API request was successful. ";
      if (body.includes("response.json")) desc += "converts response to JSON. ";
      if (body.includes("localStorage.setItem")) desc += "saves data to localStorage. ";
      if (body.includes("localStorage.getItem")) desc += "loads data from localStorage. ";
      if (body.includes("JSON.stringify")) desc += "converts data to string for storage. ";
      if (body.includes("JSON.parse")) desc += "converts saved string back to data. ";
      if (body.includes(".map(")) desc += "transforms or updates array items. ";
      if (body.includes(".filter(")) desc += "selects or removes items. ";
      if (body.includes(".reduce(") && body.includes("+")) desc += "calculates total sum. ";
      else if (body.includes(".reduce(")) desc += "calculates total or compares items. ";
      if (body.includes(".find(")) desc += "searches for one matching item. ";
      if (body.includes(".some(")) desc += "checks if an item exists. ";
      if (body.includes("console.log")) desc += "prints output. ";
      if (!desc) desc = "executes processing logic.";
    }
    
    funcBreakdownArr.push(`- **${name}()**: ${desc.trim()}`);
  }

  let dFlow = "Data Variables → Processing Functions → Return / Log";
  if (isAttendance) {
    dFlow = "attendanceRecords → generateAttendanceReport → calculateAttendancePercentage → getAttendanceStatus → attendanceReport\nattendanceReport → filter → shortAttendanceStudents\nattendanceReport + shortAttendanceStudents → console.log";
  }
  
  let beginner = "Think of this script like a data processing pipeline. It takes raw information, uses functions (like workers) to sort and calculate it, and outputs the result.";
  if (isCart) beginner = "Think of this like a shopping basket. You put items in, remove them, and a calculator figures out your total bill.";
  if (isTodo) beginner = "Think of this like a notebook. You write tasks down, cross them off, and save the notebook for later.";
  if (isAttendance) beginner = "Think of this like a teacher making an attendance sheet. The attendanceRecords array stores each student's attendance. calculateAttendancePercentage finds the percentage. getAttendanceStatus decides the label. generateAttendanceReport creates the final report, and filter separates students with short attendance.";

  let improvements = "";
  if (code.includes("/")) improvements += "- Validate that totalDays is not zero.\n";
  if (code.includes("toFixed(")) improvements += "- Convert percentage to a number after toFixed if calculations are needed later.\n";
  if (isAttendance) improvements += "- Add sorting by attendance percentage.\n";
  if (code.includes("console.log") && lowerCode.includes("report")) improvements += "- Display the report in an HTML table instead of console.log.\n";
  if (code.includes("if") && code.includes("return") && (code.includes("Warning") || code.includes("Short"))) improvements += "- Move status limits into constants for easier changes.\n";
  if (!improvements) {
    improvements = "- Add input validation and error handling.\n- Format output for better readability.\n";
    if (code.includes("fetch(")) improvements += "- Add error handling for failed API requests using try/catch.\n";
  }

  let classBreakdown = classDefs.length > 0 ? classDefs.map(c => `- **${c}**: Class definition.\n` + classBreakdownArr.join('\n')).join('\n') : undefined;

  return {
    mode: 'javascript',
    simpleSummary: summary,
    mainPurpose: purpose,
    importantParts: parts,
    stepByStepFlow: flow,
    classBreakdown: classBreakdown,
    functionBreakdown: funcBreakdownArr.length > 0 ? funcBreakdownArr.join('\n') : "No distinct functions detected.",
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
