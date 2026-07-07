const fs = require('fs');
let code = fs.readFileSync('src/components/ChordTreeSvg.tsx', 'utf8');

code = code.replace(
  'const radius = (node.level === 0 ? 35 : 26) * baseScale;\n      \n      if (dist < radius + 10 && dist < minDist) {',
  'const radius = (node.level === 0 ? 35 : 26) * baseScale;\n      const scaleToFit = Math.min(dimensions.w, dimensions.h) / (viewLimit * 2);\n      const minTouchRadius = 22 / scaleToFit;\n      const hitRadius = Math.max(radius + 10, minTouchRadius);\n      \n      if (dist < hitRadius && dist < minDist) {'
);

fs.writeFileSync('src/components/ChordTreeSvg.tsx', code);
