export const detectMode = (code: string, selectedLanguage: string): string => {
  const lang = selectedLanguage.toLowerCase();
  
  if (lang.includes('html') || code.includes('</div>') || code.includes('</body>')) {
    return 'html';
  }
  if (lang.includes('react') || code.includes('useState') || code.includes('useEffect') || code.includes('from \'react\'')) {
    return 'react';
  }
  if (lang.includes('typescript') || lang.includes('ts') || code.includes('interface ') || code.includes('type ')) {
    return 'typescript';
  }
  if (lang.includes('javascript') || lang.includes('js') || code.includes('function ') || code.includes('const ')) {
    return 'javascript';
  }
  if (lang.includes('python') || code.includes('def ') || code.includes('print(') || code.includes('import ')) {
    return 'python';
  }
  if (lang.includes('css') || code.includes('{') && code.includes(':') && code.includes('px')) {
    return 'css';
  }
  
  return 'unknown';
};
