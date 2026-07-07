const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'notes: rootNode.notes },\n    { type: "node", id: rootNode.id',
  'notes: ["G", "B", "D", "F"] },\n    { type: "node", id: rootNode.id'
);

fs.writeFileSync('src/App.tsx', code);
