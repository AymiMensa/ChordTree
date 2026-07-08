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
  if (chordName.endsWith("m(maj7)")) return { type: "m(maj7)", root: chordName.slice(0, -7), name: "Minor Major 7th", formula: "1 - ♭3 - 5 - 7", intervals: [0, 3, 7, 11] };
  if (chordName.endsWith("maj7")) return { type: "maj7", root: chordName.slice(0, -4), name: "Major 7th", formula: "1 - 3 - 5 - 7", intervals: [0, 4, 7, 11] };
  if (chordName.endsWith("m7b5")) return { type: "m7b5", root: chordName.slice(0, -4), name: "Half-Diminished 7th", formula: "1 - ♭3 - ♭5 - ♭7", intervals: [0, 3, 6, 10] };
  if (chordName.endsWith("dim7")) return { type: "dim7", root: chordName.slice(0, -4), name: "Diminished 7th", formula: "1 - ♭3 - ♭5 - 𝄫7", intervals: [0, 3, 6, 9] };
  if (chordName.endsWith("dim")) return { type: "dim", root: chordName.slice(0, -3), name: "Diminished", formula: "1 - ♭3 - ♭5", intervals: [0, 3, 6] };
  if (chordName.endsWith("aug")) return { type: "aug", root: chordName.slice(0, -3), name: "Augmented", formula: "1 - 3 - ♯5", intervals: [0, 4, 8] };
  if (chordName.endsWith("m7")) return { type: "m7", root: chordName.slice(0, -2), name: "Minor 7th", formula: "1 - ♭3 - 5 - ♭7", intervals: [0, 3, 7, 10] };
  if (chordName.endsWith("7")) return { type: "7", root: chordName.slice(0, -1), name: "Dominant 7th", formula: "1 - 3 - 5 - ♭7", intervals: [0, 4, 7, 10] };
  if (chordName.endsWith("m")) return { type: "m", root: chordName.slice(0, -1), name: "Minor", formula: "1 - ♭3 - 5", intervals: [0, 3, 7] };
  return { type: "M", root: chordName, name: "Major", formula: "1 - 3 - 5", intervals: [0, 4, 7] };
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
 * Get chord spelling names using chromatic scale
 */
export function getChordSpelling(chordName: string): string[] {
    const midiNotes = getChordMidiNotes(chordName);
    const noteNames = midiNotes.map(n => CHROMATIC_SCALE[n % 12]);
    const uniqueNotes: string[] = [];
    noteNames.forEach(n => {
      if (!uniqueNotes.includes(n)) {
        uniqueNotes.push(n);
      }
    });
    return uniqueNotes;
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
