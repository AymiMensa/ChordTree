const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newAutoExpandLogic1 = `// Auto-expand nodes in the generated path so they become visible
        setCollapsedNodes(prevCollapsed => {
          const next = new Set(prevCollapsed);
          updatedProg.forEach(step => {
            const level = step.id.split("-").length - 1;
            const defaultCollapsed = maxDepth >= 5 && level >= 3;
            if (defaultCollapsed) {
              next.add(step.id); // Toggle to expand
            } else {
              next.delete(step.id); // Untoggle to expand
            }
          });
          return next;
        });`;

const newAutoExpandLogic2 = `// Auto-expand nodes in the new path
    setCollapsedNodes(prevCollapsed => {
      const next = new Set(prevCollapsed);
      newProgression.forEach(step => {
        const level = step.id.split("-").length - 1;
        const defaultCollapsed = maxDepth >= 5 && level >= 3;
        if (defaultCollapsed) {
          next.add(step.id); // Toggle to expand
        } else {
          next.delete(step.id); // Untoggle to expand
        }
      });
      return next;
    });`;

code = code.replace(
  /\/\/ Auto-expand nodes in the generated path so they become visible[\s\S]*?return next;\n        }\);/,
  newAutoExpandLogic1
);

code = code.replace(
  /\/\/ Auto-expand nodes in the new path[\s\S]*?return next;\n    }\);/,
  newAutoExpandLogic2
);

fs.writeFileSync('src/App.tsx', code);
