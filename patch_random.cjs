const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update imports
if (!code.includes('import { getTreeData, GRAPH }')) {
  code = code.replace(
    'import { getTreeData } from "./chordTreeData";',
    'import { getTreeData, GRAPH } from "./chordTreeData";\nimport { CHORD_NOTES, TRANSITION_CHORD_NOTES } from "./utils/audioNotes";'
  );
}

const oldRandomFunc = `function generateRandomProgression(
  startNodeId: string,
  chordNodes: ChordNode[],
  chordLinks: ChordLink[],
): ProgressionStep[] {
  const rootNodeId = chordNodes[0]?.id;
  const progression: ProgressionStep[] = [];

  let currentNodeId = startNodeId;
  const hasOutgoing = chordLinks.some((link) => link.from === currentNodeId);

  if (!currentNodeId || !hasOutgoing) {
    currentNodeId = rootNodeId;
  }

  let currentNode = chordNodes.find((n) => n.id === currentNodeId);
  if (!currentNode) {
    currentNodeId = rootNodeId;
    currentNode = chordNodes.find((n) => n.id === currentNodeId)!;
  }
  if (!currentNode) return [];

  progression.push({
    type: "node",
    id: currentNode.id,
    label: currentNode.label,
    notes: currentNode.notes,
  });

  while (true) {
    const outgoingLinks = chordLinks.filter(
      (link) => link.from === currentNodeId,
    );

    if (outgoingLinks.length === 0) {
      break; // Reached an outer leaf node, end of the branch
    }

    // Select a branch randomly
    const randomLink =
      outgoingLinks[Math.floor(Math.random() * outgoingLinks.length)];

    // Move to target node
    currentNodeId = randomLink.to;
    const targetNode = chordNodes.find((n) => n.id === currentNodeId);
    if (!targetNode) break;
    
    currentNode = targetNode;

    progression.push({
      type: "node",
      id: currentNode.id,
      label: currentNode.label,
      notes: currentNode.notes,
    });
  }

  return progression;
}`;

const newRandomFunc = `function generateRandomProgression(
  startNodeId: string,
  chordNodes: ChordNode[],
  chordLinks: ChordLink[],
  maxDepth: number
): ProgressionStep[] {
  const rootNodeId = chordNodes[0]?.id || "C";
  const progression: ProgressionStep[] = [];

  let currentNodeId = startNodeId;
  let currentLabel = currentNodeId.split("-").pop() || "C";

  // Check if startNodeId exists in the generated nodes, if not fallback to root
  const existingNode = chordNodes.find((n) => n.id === currentNodeId);
  if (!existingNode) {
    currentNodeId = rootNodeId;
    currentLabel = currentNodeId.split("-").pop() || "C";
  }

  let pathVisited = currentNodeId.split("-");
  let currentLevel = pathVisited.length - 1;

  const defaultNotes = ["C", "E", "G"];
  let notes = CHORD_NOTES[currentLabel] || TRANSITION_CHORD_NOTES[currentLabel] || defaultNotes;

  progression.push({
    type: "node",
    id: currentNodeId,
    label: currentLabel,
    notes: notes,
  });

  while (currentLevel < maxDepth) {
    const neighbors = GRAPH[currentLabel] || [];
    const children = neighbors.filter(n => !pathVisited.includes(n.to));
    
    if (children.length === 0) {
      break;
    }

    const randomChild = children[Math.floor(Math.random() * children.length)];
    currentLabel = randomChild.to;
    pathVisited.push(currentLabel);
    currentNodeId = pathVisited.join("-");
    currentLevel++;

    notes = CHORD_NOTES[currentLabel] || TRANSITION_CHORD_NOTES[currentLabel] || defaultNotes;

    progression.push({
      type: "node",
      id: currentNodeId,
      label: currentLabel,
      notes: notes,
    });
  }

  return progression;
}`;

code = code.replace(oldRandomFunc, newRandomFunc);

// Update calls to generateRandomProgression
code = code.replace(
  'generateRandomProgression(prev.activeNodeId, CHORD_NODES, CHORD_LINKS)',
  'generateRandomProgression(prev.activeNodeId, CHORD_NODES, CHORD_LINKS, maxDepth)'
);
code = code.replace(
  'generateRandomProgression(playbackState.activeNodeId, CHORD_NODES, CHORD_LINKS)',
  'generateRandomProgression(playbackState.activeNodeId, CHORD_NODES, CHORD_LINKS, maxDepth)'
);

fs.writeFileSync('src/App.tsx', code);
