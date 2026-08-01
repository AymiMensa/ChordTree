const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'import { ChordNode, ChordLink, PlaybackState, ProgressionStep, CustomChord } from "./types";',
  'import { ChordNode, ChordLink, PlaybackState, ProgressionStep } from "./types";\nimport { CustomChord } from "./components/FreeModeEditor";'
);

fs.writeFileSync('src/App.tsx', code);
