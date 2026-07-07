const fs = require('fs');
let code = fs.readFileSync('src/components/ChordTreeSvg.tsx', 'utf8');

// Fix the transform issue
code = code.replace(/<g\s+key=\{node\.id\}\s+style=\{\{\s+transform:\s+`translate\(\$\{coord\.x\}px,\s+\$\{coord\.y\}px\)\s+scale\(\$\{isCurrent\s+\?\s+4\s+:\s+1\}\)`,\s+transition:\s+'transform\s+0\.4s\s+cubic-bezier\(0\.34,\s+1\.56,\s+0\.64,\s+1\)'\s+\}\}/, 
`<g
  key={node.id}
  transform={\`translate(\${coord.x}, \${coord.y})\`}
  style={{
    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }}`);

// Apply the scale to a nested group instead, or directly to the elements
code = code.replace(/\{interactionMode === "fold"/, 
`<g style={{ 
  transform: \`scale(\${isCurrent ? 4 : 1})\`, 
  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  transformOrigin: '0 0'
}}>
  {interactionMode === "fold"`);

// Close the new nested group
code = code.replace(/<\/text>\n\s+<\/g>\n\s+\);\n\s+\}\)/, 
`</text>\n                </g>\n              </g>\n            );\n          })`);

// Remove complex effects
code = code.replace(/\{\/\* Hover Glow Diffusion \*\/\}.*?\{\/\* Center dot inside node \*\/\}/s, `{/* Center dot inside node */}`);

fs.writeFileSync('src/components/ChordTreeSvg.tsx', code);
