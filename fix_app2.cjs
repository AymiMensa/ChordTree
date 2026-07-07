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
  const rootNode = chordNodes[0];
  if (!rootNode) return [];

  // 根據使用者要求，和絃進行只有三條固定路線：
  // 1. C - G7 - Cm - G7 - C
  // 2. C - E7 - Am - G7 - C
  // 3. C - B7 - Em - G7 - C
  const routes = [
    { targetLabel: "Cm", returnTransition: "G7" },
    { targetLabel: "Am", returnTransition: "G7" },
    { targetLabel: "Em", returnTransition: "G7" }
  ];

  const randomRoute = routes[Math.floor(Math.random() * routes.length)];
  const targetNode = chordNodes.find(n => n.level === 1 && n.label === randomRoute.targetLabel);
  
  if (!targetNode) return [];

  const outboundLink = chordLinks.find(l => l.from === rootNode.id && l.to === targetNode.id);
  if (!outboundLink) return [];

  return [
    { type: "node", id: rootNode.id, label: rootNode.label, notes: rootNode.notes },
    { type: "transition", id: outboundLink.id, label: outboundLink.label || "→", notes: targetNode.notes },
    { type: "node", id: targetNode.id, label: targetNode.label, notes: targetNode.notes },
    { type: "transition", id: outboundLink.id, label: randomRoute.returnTransition, notes: rootNode.notes },
    { type: "node", id: rootNode.id, label: rootNode.label, notes: rootNode.notes }
  ];
}

`;

code = code.substring(0, startIdx) + newFunc + code.substring(endIdx);
fs.writeFileSync('src/App.tsx', code);
