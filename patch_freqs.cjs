const fs = require('fs');
let code = fs.readFileSync('src/utils/audioNotes.ts', 'utf8');
code = code.replace(
  '"Fb": 329.63, // equivalent to E4\n};',
  '"Fb": 329.63, // equivalent to E4\n  "E#": 349.23,\n  "B#": 261.63,\n};'
);
fs.writeFileSync('src/utils/audioNotes.ts', code);
