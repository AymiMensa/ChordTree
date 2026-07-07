const fs = require('fs');
let code = fs.readFileSync('src/components/ChordTreeSvg.tsx', 'utf8');

code = code.replace(
  'const nodeScale = isCurrent ? Math.max(1, 1 + Math.sin(time / 200) * 0.1) : 1;',
  '// Apply 4x scale for the currently playing node, with a slight pulsing effect\n        const targetScale = isCurrent ? 4 : 1;\n        const pulse = isCurrent ? Math.sin(time / 200) * 0.1 : 0;\n        const nodeScale = targetScale + pulse;'
);

fs.writeFileSync('src/components/ChordTreeSvg.tsx', code);
