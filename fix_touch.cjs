const fs = require('fs');
let code = fs.readFileSync('src/components/ChordTreeSvg.tsx', 'utf8');

code = code.replace(
  'const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {',
  'const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {\n    if (e.cancelable) e.preventDefault();'
);

fs.writeFileSync('src/components/ChordTreeSvg.tsx', code);
