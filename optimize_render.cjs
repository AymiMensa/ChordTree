const fs = require('fs');
let code = fs.readFileSync('src/components/ChordTreeSvg.tsx', 'utf8');

// Replace the sort logic
const oldSortLogic = `      // Sort nodes to render active node last
      const currentStepObj = activeProgression[activeStepIndex] || null;
      const nodesSorted = [...CHORD_NODES].sort((a, b) => 
        (a.id === activeNodeId ? 1 : 0) - (b.id === activeNodeId ? 1 : 0)
      );

      nodesSorted.forEach((node) => {`;

const newSortLogic = `      const currentStepObj = activeProgression[activeStepIndex] || null;
      
      // Instead of sorting every frame, just draw normal nodes first, then the active node
      let activeNodeToDrawLater = null;

      CHORD_NODES.forEach((node) => {
        if (node.id === activeNodeId) {
          activeNodeToDrawLater = node;
          return; // Skip drawing it now
        }
        drawNode(node);
      });
      
      if (activeNodeToDrawLater) {
        drawNode(activeNodeToDrawLater);
      }

      function drawNode(node: ChordNode) {`;

code = code.replace(oldSortLogic, newSortLogic);

// Close the drawNode function instead of nodesSorted.forEach
code = code.replace(`        ctx.restore();
      });`, `        ctx.restore();
      }`);

fs.writeFileSync('src/components/ChordTreeSvg.tsx', code);
