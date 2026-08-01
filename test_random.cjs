import { getTreeData, GRAPH } from "./src/chordTreeData";

function generateRandomProgression(
  startNodeId,
  maxDepth
) {
  const rootNodeId = "C";
  const progression = [];

  let currentNodeId = startNodeId;
  let currentLabel = currentNodeId.split("-").pop() || "C";

  let pathVisited = currentNodeId.split("-");
  let currentLevel = pathVisited.length - 1;

  progression.push({
    type: "node",
    id: currentNodeId,
    label: currentLabel,
  });

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
    currentNodeId = pathVisited.join("-");
    currentLevel++;

    progression.push({
      type: "node",
      id: currentNodeId,
      label: currentLabel,
    });
  }

  return progression;
}

console.log(generateRandomProgression("C", 10).length);
