const fs = require('fs');
let code = fs.readFileSync('src/chordTreeData.ts', 'utf8');

code = code.replace(
  `import { CHORD_NOTES, TRANSITION_CHORD_NOTES } from "./utils/audioNotes";`,
  `import { parseChordLabelToNotes } from "./utils/chordParser";`
);

code = code.replace(
  /const defaultNotes = \["C", "E", "G"\];\s*const notes = CHORD_NOTES\[currentLabel\] \|\| TRANSITION_CHORD_NOTES\[currentLabel\] \|\| defaultNotes;/g,
  `const notes = parseChordLabelToNotes(currentLabel);`
);

fs.writeFileSync('src/chordTreeData.ts', code);
