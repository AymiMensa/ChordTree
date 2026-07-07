const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `import { CHORD_NOTES, TRANSITION_CHORD_NOTES } from "./utils/audioNotes";`,
  `import { parseChordLabelToNotes } from "./utils/chordParser";`
);

code = code.replace(
  /const defaultNotes = \["C", "E", "G"\];\s*let notes = CHORD_NOTES\[currentLabel\] \|\| TRANSITION_CHORD_NOTES\[currentLabel\] \|\| defaultNotes;/g,
  `let notes = parseChordLabelToNotes(currentLabel);`
);

code = code.replace(
  /notes = CHORD_NOTES\[currentLabel\] \|\| TRANSITION_CHORD_NOTES\[currentLabel\] \|\| defaultNotes;/g,
  `notes = parseChordLabelToNotes(currentLabel);`
);

fs.writeFileSync('src/App.tsx', code);
