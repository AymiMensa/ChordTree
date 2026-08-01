const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newRandomFunc = `function generateRandomProgression(
  startNodeId: string,
  chordNodes: ChordNode[],
  chordLinks: ChordLink[],
  maxDepth: number
): ProgressionStep[] {
  const rootNodeId = chordNodes[0]?.id || "C";
  const progression: ProgressionStep[] = [];

  let currentNodeId = startNodeId;
  const existingNode = chordNodes.find((n) => n.id === currentNodeId);
  if (!existingNode) {
    currentNodeId = rootNodeId;
  }

  let currentNode = chordNodes.find((n) => n.id === currentNodeId);
  if (!currentNode) return [];

  progression.push({
    type: "node",
    id: currentNode.id,
    label: currentNode.label,
    notes: currentNode.notes,
  });

  // Helper to find max depth of a node in the tree
  const maxDepthMap = new Map<string, number>();
  function getDepth(nodeId: string): number {
    if (maxDepthMap.has(nodeId)) return maxDepthMap.get(nodeId)!;
    const outgoing = chordLinks.filter(l => l.from === nodeId);
    if (outgoing.length === 0) {
      maxDepthMap.set(nodeId, 0);
      return 0;
    }
    let max = 0;
    for (const link of outgoing) {
      const d = getDepth(link.to);
      if (d > max) max = d;
    }
    maxDepthMap.set(nodeId, max + 1);
    return max + 1;
  }

  while (true) {
    const outgoingLinks = chordLinks.filter(
      (link) => link.from === currentNodeId
    );

    if (outgoingLinks.length === 0) {
      break;
    }

    // Try to pick a link that leads to the deepest possible path
    let maxSubDepth = -1;
    for (const link of outgoingLinks) {
      const d = getDepth(link.to);
      if (d > maxSubDepth) maxSubDepth = d;
    }

    const bestLinks = outgoingLinks.filter(l => getDepth(l.to) === maxSubDepth);
    const randomLink = bestLinks[Math.floor(Math.random() * bestLinks.length)];

    currentNodeId = randomLink.to;
    const targetNode = chordNodes.find((n) => n.id === currentNodeId);
    if (!targetNode) break;
    
    progression.push({
      type: "node",
      id: targetNode.id,
      label: targetNode.label,
      notes: targetNode.notes,
    });
  }

  return progression;
}`;

// Replace the current function
code = code.replace(/function generateRandomProgression\([\s\S]*?return progression;\n}/, newRandomFunc);

fs.writeFileSync('src/App.tsx', code);
