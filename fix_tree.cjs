const fs = require('fs');
const content = `import { ChordNode, ChordLink } from "./types";
import { CHORD_NOTES, TRANSITION_CHORD_NOTES } from "./utils/audioNotes";

const GRAPH: Record<string, {to: string, label: string}[]> = {
  "C": [
    { to: "Cm", label: "G7" },
    { to: "Am", label: "E7" },
    { to: "E", label: "B7" },
    { to: "Ab", label: "Eb7" },
    { to: "Em", label: "Em" },
    { to: "G#m", label: "G#m" }
  ],
  "Cm": [
    { to: "Fm", label: "G7" },
    { to: "F", label: "Db7" },
    { to: "Abm", label: "Eb7" },
    { to: "Bm", label: "B7" }
  ],
  "Am": [
    { to: "Dm", label: "E7" },
    { to: "C#m", label: "G#7" },
    { to: "D", label: "D7" }
  ],
  "E": [
    { to: "B", label: "B7" },
    { to: "G#m", label: "G#7" },
    { to: "C#m", label: "C#7" },
    { to: "F#m", label: "F#7" }
  ],
  "Em": [
    { to: "Bm", label: "B7" },
    { to: "G#m", label: "G#7" },
    { to: "Dbm", label: "Db7" }
  ],
  "Ab": [
    { to: "Ebm", label: "Eb7" },
    { to: "Gbm", label: "G7" },
    { to: "Dbm", label: "Db7" }
  ],
  "G#m": [
    { to: "D#m", label: "D#7" },
    { to: "F#m", label: "F#7" },
    { to: "Bm", label: "B7" }
  ],
  "Fm": [
    { to: "Cm", label: "C7" },
    { to: "Bbm", label: "Db7" },
    { to: "Abm", label: "Ab7" }
  ],
  "F": [
    { to: "C", label: "C7" },
    { to: "Am", label: "E7" },
    { to: "Bbm", label: "Bb7" }
  ],
  "Abm": [
    { to: "Ebm", label: "Eb7" },
    { to: "Dbm", label: "Db7" },
    { to: "Gbm", label: "G7" }
  ],
  "Bm": [
    { to: "F#m", label: "F#7" },
    { to: "G#m", label: "G#7" },
    { to: "Em", label: "E7" }
  ],
  "Dm": [
    { to: "Am", label: "A7" },
    { to: "Gm", label: "G7" },
    { to: "D", label: "D7" }
  ],
  "D": [
    { to: "Am", label: "A7" },
    { to: "Gm", label: "G7" },
    { to: "C#m", label: "C#7" }
  ],
  "B": [
    { to: "F#m", label: "F#7" },
    { to: "G#m", label: "G#7" },
    { to: "E", label: "E7" }
  ],
  "C#m": [
    { to: "G#m", label: "G#7" },
    { to: "F#m", label: "F#7" },
    { to: "A#m", label: "A#7" }
  ],
  "F#m": [
    { to: "C#m", label: "C#7" },
    { to: "Bm", label: "B7" },
    { to: "G#m", label: "G#7" }
  ],
  "Dbm": [
    { to: "Abm", label: "Ab7" },
    { to: "Gbm", label: "Gb7" },
    { to: "Gbm", label: "G7" }
  ],
  "Ebm": [
    { to: "Bbm", label: "Bb7" },
    { to: "Dbm", label: "Db7" },
    { to: "Abm", label: "Ab7" }
  ],
  "Gbm": [
    { to: "Dbm", label: "Db7" },
    { to: "Bm", label: "B7" },
    { to: "Ebm", label: "Eb7" }
  ],
  "Bbm": [
    { to: "Fm", label: "F7" },
    { to: "Ebm", label: "Eb7" },
    { to: "Abm", label: "Ab7" }
  ],
  "Gm": [
    { to: "Dm", label: "D7" },
    { to: "Bm", label: "B7" },
    { to: "Cm", label: "C7" }
  ],
  "D#m": [
    { to: "A#m", label: "A#7" },
    { to: "G#m", label: "G#7" },
    { to: "F#m", label: "F#7" }
  ],
  "A#m": [
    { to: "E#m", label: "E#7" },
    { to: "G#m", label: "G#7" },
    { to: "C#m", label: "C#7" }
  ]
};

export function getTreeData(maxDepth: number, collapsedNodes: Set<string>) {
  const CHORD_NODES: ChordNode[] = [];
  const CHORD_LINKS: ChordLink[] = [];

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
    
    const id = Array.from(pathVisited).join("-");
    const isRoot = level === 0;
    
    const defaultCollapsed = maxDepth >= 5 && level >= 3;
    const isToggled = collapsedNodes.has(id);
    const isCollapsed = !isRoot && (defaultCollapsed ? !isToggled : isToggled);
    
    const neighbors = GRAPH[currentLabel] || [];
    const children = neighbors.filter(n => !pathVisited.has(n.to));
    
    const radius = isRoot ? 0 : Math.pow(level / maxDepth, 0.85);
    const angle = (angleStart + angleEnd) / 2;
    const hasChildren = !isRoot && children.length > 0;
    
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

    if (children.length > 0 && !isCollapsed) {
      if (isRoot) {
        const numChildren = children.length;
        const slice = (Math.PI * 2) / numChildren;
        
        children.forEach((child, i) => {
          const newVisited = new Set(pathVisited);
          newVisited.add(child.to);
          
          const childStart = i * slice;
          const childEnd = childStart + slice;
          
          const childId = generateSubTree(child.to, newVisited, level + 1, childStart, childEnd);
          if (childId) {
            CHORD_LINKS.push({
              id: \`link-\${id}-\${childId}-\${i}\`,
              from: id,
              to: childId,
              label: child.label
            } as ChordLink & { label?: string });
          }
        });
      } else {
        const numChildren = children.length;
        const slice = (angleEnd - angleStart) / numChildren;
        
        children.forEach((child, i) => {
          const padding = slice * 0.05;
          const childStart = angleStart + i * slice + padding;
          const childEnd = childStart + slice - padding;
          
          const newVisited = new Set(pathVisited);
          newVisited.add(child.to);
          
          const childId = generateSubTree(child.to, newVisited, level + 1, childStart, childEnd);
          if (childId) {
            CHORD_LINKS.push({
              id: \`link-\${id}-\${childId}-\${i}\`,
              from: id,
              to: childId,
              label: child.label
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
fs.writeFileSync('src/chordTreeData.ts', content);
