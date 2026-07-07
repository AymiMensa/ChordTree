const fs = require('fs');
let code = fs.readFileSync('src/chordTreeData.ts', 'utf8');

code = code.replace(
  '"A#m": [\n    { to: "E#m", label: "E#7" },\n    { to: "G#m", label: "G#7" },\n    { to: "C#m", label: "C#7" }\n  ]',
  '"A#m": [\n    { to: "Fm", label: "F7" },\n    { to: "G#m", label: "G#7" },\n    { to: "C#m", label: "C#7" }\n  ]'
);

fs.writeFileSync('src/chordTreeData.ts', code);
