const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const PREFER_FLATS = ["F", "Bb", "Eb", "Ab", "Db", "Gb"];

function getNoteIndex(note: string): number {
  let idx = SHARP_NOTES.indexOf(note);
  if (idx === -1) idx = FLAT_NOTES.indexOf(note);
  return idx !== -1 ? idx : 0;
}

export function parseChordLabelToNotes(label: string): string[] {
  const regex = /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/;
  const match = label.match(regex);
  if (!match) return ["C", "E", "G"];
  return parseChordToNotes(match[1], match[2] || "", match[3]);
}

export function parseChordToNotes(root: string, quality: string, bass?: string): string[] {
  const rootIdx = getNoteIndex(root);
  const useFlats = PREFER_FLATS.includes(root);
  const scale = useFlats ? FLAT_NOTES : SHARP_NOTES;
  
  const getNote = (semitones: number) => scale[(rootIdx + semitones) % 12];
  
  let notes: string[] = [];

  switch (quality) {
    // Major Group
    case "":
    case "M":
    case "maj":
      notes = [getNote(0), getNote(4), getNote(7)]; break;
    case "M7":
    case "maj7":
      notes = [getNote(0), getNote(4), getNote(7), getNote(11)]; break;
    case "7":
      notes = [getNote(0), getNote(4), getNote(7), getNote(10)]; break;
    case "6":
      notes = [getNote(0), getNote(4), getNote(7), getNote(9)]; break;
    case "sus2":
      notes = [getNote(0), getNote(2), getNote(7)]; break;
    case "sus4":
    case "sus":
      notes = [getNote(0), getNote(5), getNote(7)]; break;
    case "7sus4":
      notes = [getNote(0), getNote(5), getNote(7), getNote(10)]; break;
    case "aug":
    case "Aug":
      notes = [getNote(0), getNote(4), getNote(8)]; break;
    case "M7+5":
      notes = [getNote(0), getNote(4), getNote(8), getNote(11)]; break;
    case "7+5":
      notes = [getNote(0), getNote(4), getNote(8), getNote(10)]; break;
    case "-5":
      notes = [getNote(0), getNote(4), getNote(6)]; break;
    case "7-5":
      notes = [getNote(0), getNote(4), getNote(6), getNote(10)]; break;
    case "5":
    case "power":
      notes = [getNote(0), getNote(7)]; break;
    case "M9":
    case "maj9":
      notes = [getNote(0), getNote(4), getNote(7), getNote(11), getNote(2)]; break;
    case "9":
      notes = [getNote(0), getNote(4), getNote(7), getNote(10), getNote(2)]; break;
    case "69":
      notes = [getNote(0), getNote(4), getNote(7), getNote(9), getNote(2)]; break;
    case "11":
      notes = [getNote(0), getNote(4), getNote(7), getNote(10), getNote(2), getNote(5)]; break;
    case "13":
      notes = [getNote(0), getNote(4), getNote(7), getNote(10), getNote(2), getNote(9)]; break;
    case "add9":
      notes = [getNote(0), getNote(4), getNote(7), getNote(2)]; break;
    case "7-9":
      notes = [getNote(0), getNote(4), getNote(7), getNote(10), getNote(1)]; break;
    case "7-9+5":
      notes = [getNote(0), getNote(4), getNote(8), getNote(10), getNote(1)]; break;
    case "7+9":
      notes = [getNote(0), getNote(4), getNote(7), getNote(10), getNote(3)]; break;
    case "9+5":
      notes = [getNote(0), getNote(4), getNote(8), getNote(10), getNote(2)]; break;
    case "9-5":
      notes = [getNote(0), getNote(4), getNote(6), getNote(10), getNote(2)]; break;
    case "9+11":
      notes = [getNote(0), getNote(4), getNote(7), getNote(10), getNote(2), getNote(6)]; break;
    case "13-9":
      notes = [getNote(0), getNote(4), getNote(7), getNote(10), getNote(1), getNote(9)]; break;
    case "13-9-5":
      notes = [getNote(0), getNote(4), getNote(6), getNote(10), getNote(1), getNote(9)]; break;
    // Minor Group
    case "m":
    case "min":
      notes = [getNote(0), getNote(3), getNote(7)]; break;
    case "mM7":
      notes = [getNote(0), getNote(3), getNote(7), getNote(11)]; break;
    case "m7":
    case "min7":
      notes = [getNote(0), getNote(3), getNote(7), getNote(10)]; break;
    case "m6":
      notes = [getNote(0), getNote(3), getNote(7), getNote(9)]; break;
    case "m-5":
    case "dim":
      notes = [getNote(0), getNote(3), getNote(6)]; break;
    case "m7-5":
    case "m7b5":
      notes = [getNote(0), getNote(3), getNote(6), getNote(10)]; break;
    case "dim7":
      notes = [getNote(0), getNote(3), getNote(6), getNote(9)]; break;
    case "mM9":
      notes = [getNote(0), getNote(3), getNote(7), getNote(11), getNote(2)]; break;
    case "m9":
    case "min9":
      notes = [getNote(0), getNote(3), getNote(7), getNote(10), getNote(2)]; break;
    case "m69":
      notes = [getNote(0), getNote(3), getNote(7), getNote(9), getNote(2)]; break;
    case "m11":
    case "min11":
      notes = [getNote(0), getNote(3), getNote(7), getNote(10), getNote(2), getNote(5)]; break;
    case "madd9":
      notes = [getNote(0), getNote(3), getNote(7), getNote(2)]; break;
    case "madd11":
      notes = [getNote(0), getNote(3), getNote(7), getNote(5)]; break;
    case "omit3":
      notes = [getNote(0), getNote(7)]; break;
    case "omit5":
      notes = [getNote(0), getNote(4)]; break;
    default:
      notes = [getNote(0), getNote(4), getNote(7)]; break;
  }

  if (bass) {
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
}
