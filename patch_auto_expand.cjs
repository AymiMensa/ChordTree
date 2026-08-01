const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'updatedProg = generateRandomProgression(prev.activeNodeId, CHORD_NODES, CHORD_LINKS, maxDepth);\n        updatedIdx = 0;\n      }',
  `updatedProg = generateRandomProgression(prev.activeNodeId, CHORD_NODES, CHORD_LINKS, maxDepth);\n        updatedIdx = 0;\n\n        // Auto-expand nodes in the generated path so they become visible\n        setCollapsedNodes(prevCollapsed => {\n          const next = new Set(prevCollapsed);\n          updatedProg.forEach(step => next.add(step.id));\n          return next;\n        });\n      }`
);

code = code.replace(
  'const newProgression = generateRandomProgression(playbackState.activeNodeId, CHORD_NODES, CHORD_LINKS, maxDepth);\n    setPlaybackState((prev) => ({',
  `const newProgression = generateRandomProgression(playbackState.activeNodeId, CHORD_NODES, CHORD_LINKS, maxDepth);\n    // Auto-expand nodes in the new path\n    setCollapsedNodes(prevCollapsed => {\n      const next = new Set(prevCollapsed);\n      newProgression.forEach(step => next.add(step.id));\n      return next;\n    });\n    setPlaybackState((prev) => ({`
);

fs.writeFileSync('src/App.tsx', code);
