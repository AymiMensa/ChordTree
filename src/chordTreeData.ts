import { ChordNode, ChordLink } from "./types";
import { parseChordLabelToNotes } from "./utils/chordParser";

export interface RawTreeNode {
  chord: string;
  dominant7?: string;
  children?: RawTreeNode[];
}

// Minimal GRAPH mock to prevent any other legacy references from breaking (though we cleared App.tsx)
export const GRAPH: Record<string, { to: string; label: string }[]> = {};

const chromaticB = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
function getIndexB(note: string) {
    const aliases: Record<string, string> = {'Db': 'C#', 'D#': 'Eb', 'Gb': 'F#', 'G#': 'Ab', 'A#': 'Bb'};
    const n = aliases[note] || note;
    return chromaticB.indexOf(n);
}
function getNoteB(index: number) { return chromaticB[(index % 12 + 12) % 12]; }

function getDominant(target: string) {
    const root = target.endsWith('m') ? target.slice(0, -1) : target;
    switch (root) {
        case "C": return "G7"; case "C#": return "G#7"; case "Db": return "Ab7";
        case "D": return "A7"; case "D#": return "A#7"; case "Eb": return "Bb7";
        case "E": return "B7"; case "F": return "C7"; case "F#": return "C#7";
        case "Gb": return "Db7"; case "G": return "D7"; case "G#": return "D#7";
        case "Ab": return "Eb7"; case "A": return "E7"; case "A#": return "E#7";
        case "Bb": return "F7"; case "B": return "F#7"; default: return "G7";
    }
}

export function buildChordTreeB(maxDepth = 11) {
    function recurseB(name: string, type: string, depth: number, state: string, dominant7?: string): RawTreeNode {
        const node: RawTreeNode = { chord: name };
        if (dominant7) node.dominant7 = dominant7;
        
        if (depth >= maxDepth) return node;

        const getMinor = (n: string, interval: number) => getNoteB(getIndexB(n) + interval) + 'm';
        const getMajor = (n: string, interval: number) => getNoteB(getIndexB(n) + interval);
        const rootName = name.replace('m', '').replace('7', '');

        if (type === 'Root' || type === 'major' || type === 'minor') {
            let targets: {name: string, t: string, s: string}[] = [];
            switch (state) {
                case 'ROOT':
                    targets = [
                        { name: rootName + 'm', t: 'minor', s: 'N' },
                        { name: getMinor(rootName, 4), t: 'minor', s: 'E' },
                        { name: getMajor(rootName, 5), t: 'major', s: 'S' },
                        { name: getMinor(rootName, 9), t: 'minor', s: 'W' }
                    ];
                    break;
                case 'N':
                    targets = [
                        { name: getMajor(rootName, 3), t: 'major', s: 'NE_N' },
                        { name: getMinor(rootName, 5), t: 'minor', s: 'N' },
                        { name: getMajor(rootName, 8), t: 'major', s: 'NW' }
                    ];
                    break;
                case 'E':
                    targets = [
                        { name: rootName, t: 'major', s: 'SE_leaf' },
                        { name: getMinor(rootName, 5), t: 'minor', s: 'E' },
                        { name: getMajor(rootName, 3), t: 'major', s: 'NE_E' }
                    ];
                    break;
                case 'S':
                    targets = [
                        { name: rootName + 'm', t: 'minor', s: 'SW' },
                        { name: getMajor(rootName, 5), t: 'major', s: 'S' },
                        { name: getMinor(rootName, 9), t: 'minor', s: 'SE' }
                    ];
                    break;
                case 'W':
                    targets = [
                        { name: getMajor(rootName, 8), t: 'major', s: 'NW' },
                        { name: getMinor(rootName, 5), t: 'minor', s: 'W' },
                        { name: rootName, t: 'major', s: 'SW_leaf' }
                    ];
                    break;
                case 'NE_N':
                    targets = [{ name: getMinor(rootName, 4), t: 'minor', s: 'E' }, { name: rootName + 'm', t: 'minor', s: 'N' }];
                    break;
                case 'NE_E':
                    targets = [{ name: rootName + 'm', t: 'minor', s: 'E' }, { name: getMinor(rootName, 4), t: 'minor', s: 'N' }];
                    break;
                case 'NW':
                    targets = [{ name: getMinor(rootName, 9), t: 'minor', s: 'N' }, { name: getMajor(rootName, 5), t: 'major', s: 'W' }];
                    break;
                case 'SW':
                    targets = [{ name: getMajor(rootName, 8), t: 'major', s: 'W' }, { name: getMinor(rootName, 5), t: 'minor', s: 'SW' }, { name: rootName, t: 'major', s: 'S' }];
                    break;
                case 'SE':
                    targets = [{ name: getMajor(rootName, 8), t: 'major', s: 'S' }, { name: getMinor(rootName, 5), t: 'minor', s: 'E' }];
                    break;
                case 'SE_leaf': targets = [{ name: getMinor(rootName, 9), t: 'minor', s: 'SE_next' }]; break;
                case 'SW_leaf': targets = [{ name: getMinor(rootName, 4), t: 'minor', s: 'SW_next' }]; break;
                default:
                    if (type === 'minor') {
                        targets = [{ name: getMajor(rootName, 3), t: 'major', s: 'generic_M' }, { name: getMinor(rootName, 5), t: 'minor', s: 'generic_m' }];
                    } else {
                        targets = [{ name: getMinor(rootName, 9), t: 'minor', s: 'generic_m' }, { name: getMajor(rootName, 5), t: 'major', s: 'generic_M' }];
                    }
                    break;
            }
            node.children = targets.map(t => recurseB(t.name, t.t, depth + 1, t.s, getDominant(t.name)));
        }
        return node;
    }
    return recurseB('C', 'Root', 0, 'ROOT');
}

export const RAW_TREE = buildChordTreeB(11);

export function getTreeData(maxDepth: number, collapsedNodes: Set<string>) {
  const CHORD_NODES: ChordNode[] = [];
  const CHORD_LINKS: ChordLink[] = [];

  function getChordType(label: string): ChordNode["type"] {
    if (label.includes("m") && !label.includes("dim")) return "minor";
    if (label.includes("7")) return "seventh";
    return "major";
  }

  function traverse(
    node: RawTreeNode,
    parentPath: string[],
    level: number,
    angleStart: number,
    angleEnd: number
  ): string {
    const pathVisited = [...parentPath, node.chord];
    const id = pathVisited.join("-");

    const radius = level === 0 ? 0 : Math.pow(level / maxDepth, 0.85);
    const angle = (angleStart + angleEnd) / 2;
    const children = node.children || [];
    const hasChildren = level > 0 && children.length > 0;

    const notes = parseChordLabelToNotes(node.chord);

    CHORD_NODES.push({
      id,
      label: node.chord,
      level,
      angle: (angle * 180) / Math.PI,
      radius,
      notes: notes,
      type: getChordType(node.chord),
      hasChildren: hasChildren,
    } as ChordNode);

    const defaultCollapsed = maxDepth >= 5 && level >= 3;
    const isToggled = collapsedNodes.has(id);
    const isCollapsed = level > 0 && (defaultCollapsed ? !isToggled : isToggled);

    if (children.length > 0 && !isCollapsed && level < maxDepth) {
      const numChildren = children.length;
      const slice = (angleEnd - angleStart) / numChildren;

      children.forEach((child, i) => {
        const padding = slice * 0.05;
        const childStart = angleStart + i * slice + padding;
        const childEnd = childStart + slice - padding;

        const childId = traverse(child, pathVisited, level + 1, childStart, childEnd);

        CHORD_LINKS.push({
          id: `link-${id}-${childId}-${i}`,
          from: id,
          to: childId,
          label: child.dominant7 || "",
        });
      });
    }

    return id;
  }

  // Root node C (level 0)
  CHORD_NODES.push({
    id: "C",
    label: "C",
    level: 0,
    angle: 0,
    radius: 0,
    notes: parseChordLabelToNotes("C"),
    type: "major",
    hasChildren: true,
  });

  const rootChildren = RAW_TREE.children || [];
  const numRoot = rootChildren.length;
  const rootSlice = (2 * Math.PI) / numRoot;
  
  rootChildren.forEach((child, i) => {
    // Start layout from top (-90 degrees)
    const start = i * rootSlice - Math.PI / 2;
    const end = start + rootSlice;
    const childId = traverse(child, ["C"], 1, start, end);
    CHORD_LINKS.push({
      id: `link-C-${childId}-${i}`,
      from: "C",
      to: childId,
      label: child.dominant7 || "",
    });
  });

  return { CHORD_NODES, CHORD_LINKS };
}
