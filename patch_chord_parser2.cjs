const fs = require('fs');
let code = fs.readFileSync('src/utils/chordParser.ts', 'utf8');

const replacement = `export function parseChordLabelToNotes(label: string): string[] {
  const regex = /^([A-G][#b]?)(.*?)(?:\\/([A-G][#b]?))?$/;
  const match = label.match(regex);
  if (!match) return ["C", "E", "G"];
  return parseChordToNotes(match[1], match[2] || "", match[3]);
}

export function parseChordToNotes`;

code = code.replace(/export function parseChordToNotes/, replacement);

fs.writeFileSync('src/utils/chordParser.ts', code);
