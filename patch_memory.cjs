const fs = require('fs');
let code = fs.readFileSync('src/chordTreeData.ts', 'utf8');

const target = `    const id = Array.from(pathVisited).join("-");
    const isRoot = level === 0;
    const isCollapsed = !isRoot && collapsedNodes.has(id);`;

const replacement = `    const id = Array.from(pathVisited).join("-");
    const isRoot = level === 0;
    
    // Memory protection: For deep trees (maxDepth >= 5), auto-collapse at level 3 to prevent OOM
    // on mobile devices. The collapsedNodes set acts as a "toggled state" set.
    const defaultCollapsed = maxDepth >= 5 && level >= 3;
    const isToggled = collapsedNodes.has(id);
    const isCollapsed = !isRoot && (defaultCollapsed ? !isToggled : isToggled);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/chordTreeData.ts', code);
