const fs = require('fs');
let code = fs.readFileSync('src/chordTreeData.ts', 'utf8');
code = code.replace(/\u00A0/g, ' '); // remove non-breaking spaces
fs.writeFileSync('src/chordTreeData.ts', code);
