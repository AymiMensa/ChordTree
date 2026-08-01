const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Play, Square, Settings2, Share2, Volume2, Waves, Repeat, RefreshCw, FolderTree, FileCode, CheckSquare, Settings } from "lucide-react";
import { AudioEngine } from "./utils/audioEngine";
import { getTreeData } from "./chordTreeData";
import { ChordNode, ChordLink, PlaybackState, ProgressionStep, CustomChord } from "./types";

// Helper to find the shortest path of main nodes from Central C to any target node using BFS
function findPathFromCenter(targetId: string, chordNodes: ChordNode[], chordLinks: ChordLink[]): string[] {
  const rootNodeId = chordNodes[0]?.id;
  if (targetId === rootNodeId) return [rootNodeId];

  const queue: string[][] = [[rootNodeId]];
  const visited = new Set<string>([rootNodeId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const lastNodeId = path[path.length - 1];

    if (lastNodeId === targetId) {
      return path;
    }

    // Find children connected from lastNodeId
    const children = chordLinks.filter((link) => link.from === lastNodeId).map(
      (link) => link.to,
    );
    for (const child of children) {
      if (!visited.has(child)) {
        visited.add(child);
        queue.push([...path, child]);
      }
    }
  }

  return [rootNodeId];
}

// Generate the complete progression steps from Central C to target node
function generatePathToNode(targetId: string, chordNodes: ChordNode[], chordLinks: ChordLink[]): ProgressionStep[] {
  const nodePath = findPathFromCenter(targetId, chordNodes, chordLinks);
  const progression: ProgressionStep[] = [];

  for (let i = 0; i < nodePath.length; i++) {
    const nodeId = nodePath[i];
    const nodeObj = chordNodes.find((n) => n.id === nodeId)!;

    // Add main node
    progression.push({
      type: "node",
      id: nodeObj.id,
      label: nodeObj.label,
      notes: nodeObj.notes,
    });
  }

  return progression;
}

`;

code = imports + code;
fs.writeFileSync('src/App.tsx', code);
