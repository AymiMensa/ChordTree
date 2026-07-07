const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '    }\nfunction generateRandomProgression',
  `    }

    // Add main node
    progression.push({
      type: "node",
      id: nodeObj.id,
      label: nodeObj.label,
      notes: nodeObj.notes,
    });
  }

  return progression;
}

// Generate a random path starting at a specified node (or Central C if not valid or has no outgoing links) and walking outward step-by-step to a leaf node
function generateRandomProgression`
);

fs.writeFileSync('src/App.tsx', code);
