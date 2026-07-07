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
  let isMinor = false;
  let isDominant = false;
  let root = chordName;

  if (chordName.endsWith('7')) {
    isDominant = true;
    root = chordName.slice(0, -1);
  } else if (chordName.endsWith('m')) {
    isMinor = true;
    root = chordName.slice(0, -1);
  }

  const offset = NOTE_OFFSETS[root] ?? 0;
  const baseRoot = 48 + offset; // Guaranteed to be in C3 (48) - B3 (59) range
  
  if (isMinor) {
    // Standard Minor root position: 1, b3, 5
    return [baseRoot, baseRoot + 3, baseRoot + 7];
  } else if (isDominant) {
    // Standard Dominant 7th root position: 1, 3, 5, b7
    return [baseRoot, baseRoot + 4, baseRoot + 7, baseRoot + 10];
  } else {
    // Standard Major root position: 1, 3, 5
    return [baseRoot, baseRoot + 4, baseRoot + 7];
  }
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
  let isMinor = false;
  let isDominant = false;
  let root = chordName;

  if (chordName.endsWith('7')) {
    isDominant = true;
    root = chordName.slice(0, -1);
  } else if (chordName.endsWith('m')) {
    isMinor = true;
    root = chordName.slice(0, -1);
  }

  const uniqueNotes = getChordSpelling(chordName);

  if (isMinor) {
    return {
      fullName: `${root} Minor`,
      formula: "1 - ♭3 - 5",
      notes: uniqueNotes
    };
  } else if (isDominant) {
    return {
      fullName: `${root} Dominant 7th`,
      formula: "1 - 3 - 5 - ♭7",
      notes: uniqueNotes
    };
  } else {
    return {
      fullName: `${root} Major`,
      formula: "1 - 3 - 5",
      notes: uniqueNotes
    };
  }
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
