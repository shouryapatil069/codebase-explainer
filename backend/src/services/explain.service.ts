import { detectMode } from '../utils/detectMode';

export const explainCodeService = (code: string, language: string) => {
  const mode = detectMode(code, language);
  
  // Basic rule-based pattern detection
  const patterns: string[] = [];
  if (code.includes('function') || code.includes('=>') || code.includes('def ')) {
    patterns.push('Functions');
  }
  if (code.includes('const ') || code.includes('let ') || code.includes('var ')) {
    patterns.push('Variables');
  }
  if (code.includes('class ')) {
    patterns.push('Classes');
  }
  if (code.includes('import ') || code.includes('require(')) {
    patterns.push('Imports');
  }

  // Generate a very simple plain English explanation
  let explanation = '';
  switch (mode) {
    case 'html':
      explanation = 'This is an HTML document. It defines the structure of a web page using tags.';
      break;
    case 'react':
      explanation = 'This is a React component. It builds user interfaces using JSX and may manage state.';
      break;
    case 'typescript':
      explanation = 'This is TypeScript code. It adds static typing to JavaScript to catch errors early.';
      break;
    case 'javascript':
      explanation = 'This is JavaScript code. It executes logic and handles dynamic behavior.';
      break;
    case 'python':
      explanation = 'This is Python code. It executes logic and processes data.';
      break;
    case 'css':
      explanation = 'This is CSS code. It styles HTML elements to make them look good.';
      break;
    default:
      explanation = 'This is a snippet of code. It executes instructions based on its syntax.';
  }

  return {
    mode,
    explanation,
    patterns
  };
};
