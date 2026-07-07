const fs = require('fs');
let code = fs.readFileSync('src/components/ChordTreeSvg.tsx', 'utf8');

// The missing circle:
const missingCircle = `
                {/* Main node bubble */}
                <circle
                  r={(node.level === 0 ? 35 : 26) * baseScale}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={(isCurrent ? 3 : isPath ? 2 : isPlanned ? 1.5 : 1) * baseScale}
                  filter={isCurrent ? "url(#neon-glow-strong)" : undefined}
                  className={\`transition-all duration-700 \${isPlanned && !isPath ? "animate-pulse" : ""}\`}
                />
`;

code = code.replace(/\{\/\* Center dot inside node \*\/\}/, missingCircle + '\n                {/* Center dot inside node */}');

fs.writeFileSync('src/components/ChordTreeSvg.tsx', code);
