/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChordTreeNode {
  id: string;          // Unique identifier (e.g. root-C-Cm-Eb-Ebm)
  name: string;        // Chord name (e.g. "Cm", "Eb", "G7")
  type: 'major' | 'minor' | 'dominant';
  depth: number;
  parentId: string | null;
  path: string[];
  cx?: number;         // Layout injection
  cy?: number;
  children: ChordTreeNode[];
}

export const NOTE_OFFSETS: Record<string, number> = {
  "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5,
  "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11,
  "E#": 5
};

export const CHROMATIC_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const NATURAL_OFFSETS: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

export const QUIZ_CHORDS = [
  "Cm(maj7)", "Dm7b5", "Eaug", "Bdim",
  "C", "Dm", "Ebmaj7", "Fm", "Abmaj7", "B7",
  "Cm", "Em", "F", "G7", "Am", "Bm7b5",
  "Dbmaj7", "F7", "Gm", "Am7b5", "Bbmaj7",
  "C#dim", "D7", "Eb7", "Gm7b5", "Bbm",
  "C7", "Em7b5", "F#m7b5", "Gmaj7", "Bm",
  "Cdim", "Ebm", "Gb"
];

function parseChordType(chordName: string) {
  // Use regex to extract root and quality
  const match = chordName.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return { type: "M", root: chordName, name: "Major", formula: "1 - 3 - 5", intervals: [0, 4, 7] };
  
  const root = match[1];
  const quality = match[2];
  
  // Check patterns from longest to shortest to avoid partial matches
  // Major Group
  if (quality === "13-9-5") return { type: "13-9-5", root, name: "13th ♭9 ♭5", formula: "1 - 3 - ♭5 - ♭7 - ♭9 - 13", intervals: [0, 4, 6, 10, 13, 21] };
  if (quality === "13-9") return { type: "13-9", root, name: "13th ♭9", formula: "1 - 3 - 5 - ♭7 - ♭9 - 13", intervals: [0, 4, 7, 10, 13, 21] };
  if (quality === "9+11") return { type: "9+11", root, name: "9th ♯11", formula: "1 - 3 - 5 - ♭7 - 9 - ♯11", intervals: [0, 4, 7, 10, 14, 18] };
  if (quality === "9-5") return { type: "9-5", root, name: "9th ♭5", formula: "1 - 3 - ♭5 - ♭7 - 9", intervals: [0, 4, 6, 10, 14] };
  if (quality === "9+5") return { type: "9+5", root, name: "9th ♯5", formula: "1 - 3 - ♯5 - ♭7 - 9", intervals: [0, 4, 8, 10, 14] };
  if (quality === "7+9") return { type: "7+9", root, name: "7th ♯9", formula: "1 - 3 - 5 - ♭7 - ♯9", intervals: [0, 4, 7, 10, 15] };
  if (quality === "7-9+5") return { type: "7-9+5", root, name: "7th ♭9 ♯5", formula: "1 - 3 - ♯5 - ♭7 - ♭9", intervals: [0, 4, 8, 10, 13] };
  if (quality === "7-9") return { type: "7-9", root, name: "7th ♭9", formula: "1 - 3 - 5 - ♭7 - ♭9", intervals: [0, 4, 7, 10, 13] };
  if (quality === "add9") return { type: "add9", root, name: "Major add9", formula: "1 - 3 - 5 - 9", intervals: [0, 2, 4, 7] };
  if (quality === "13") return { type: "13", root, name: "13th", formula: "1 - 3 - 5 - ♭7 - 9 - 13", intervals: [0, 4, 7, 10, 14, 21] };
  if (quality === "11") return { type: "11", root, name: "11th", formula: "1 - 3 - 5 - ♭7 - 9 - 11", intervals: [0, 4, 7, 10, 14, 17] };
  if (quality === "69") return { type: "69", root, name: "6/9", formula: "1 - 3 - 5 - 6 - 9", intervals: [0, 4, 7, 9, 14] };
  if (quality === "9") return { type: "9", root, name: "9th", formula: "1 - 3 - 5 - ♭7 - 9", intervals: [0, 4, 7, 10, 14] };
  if (quality === "M9" || quality === "maj9") return { type: "M9", root, name: "Major 9th", formula: "1 - 3 - 5 - 7 - 9", intervals: [0, 4, 7, 11, 14] };
  if (quality === "7-5") return { type: "7-5", root, name: "7th ♭5", formula: "1 - 3 - ♭5 - ♭7", intervals: [0, 4, 6, 10] };
  if (quality === "7+5") return { type: "7+5", root, name: "7th ♯5", formula: "1 - 3 - ♯5 - ♭7", intervals: [0, 4, 8, 10] };
  if (quality === "M7+5") return { type: "M7+5", root, name: "Major 7th ♯5", formula: "1 - 3 - ♯5 - 7", intervals: [0, 4, 8, 11] };
  if (quality === "-5" || quality === "m-5") return { type: "dim", root, name: "Diminished", formula: "1 - ♭3 - ♭5", intervals: [0, 3, 6] };
  if (quality === "7sus4") return { type: "7sus4", root, name: "7th sus4", formula: "1 - 4 - 5 - ♭7", intervals: [0, 5, 7, 10] };
  if (quality === "sus4" || quality === "sus") return { type: "sus4", root, name: "Sus4", formula: "1 - 4 - 5", intervals: [0, 5, 7] };
  if (quality === "sus2") return { type: "sus2", root, name: "Sus2", formula: "1 - 2 - 5", intervals: [0, 2, 7] };
  if (quality === "6") return { type: "6", root, name: "Major 6th", formula: "1 - 3 - 5 - 6", intervals: [0, 4, 7, 9] };
  if (quality === "M7" || quality === "maj7") return { type: "M7", root, name: "Major 7th", formula: "1 - 3 - 5 - 7", intervals: [0, 4, 7, 11] };
  if (quality === "7") return { type: "7", root, name: "Dominant 7th", formula: "1 - 3 - 5 - ♭7", intervals: [0, 4, 7, 10] };
  if (quality === "aug" || quality === "Aug") return { type: "aug", root, name: "Augmented", formula: "1 - 3 - ♯5", intervals: [0, 4, 8] };
  if (quality === "5" || quality === "power") return { type: "5", root, name: "Power", formula: "1 - 5", intervals: [0, 7] };
  
  // Minor Group
  if (quality === "madd11") return { type: "madd11", root, name: "Minor add11", formula: "1 - ♭3 - 5 - 11", intervals: [0, 3, 7, 17] };
  if (quality === "madd9") return { type: "madd9", root, name: "Minor add9", formula: "1 - ♭3 - 5 - 9", intervals: [0, 2, 3, 7] };
  if (quality === "m11" || quality === "min11") return { type: "m11", root, name: "Minor 11th", formula: "1 - ♭3 - 5 - ♭7 - 9 - 11", intervals: [0, 3, 7, 10, 14, 17] };
  if (quality === "m69") return { type: "m69", root, name: "Minor 6/9", formula: "1 - ♭3 - 5 - ♭6 - 9", intervals: [0, 3, 7, 8, 14] };
  if (quality === "m9" || quality === "min9") return { type: "m9", root, name: "Minor 9th", formula: "1 - ♭3 - 5 - ♭7 - 9", intervals: [0, 3, 7, 10, 14] };
  if (quality === "mM9") return { type: "mM9", root, name: "Minor Major 9th", formula: "1 - ♭3 - 5 - 7 - 9", intervals: [0, 3, 7, 11, 14] };
  if (quality === "dim7") return { type: "dim7", root, name: "Diminished 7th", formula: "1 - ♭3 - ♭5 - 𝄫7", intervals: [0, 3, 6, 9] };
  if (quality === "m7-5" || quality === "m7b5") return { type: "m7b5", root, name: "Half-Diminished 7th", formula: "1 - ♭3 - ♭5 - ♭7", intervals: [0, 3, 6, 10] };
  if (quality === "m-5" || quality === "dim" || quality === "m5") return { type: "dim", root, name: "Diminished", formula: "1 - ♭3 - ♭5", intervals: [0, 3, 6] };
  if (quality === "m6") return { type: "m6", root, name: "Minor 6th", formula: "1 - ♭3 - 5 - 6", intervals: [0, 3, 7, 9] };
  if (quality === "m7" || quality === "min7") return { type: "m7", root, name: "Minor 7th", formula: "1 - ♭3 - 5 - ♭7", intervals: [0, 3, 7, 10] };
  if (quality === "mM7") return { type: "mM7", root, name: "Minor Major 7th", formula: "1 - ♭3 - 5 - 7", intervals: [0, 3, 7, 11] };
  if (quality === "m" || quality === "min") return { type: "m", root, name: "Minor", formula: "1 - ♭3 - 5", intervals: [0, 3, 7] };
  
  // Default to Major
  return { type: "M", root, name: "Major", formula: "1 - 3 - 5", intervals: [0, 4, 7] };
}
const MINOR_TO_MAJOR: Record<string, { parallel: string; relative: string; vi: string }> = {
  "Cm": { parallel: "C", relative: "Eb", vi: "Ab" },
  "Am": { parallel: "A", relative: "C", vi: "F" },
  "Em": { parallel: "E", relative: "G", vi: "C" },
  "Abm": { parallel: "Ab", relative: "B", vi: "E" },
  "Fm": { parallel: "F", relative: "Ab", vi: "Db" },
  "Ebm": { parallel: "Eb", relative: "Gb", vi: "B" },
  "Dm": { parallel: "D", relative: "F", vi: "Bb" },
  "F#m": { parallel: "F#", relative: "A", vi: "D" },
  "Gm": { parallel: "G", relative: "Bb", vi: "Eb" },
  "C#m": { parallel: "C#", relative: "E", vi: "A" },
  "G#m": { parallel: "G#", relative: "B", vi: "E" },
  "D#m": { parallel: "D#", relative: "F#", vi: "B" },
  "Gbm": { parallel: "Gb", relative: "A", vi: "D" },
  "Bbm": { parallel: "Bb", relative: "Db", vi: "Gb" },
  "Dbm": { parallel: "Db", relative: "E", vi: "A" },
  "A#m": { parallel: "A#", relative: "C#", vi: "F#" }
};

const MAJOR_TO_MINOR: Record<string, { parallel: string; relative: string }> = {
  "C": { parallel: "Cm", relative: "Am" },
  "A": { parallel: "Am", relative: "F#m" },
  "E": { parallel: "Em", relative: "C#m" },
  "G": { parallel: "Gm", relative: "Em" },
  "F": { parallel: "Fm", relative: "Dm" },
  "Ab": { parallel: "Abm", relative: "Fm" },
  "Eb": { parallel: "Ebm", relative: "Cm" },
  "B": { parallel: "Bm", relative: "G#m" },
  "Db": { parallel: "Dbm", relative: "Bbm" },
  "Gb": { parallel: "Gbm", relative: "Ebm" },
  "Bb": { parallel: "Bbm", relative: "Gm" },
  "D": { parallel: "Dm", relative: "Bm" },
  "F#": { parallel: "F#m", relative: "D#m" },
  "G#": { parallel: "G#m", relative: "F#m" },
  "C#": { parallel: "C#m", relative: "A#m" }
};

export function getDominant(target: string): string {
  const root = target.endsWith('m') ? target.slice(0, -1) : target;
  switch (root) {
    case "C": return "G7";
    case "C#": return "G#7";
    case "Db": return "Ab7";
    case "D": return "A7";
    case "D#": return "A#7";
    case "Eb": return "Bb7";
    case "E": return "B7";
    case "F": return "C7";
    case "F#": return "C#7";
    case "Gb": return "Db7";
    case "G": return "D7";
    case "G#": return "D#7";
    case "Ab": return "Eb7";
    case "A": return "E7";
    case "A#": return "E#7";
    case "Bb": return "F7";
    case "B": return "F#7";
    default: return "G7";
  }
}

/**
 * Get MIDI notes for a chord in standard voicings
 */
export function getChordMidiNotes(chordName: string): number[] {
  const parsed = parseChordType(chordName);
  const offset = NOTE_OFFSETS[parsed.root] ?? 0;
  const baseRoot = 48 + offset; // Guaranteed to be in C3 (48) - B3 (59) range
  
  return parsed.intervals.map(interval => baseRoot + interval);
}

/**
 * Spell a chord tone from its diatonic degree, rather than selecting an
 * enharmonic name from a keyboard/chromatic-scale lookup. For example,
 * Eb7 is Eb–G–Bb–Db, never D#–G–A#–C#.
 */
function accidentalString(delta: number): string {
  const normalized = ((delta + 6) % 12) - 6;
  if (normalized === 0) return "";
  if (normalized > 0) return "#".repeat(normalized);
  return "b".repeat(-normalized);
}

function spellChordTone(root: string, semitones: number, degreeOffset: number): string {
  const rootLetter = root[0];
  const rootIndex = LETTERS.indexOf(rootLetter);
  const letter = LETTERS[(rootIndex + degreeOffset) % LETTERS.length];
  const targetPc = (NOTE_OFFSETS[root] + semitones) % 12;
  const naturalPc = NATURAL_OFFSETS[letter];
  const diff = ((targetPc - naturalPc) % 12 + 12) % 12;
  const adjusted = diff > 6 ? diff - 12 : diff;
  return `${letter}${accidentalString(adjusted)}`;
}

function degreeForInterval(interval: number, chordType?: string): number {
  if (chordType === "dim7" && interval === 9) return 6;
  const degrees: Record<number, number> = {
    0: 0,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 4,
    7: 4,
    8: 4,
    9: 5,
    10: 6,
    11: 6,
    13: 1,
    14: 1,
    15: 1,
    17: 3,
    18: 3,
    21: 5,
  };
  return degrees[interval] ?? 0;
}

export function getChordSpelling(chordName: string): string[] {
  const parsed = parseChordType(chordName);
  const uniqueNotes: string[] = [];

  parsed.intervals.forEach((interval) => {
    const noteName = spellChordTone(parsed.root, interval, degreeForInterval(interval, parsed.type));
    if (!uniqueNotes.includes(noteName)) uniqueNotes.push(noteName);
  });

  return uniqueNotes;
}

/**
 * Compute the octave number for a written note name at a given MIDI pitch.
 * The octave is derived from the natural letter position (e.g. B#3 = MIDI 60,
 * Cb4 = MIDI 59, G##3 = MIDI 57) rather than the raw chromatic MIDI number.
 */
function octaveForSpelling(noteName: string, midi: number): number {
  const accMatch = noteName.match(/[#b]+$/);
  const accStr = accMatch ? accMatch[0] : "";
  let accSemitones = 0;
  for (const ch of accStr) {
    accSemitones += ch === "#" ? 1 : -1;
  }
  const naturalMidi = midi - accSemitones;
  return Math.floor(naturalMidi / 12) - 1;
}

/**
 * Convert a written note name with octave (e.g. "C4", "Eb3", "B#3", "Cb4", "G##3")
 * to a MIDI note number. Falls back to defaultMidi if the name cannot be parsed.
 */
export function noteNameToMidi(noteName: string, defaultMidi = 60): number {
  const match = noteName.match(/^([A-G])([#b]*)(\d+)$/);
  if (!match) return defaultMidi;
  const [, letter, accStr, octaveStr] = match;
  const octave = Number(octaveStr);
  let accSemitones = 0;
  for (const ch of accStr) {
    accSemitones += ch === "#" ? 1 : -1;
  }
  const naturalMidi = 12 * (octave + 1) + (NATURAL_OFFSETS[letter] ?? 0);
  return naturalMidi + accSemitones;
}

/**
 * Get chord spelling with octave numbers for staff notation.
 * Returns notes in strict root position order (root-3rd-5th-7th-...),
 * with the whole chord shifted into the treble-staff comfortable range:
 * root lands between G3 (55) and C4 (60), and the highest note never
 * exceeds G5 (79) — i.e. within two ledger lines above the staff.
 * Pitches always ascend left-to-right, never jumping.
 */
export function getChordSpellingWithOctave(chordName: string): string[] {
  const parsed = parseChordType(chordName);
  const rootOffset = NOTE_OFFSETS[parsed.root] ?? 0;
  const baseRoot = 48 + rootOffset; // C3 (48) to B3 (59)

  // Compute MIDI notes in strict root position order (intervals are already 0-3rd-5th-7th...)
  let midiNotes = parsed.intervals.map(interval => baseRoot + interval);

  // Shift the ENTIRE chord (not individual notes) so it sits in a comfortable
  // treble-clef register: root >= 55 (G3), max note <= 79 (G5).
  // This keeps root-position voicing intact AND stays within two ledger lines.
  const rootMidi = midiNotes[0];
  const maxMidi = Math.max(...midiNotes);
  let shift = 0;

  // Raise the whole chord if the root is too low (but never push max above G5)
  while (rootMidi + shift < 55 && maxMidi + shift + 12 <= 79) {
    shift += 12;
  }
  // Lower the whole chord if the top note is too high
  while (maxMidi + shift > 79) {
    shift -= 12;
  }
  if (shift !== 0) {
    midiNotes = midiNotes.map(m => m + shift);
  }

  const result: string[] = [];
  let prevMidi = -1;

  for (let i = 0; i < midiNotes.length; i++) {
    const midi = midiNotes[i];
    // Safety: guarantee strictly ascending pitch order (no jumps)
    if (i > 0 && midi <= prevMidi) {
      midiNotes[i] = prevMidi + 1;
    }

    const noteName = spellChordTone(parsed.root, parsed.intervals[i], degreeForInterval(parsed.intervals[i], parsed.type));
    // Compute octave from the written spelling (letter + accidentals), not raw MIDI,
    // so enharmonic spellings like B#, Cb, G## get correct octave numbers.
    const octave = octaveForSpelling(noteName, midiNotes[i]);
    const spelling = `${noteName}${octave}`;
    result.push(spelling);
    prevMidi = midiNotes[i];
  }

  return result;
}

/**
 * Returns chord formula and note names
 */
export function getChordDetails(chordName: string): {
  fullName: string;
  formula: string;
  notes: string[];
} {
  const parsed = parseChordType(chordName);
  const uniqueNotes = getChordSpelling(chordName);

  return {
    fullName: `${parsed.root} ${parsed.name}`,
    formula: parsed.formula,
    notes: uniqueNotes
  };
}

/**
 * Helper to build the chord progression tree recursively
 */
export function buildChordTree(maxDepth: number = 4): ChordTreeNode {
  const root: ChordTreeNode = {
    id: "root-C",
    name: "C",
    type: "major", // Root is Major (Pink) as seen in image
    depth: 0,
    parentId: null,
    path: ["C"],
    children: []
  };

  function recurse(node: ChordTreeNode, parentName: string | null) {
    if (node.depth >= maxDepth) return;

    if (node.depth === 0) {
      // Special Root Rule: C branches into Cm, Em, Am (ordered to match visual radial angles)
      const daughters = ["Cm", "Em", "Am"].filter(n => n !== parentName);
      node.children = daughters.map(name => {
        const child: ChordTreeNode = {
          id: `${node.id}-${name}`,
          name,
          type: "minor",
          depth: 1,
          parentId: node.id,
          path: [...node.path, name],
          children: []
        };
        recurse(child, node.name);
        return child;
      });
    } else if (node.type === "minor") {
      // Minor Rule: branches into 3 majors (parallel, relative, VI)
      const config = MINOR_TO_MAJOR[node.name];
      if (!config) return;

      const daughters = [config.parallel, config.relative, config.vi].filter(n => n !== parentName);
      node.children = daughters.map(name => {
        const child: ChordTreeNode = {
          id: `${node.id}-${name}`,
          name,
          type: "major",
          depth: node.depth + 1,
          parentId: node.id,
          path: [...node.path, name],
          children: []
        };
        recurse(child, node.name);
        return child;
      });
    } else if (node.type === "major") {
      // Major Rule: branches into 2 minors (parallel, relative)
      const config = MAJOR_TO_MINOR[node.name];
      if (!config) return;

      const daughters = [config.parallel, config.relative].filter(n => n !== parentName);
      node.children = daughters.map(name => {
        const child: ChordTreeNode = {
          id: `${node.id}-${name}`,
          name,
          type: "minor",
          depth: node.depth + 1,
          parentId: node.id,
          path: [...node.path, name],
          children: []
        };
        recurse(child, node.name);
        return child;
      });
    }
  }

  recurse(root, null);
  return root;
}

// Extract all nodes from tree as a flat array for searching path
export function flattenTree(node: ChordTreeNode): ChordTreeNode[] {
    const arr: ChordTreeNode[] = [node];
    for (const child of node.children) {
        arr.push(...flattenTree(child));
    }
    return arr;
}

// --- VARIANT B LOGIC ---
const chromaticB = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

function getIndexB(note: string) {
  const aliases: Record<string, string> = {
    'Db': 'C#', 'D#': 'Eb', 'Gb': 'F#', 'G#': 'Ab', 'A#': 'Bb'
  };
  const n = aliases[note] || note;
  return chromaticB.indexOf(n);
}

function getNoteB(index: number) {
  return chromaticB[(index % 12 + 12) % 12];
}

function getP5DownB(note: string) { 
  return getNoteB(getIndexB(note) + 5);
}

function getM3UpB(note: string) { 
  return getNoteB(getIndexB(note) + 3);
}

function getMaj3UpB(note: string) { 
  return getNoteB(getIndexB(note) + 4);
}

export function buildChordTreeB(maxDepth: number = 4): ChordTreeNode {
  function recurseB(name: string, type: 'major' | 'minor' | 'dominant' | 'Root', depth: number, state: string, parentId: string | null, parentPath: string[]): ChordTreeNode {
    const renderType = type === 'Root' ? 'major' : type;
    const currentId = parentId ? `${parentId}-${name}` : `root-${name}`;
    const currentPath = [...parentPath, name];

    const node: ChordTreeNode = {
      id: currentId,
      name,
      type: renderType,
      depth,
      parentId,
      path: currentPath,
      children: []
    };

    if (depth >= maxDepth) return node;

    const getMinor = (n: string, interval: number) => getNoteB(getIndexB(n) + interval) + 'm';
    const getMajor = (n: string, interval: number) => getNoteB(getIndexB(n) + interval);
    const rootName = name.replace('m', '').replace('7', '');

    if (type === 'Root' || type === 'major' || type === 'minor') {
        let targets: { name: string, t: 'major' | 'minor', s: string }[] = [];
        
        switch (state) {
            case 'ROOT':
                targets = [
                    { name: rootName + 'm', t: 'minor', s: 'N' },
                    { name: getMinor(rootName, 4), t: 'minor', s: 'E' }, // iii
                    { name: getMajor(rootName, 5), t: 'major', s: 'S' }, // IV
                    { name: getMinor(rootName, 9), t: 'minor', s: 'W' }  // vi
                ];
                break;
            case 'N':
                targets = [
                    { name: getMajor(rootName, 3), t: 'major', s: 'NE_N' }, // III
                    { name: getMinor(rootName, 5), t: 'minor', s: 'N' },    // iv
                    { name: getMajor(rootName, 8), t: 'major', s: 'NW' }    // VI
                ];
                break;
            case 'E':
                targets = [
                    { name: rootName, t: 'major', s: 'SE_leaf' },           // I
                    { name: getMinor(rootName, 5), t: 'minor', s: 'E' },    // iv
                    { name: getMajor(rootName, 3), t: 'major', s: 'NE_E' }  // III
                ];
                break;
            case 'S':
                targets = [
                    { name: rootName + 'm', t: 'minor', s: 'SW' },          // Parallel minor
                    { name: getMajor(rootName, 5), t: 'major', s: 'S' },    // IV
                    { name: getMinor(rootName, 9), t: 'minor', s: 'SE' }    // vi
                ];
                break;
            case 'W':
                targets = [
                    { name: getMajor(rootName, 8), t: 'major', s: 'NW' },   // VI
                    { name: getMinor(rootName, 5), t: 'minor', s: 'W' },    // iv
                    { name: rootName, t: 'major', s: 'SW_leaf' }            // I
                ];
                break;
            case 'NE_N':
                targets = [
                    { name: getMinor(rootName, 4), t: 'minor', s: 'E' },    // iii
                    { name: rootName + 'm', t: 'minor', s: 'N' }            // Parallel minor
                ];
                break;
            case 'NE_E':
                targets = [
                    { name: rootName + 'm', t: 'minor', s: 'E' },           // Parallel minor
                    { name: getMinor(rootName, 4), t: 'minor', s: 'N' }     // iii
                ];
                break;
            case 'NW':
                targets = [
                    { name: getMinor(rootName, 9), t: 'minor', s: 'N' },    // vi
                    { name: getMajor(rootName, 5), t: 'major', s: 'W' }     // IV
                ];
                break;
            case 'SW':
                targets = [
                    { name: getMajor(rootName, 8), t: 'major', s: 'W' },    // VI
                    { name: getMinor(rootName, 5), t: 'minor', s: 'SW' },   // iv
                    { name: rootName, t: 'major', s: 'S' }                  // I
                ];
                break;
            case 'SE':
                targets = [
                    { name: getMajor(rootName, 8), t: 'major', s: 'S' },    // VI
                    { name: getMinor(rootName, 5), t: 'minor', s: 'E' }     // iv
                ];
                break;
            case 'SE_leaf':
                targets = [
                    { name: getMinor(rootName, 9), t: 'minor', s: 'SE_next' } // vi
                ];
                break;
            case 'SW_leaf':
                targets = [
                    { name: getMinor(rootName, 4), t: 'minor', s: 'SW_next' } // iii
                ];
                break;
            default:
                // Generic fallback for very deep layers to prevent stopping
                if (type === 'minor') {
                    targets = [
                        { name: getMajor(rootName, 3), t: 'major', s: 'generic_M' },
                        { name: getMinor(rootName, 5), t: 'minor', s: 'generic_m' }
                    ];
                } else {
                    targets = [
                        { name: getMinor(rootName, 9), t: 'minor', s: 'generic_m' },
                        { name: getMajor(rootName, 5), t: 'major', s: 'generic_M' }
                    ];
                }
                break;
        }

        node.children = targets.map(t => {
            const domName = getDominant(t.name);
            return recurseB(domName, 'dominant', depth + 1, JSON.stringify(t), currentId, currentPath);
        });

    } else if (type === 'dominant') {
        const target = JSON.parse(state);
        node.children = [
            recurseB(target.name, target.t, depth + 1, target.s, currentId, currentPath)
        ];
    }

    return node;
  }

  return recurseB('C', 'Root', 0, 'ROOT', null, []);
}