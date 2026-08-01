const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIdx = code.indexOf('// Generate a random path starting at a specified node');
const endIdx = code.indexOf('export default function App() {');

const newFunc = `// Generate a random path starting at a specified node (or Central C if not valid or has no outgoing links) and walking outward step-by-step to a leaf node
function generateRandomProgression(
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

    // Push the transition step
    const targetNode = chordNodes.find((n) => n.id === randomLink.to);
    if (!targetNode) break;

    progression.push({
      type: "transition",
      id: randomLink.id,
      label: randomLink.label || "→",
      notes: targetNode.notes,
    });

    // Move to target node
    currentNodeId = randomLink.to;
    currentNode = targetNode;

    progression.push({
      type: "node",
      id: currentNode.id,
      label: currentNode.label,
      notes: currentNode.notes,
    });
  }

  return progression;
}

`;

code = code.substring(0, startIdx) + newFunc + code.substring(endIdx);
fs.writeFileSync('src/App.tsx', code);
