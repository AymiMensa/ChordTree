import { ChordNode, ChordLink } from "./types";
import { parseChordLabelToNotes } from "./utils/chordParser";

export interface RawTreeNode {
  chord: string;
  dominant7?: string;
  children?: RawTreeNode[];
}

// Minimal GRAPH mock to prevent any other legacy references from breaking (though we cleared App.tsx)
export const GRAPH: Record<string, { to: string; label: string }[]> = {};

export const RAW_TREE: RawTreeNode = {
  chord: "C",
  children: [
    // 1. 往上方分支：Cm 軸線與降號調擴展 (經由 G7)
    {
      chord: "Cm",
      dominant7: "G7",
      children: [
        {
          chord: "C",
          dominant7: "G7"
        },
        {
          chord: "Eb",
          dominant7: "Bb7",
          children: [
            { chord: "Ebm", dominant7: "Bb7" },
            { chord: "Ab", dominant7: "Ab7" }
          ]
        },
        {
          chord: "Fm",
          dominant7: "C7",
          children: [
            { chord: "F", dominant7: "C7" },
            { chord: "Db", dominant7: "Ab7" }
          ]
        }
      ]
    },
    // 2. 往左側分支：Am 軸線與升號調擴展 (經由 E7)
    {
      chord: "Am",
      dominant7: "E7",
      children: [
        {
          chord: "A",
          dominant7: "E7",
          children: [
            { chord: "F#m", dominant7: "C#7" },
            { chord: "Am", dominant7: "E7" }
          ]
        },
        {
          chord: "C",
          dominant7: "G7"
        },
        {
          chord: "Dm",
          dominant7: "A7",
          children: [
            { chord: "D", dominant7: "A7" },
            { chord: "Bm", dominant7: "C#7" }
          ]
        }
      ]
    },
    // 3. 往右側分支：Em 軸線與高升號調擴展 (經由 B7)
    {
      chord: "Em",
      dominant7: "B7",
      children: [
        {
          chord: "E",
          dominant7: "B7",
          children: [
            { chord: "C#m", dominant7: "G#7" },
            { chord: "Em", dominant7: "B7" }
          ]
        },
        {
          chord: "G",
          dominant7: "D7",
          children: [
            { chord: "Gm", dominant7: "D7" },
            { chord: "Bm", dominant7: "F#7" }
          ]
        }
      ]
    },
    // 4. 最外圍極致離調擴展 (五度圈底端) - F#m/Gbm
    {
      chord: "F#m",
      dominant7: "F#7",
      children: [
        { chord: "C#m", dominant7: "C#7" },
        { chord: "B", dominant7: "F#7" }
      ]
    },
    // 5. 最外圍極致離調擴展 (五度圈底端) - Bbm/Dbm
    {
      chord: "Bbm",
      dominant7: "Db7",
      children: [
        { chord: "Db", dominant7: "Ab7" },
        { chord: "Bbm", dominant7: "F7" }
      ]
    }
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
  // Five-way symmetrical sectors (72 degrees each)
  // Cm (Up): 234 to 306 deg (centered at 270 deg)
  // Am (Left-Up): 162 to 234 deg (centered at 198 deg)
  // Em (Right-Up): -54 to 18 deg (centered at -18 deg / 342 deg)
  // F#m (Right-Down): 18 to 90 deg (centered at 54 deg)
  // Bbm (Left-Down): 90 to 162 deg (centered at 126 deg)
  const sectors = [
    { start: (234 * Math.PI) / 180, end: (306 * Math.PI) / 180 }, // Cm (Index 0)
    { start: (162 * Math.PI) / 180, end: (234 * Math.PI) / 180 }, // Am (Index 1)
    { start: (-54 * Math.PI) / 180, end: (18 * Math.PI) / 180 },  // Em (Index 2)
    { start: (18 * Math.PI) / 180, end: (90 * Math.PI) / 180 },   // F#m (Index 3)
    { start: (90 * Math.PI) / 180, end: (162 * Math.PI) / 180 },  // Bbm (Index 4)
  ];

  rootChildren.forEach((child, i) => {
    const sector = sectors[i];
    if (!sector) return;
    const childId = traverse(child, ["C"], 1, sector.start, sector.end);
    CHORD_LINKS.push({
      id: `link-C-${childId}-${i}`,
      from: "C",
      to: childId,
      label: child.dominant7 || "",
    });
  });

  return { CHORD_NODES, CHORD_LINKS };
}
