const fs = require('fs');
let code = fs.readFileSync('src/utils/chordParser.ts', 'utf8');

const replacement = `export function parseChordToNotes(root: string, quality: string, bass?: string): string[] {
  const rootIdx = getNoteIndex(root);
  const useFlats = PREFER_FLATS.includes(root);
  const scale = useFlats ? FLAT_NOTES : SHARP_NOTES;
  
  const getNote = (semitones: number) => scale[(rootIdx + semitones) % 12];
  
  let notes: string[] = [];

  switch (quality) {`;

code = code.replace(/export function parseChordToNotes[\s\S]*?switch \(quality\) \{/, replacement);

code = code.replace(/return \[([^\]]+)\];( \/\/ fallback to major)?/g, (match, inner) => {
    return `notes = [${inner}]; break;`;
});

code = code.replace(/notes = \[getNote\(0\), getNote\(4\), getNote\(7\)\].*?break;(?=\s*\}\s*$)/, `notes = [getNote(0), getNote(4), getNote(7)]; break;`);


const bottomReplacement = `  }

  if (bass) {
    const flatBass = bass.replace('b', 'b'); // simple normalization if needed
    let bassIdx = notes.indexOf(bass);
    if (bassIdx === -1) {
      // try enharmonic equivalent if not found
      const bIdx = getNoteIndex(bass);
      const bassEnharmonics = [SHARP_NOTES[bIdx], FLAT_NOTES[bIdx]];
      bassIdx = notes.findIndex(n => bassEnharmonics.includes(n));
    }
    
    if (bassIdx !== -1) {
      // rotate notes so bass is first
      const before = notes.slice(0, bassIdx);
      const after = notes.slice(bassIdx);
      notes = [...after, ...before];
    } else {
      // just prepend it if it's a completely outside note
      notes.unshift(bass);
    }
  }

  return notes;
}`;

code = code.replace(/\s*\}\s*$/, bottomReplacement);

fs.writeFileSync('src/utils/chordParser.ts', code);
