const fs = require('fs');
let code = fs.readFileSync('src/components/ChordTreeSvg.tsx', 'utf8');

code = code.replace(
  'className="absolute inset-0 cursor-pointer touch-none"',
  'className="absolute inset-0 w-full h-full cursor-pointer touch-none" style={{ width: "100%", height: "100%" }}'
);

// Also set initial dimensions synchronously
code = code.replace(
  '    observer.observe(containerRef.current);\n    return () => observer.disconnect();',
  '    observer.observe(containerRef.current);\n    const rect = containerRef.current.getBoundingClientRect();\n    setDimensions({ w: rect.width, h: rect.height });\n    return () => observer.disconnect();'
);

fs.writeFileSync('src/components/ChordTreeSvg.tsx', code);
