const fs = require('fs');

const newTreeData = `import { ChordNode, ChordLink } from "./types";
import { CHORD_NOTES, TRANSITION_CHORD_NOTES } from "./utils/audioNotes";

const NEIGHBORS: Record<string, string[]> = {
  // Major chords -> [Parallel Minor, Relative Minor, Mediant Minor]
  "C": ["Cm", "Am", "Em"],
  "Db": ["Dbm", "Bbm", "Fm"],
  "C#": ["C#m", "A#m", "Fm"],
  "D": ["Dm", "Bm", "F#m"],
  "Eb": ["Ebm", "Cm", "Gm"],
  "D#": ["D#m", "Cm", "Gm"],
  "E": ["Em", "C#m", "G#m"],
  "F": ["Fm", "Dm", "Am"],
  "F#": ["F#m", "D#m", "A#m"],
  "Gb": ["Gbm", "Ebm", "Bbm"],
  "G": ["Gm", "Em", "Bm"],
  "Ab": ["Abm", "Fm", "Cm"],
  "G#": ["G#m", "Fm", "Cm"],
  "A": ["Am", "F#m", "C#m"],
  "Bb": ["Bbm", "Gm", "Dm"],
  "A#": ["A#m", "Gm", "Dm"],
  "B": ["Bm", "G#m", "D#m"],
  "Cb": ["Abm", "Ebm", "Gbm"],

  // Minor chords -> [Parallel Major, Relative Major, Submediant Major]
  "Cm": ["C", "Eb", "Ab"],
  "C#m": ["C#", "E", "A"],
  "Dbm": ["Db", "E", "A"],
  "Dm": ["D", "F", "Bb"],
  "D#m": ["D#", "F#", "B"],
  "Ebm": ["Eb", "Gb", "B"],
  "Em": ["E", "G", "C"],
  "Fm": ["F", "Ab", "Db"],
  "F#m": ["F#", "A", "D"],
  "Gbm": ["Gb", "A", "D"],
  "Gm": ["G", "Bb", "Eb"],
  "G#m": ["G#", "B", "E"],
  "Abm": ["Ab", "B", "E"],
  "Am": ["A", "C", "F"],
  "A#m": ["A#", "C#", "F#"],
  "Bbm": ["Bb", "Db", "Gb"],
  "Bm": ["B", "D", "G"]
};

const V7_CHORDS: Record<string, string> = {
  "C": "G7", "Cm": "G7",
  "C#": "G#7", "C#m": "G#7",
  "Db": "Ab7", "Dbm": "Ab7",
  "D": "A7", "Dm": "A7",
  "D#": "A#7", "D#m": "A#7",
  "Eb": "Bb7", "Ebm": "Bb7",
  "E": "B7", "Em": "B7",
  "F": "C7", "Fm": "C7",
  "F#": "C#7", "F#m": "C#7",
  "Gb": "Db7", "Gbm": "Db7",
  "G": "D7", "Gm": "D7",
  "G#": "D#7", "G#m": "D#7",
  "Ab": "Eb7", "Abm": "Eb7",
  "A": "E7", "Am": "E7",
  "A#": "E#7", "A#m": "E#7", 
  "Bb": "F7", "Bbm": "F7",
  "B": "F#7", "Bm": "F#7",
};

export function getTreeData(maxDepth: number, collapsedNodes: Set<string>) {
  const CHORD_NODES: ChordNode[] = [];
  const CHORD_LINKS: ChordLink[] = [];
  let nodeIdCounter = 1;

  function getChordType(label: string): ChordNode["type"] {
    if (label.includes("m") && !label.includes("dim")) return "minor";
    if (label.includes("7")) return "seventh";
    return "major";
  }

  function generateSubTree(
    currentLabel: string,
    pathVisited: Set<string>,
    level: number,
    angleStart: number,
    angleEnd: number
  ): string | null {
    if (level > maxDepth) return null;
    
    const id = \`node-\${nodeIdCounter++}\`;
    const isRoot = level === 0;
    const isCollapsed = !isRoot && collapsedNodes.has(id);
    
    // "單向路徑, 不可回頭" -> Strictly filter out any chord already visited IN THIS SPECIFIC PATH
    // This perfectly prevents infinite fractals and naturally prunes the tree
    const neighbors = NEIGHBORS[currentLabel] || [];
    const childrenLabels = neighbors.filter(n => !pathVisited.has(n));
    
    // Scale radius dynamically.
    const radius = isRoot ? 0 : Math.pow(level / maxDepth, 0.85);
    const angle = (angleStart + angleEnd) / 2;
    const hasChildren = !isRoot && childrenLabels.length > 0;
    
    const defaultNotes = ["C", "E", "G"];
    const notes = CHORD_NOTES[currentLabel] || TRANSITION_CHORD_NOTES[currentLabel] || defaultNotes;
    
    CHORD_NODES.push({
      id,
      label: currentLabel,
      level,
      angle: (angle * 180) / Math.PI,
      radius,
      notes: notes,
      type: getChordType(currentLabel),
      hasChildren: hasChildren
    } as ChordNode & { hasChildren?: boolean });

    if (childrenLabels.length > 0 && !isCollapsed) {
      if (isRoot) {
        // Enforce the 3 core directions from C visually
        const wedges = [
          { start: -Math.PI * (5/6), end: -Math.PI * (1/6), label: "Cm" },
          { start: -Math.PI * (1/6), end: Math.PI * (1/2), label: "Em" },
          { start: Math.PI * (1/2), end: Math.PI * (7/6), label: "Am" }
        ];
        
        wedges.forEach((wedge) => {
          if (childrenLabels.includes(wedge.label)) {
            const edgeLabel = V7_CHORDS[wedge.label] || "G7";
            const newVisited = new Set(pathVisited);
            newVisited.add(wedge.label);
            
            const childId = generateSubTree(wedge.label, newVisited, level + 1, wedge.start, wedge.end);
            if (childId) {
              CHORD_LINKS.push({
                id: \`link-\${id}-\${childId}\`,
                from: id,
                to: childId,
                label: edgeLabel
              } as ChordLink & { label?: string });
            }
          }
        });
      } else {
        // Perfect radial partitioning: No branches will EVER cross each other visually.
        const numChildren = childrenLabels.length;
        const slice = (angleEnd - angleStart) / numChildren;
        
        childrenLabels.forEach((childLabel, i) => {
          const edgeLabel = V7_CHORDS[childLabel] || "G7";
          
          // Add 5% padding to wedges so branches are distinctly separated visually
          const padding = slice * 0.05;
          const childStart = angleStart + i * slice + padding;
          const childEnd = childStart + slice - padding;
          
          const newVisited = new Set(pathVisited);
          newVisited.add(childLabel);
          
          const childId = generateSubTree(childLabel, newVisited, level + 1, childStart, childEnd);
          if (childId) {
            CHORD_LINKS.push({
              id: \`link-\${id}-\${childId}\`,
              from: id,
              to: childId,
              label: edgeLabel
            } as ChordLink & { label?: string });
          }
        });
      }
    }
    
    return id;
  }
  
  generateSubTree("C", new Set(["C"]), 0, 0, Math.PI * 2);
  return { CHORD_NODES, CHORD_LINKS };
}
`;

fs.writeFileSync('src/chordTreeData.ts', newTreeData);
