const fs = require('fs');
const content = fs.readFileSync('src/chordTreeData.ts', 'utf-8');
const match = content.match(/export const GRAPH: [^=]+ = ({[\s\S]+?});\n/);
const GRAPH = eval('(' + match[1] + ')');

function testRandomWalk(startLabel, maxDepth) {
  let currentLabel = startLabel;
  let pathVisited = [startLabel];
  let currentLevel = 0;

  // Helper to find max depth from a given node, avoiding pathVisited
  const getDepth = (label, visited, level) => {
    if (level >= maxDepth) return 0;
    const neighbors = GRAPH[label] || [];
    const children = neighbors.filter(n => !visited.includes(n.to));
    if (children.length === 0) return 0;
    let max = 0;
    for (const child of children) {
      visited.push(child.to);
      const d = getDepth(child.to, visited, level + 1);
      visited.pop();
      if (d > max) max = d;
    }
    return max + 1;
  };

  while (currentLevel < maxDepth) {
    const neighbors = GRAPH[currentLabel] || [];
    const children = neighbors.filter(n => !pathVisited.includes(n.to));
    
    if (children.length === 0) {
      break;
    }

    // Evaluate depth for each child
    let maxSubDepth = -1;
    for (const child of children) {
      pathVisited.push(child.to);
      const d = getDepth(child.to, pathVisited, currentLevel + 1);
      pathVisited.pop();
      if (d > maxSubDepth) maxSubDepth = d;
    }

    const bestChildren = children.filter(child => {
      pathVisited.push(child.to);
      const d = getDepth(child.to, pathVisited, currentLevel + 1);
      pathVisited.pop();
      return d === maxSubDepth;
    });

    const randomChild = bestChildren[Math.floor(Math.random() * bestChildren.length)];
    currentLabel = randomChild.to;
    pathVisited.push(currentLabel);
    currentLevel++;
  }
  return pathVisited;
}

let lengths = [];
for (let i = 0; i < 1000; i++) {
  lengths.push(testRandomWalk('C', 10).length);
}
const counts = lengths.reduce((acc, curr) => {
  acc[curr] = (acc[curr] || 0) + 1;
  return acc;
}, {});
console.log('Lengths distribution:', counts);
