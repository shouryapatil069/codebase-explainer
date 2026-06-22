import React, { useEffect, useRef } from 'react';

const CodeBlock: React.FC<any> = ({ text, language }) => {
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-800 bg-black/60 p-4 font-mono text-sm shadow-xl backdrop-blur-md">
      <div className="absolute top-0 right-0 p-2 text-xs text-gray-500 uppercase">{language}</div>
      <pre className="text-gray-300 whitespace-pre-wrap mt-4">{text}</pre>
    </div>
  );
};

export default CodeBlock;
