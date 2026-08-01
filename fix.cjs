const fs = require('fs');
let code = fs.readFileSync('src/components/ChordTreeSvg.tsx', 'utf8');

// replace everything from <g id="chord-nodes"> to </svg>
const newCode = `        <g id="chord-nodes">
          {[...CHORD_NODES].sort((a, b) => (a.id === activeNodeId ? 1 : 0) - (b.id === activeNodeId ? 1 : 0)).map((node) => {
            const coord = nodeCoords[node.id];
            if (!coord) return null;

            const isCurrent =
              activeNodeId === node.id && currentStep?.type === "node";
            const isPath = visitedNodes.has(node.id);
            const isPlanned = plannedNodes.has(node.id);

            // Determine chord style based on active state and type
            let strokeColor = "#1e1b4b"; // default
            let fillColor = "#020210";
            let textColor = "#4b5563";

            if (node.level === 0) {
              // Center starting node (C)
              strokeColor = isCurrent
                ? "#ec4899"
                : isPath
                  ? "#d946ef"
                  : "#9333ea";
              fillColor = isCurrent ? "#7e22ce" : "#3b0764";
              textColor = "#ffffff";
            } else if (node.type === "major") {
              // Major chords (pinkish/rose accents)
              strokeColor = isCurrent
                ? "#fbbf24"
                : isPath
                  ? "#f43f5e"
                  : isPlanned
                    ? "#6366f1"
                    : "#9f1239";
              textColor = isCurrent
                ? "#ffffff"
                : isPath
                  ? "#ffffff"
                  : isPlanned
                    ? "#a5b4fc"
                    : "#fb7185";
              fillColor = isCurrent ? "#e11d48" : isPath ? "#881337" : isPlanned ? "#1e1b4b" : "#2a0416";
            } else {
              // Minor chords (blue/cyan accents)
              strokeColor = isCurrent
                ? "#fbbf24"
                : isPath
                  ? "#0ea5e9"
                  : isPlanned
                    ? "#6366f1"
                    : "#0369a1";
              textColor = isCurrent
                ? "#ffffff"
                : isPath
                  ? "#ffffff"
                  : isPlanned
                    ? "#a5b4fc"
                    : "#38bdf8";
              fillColor = isCurrent ? "#0284c7" : isPath ? "#0c4a6e" : isPlanned ? "#1e1b4b" : "#041428";
            }

            // Add small plus icon indicator for collapsed nodes
            const nodeExt = node as ChordNode & { hasChildren?: boolean };
            const isCollapsed = collapsedNodes.has(node.id);

            return (
              <g
                key={node.id}
                transform={\`translate(\${coord.x}, \${coord.y})\`}
                style={{
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                onClick={() => onNodeClick(node)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (nodeExt.hasChildren) {
                    onToggleFold(node.id);
                  }
                }}
                className={\`cursor-pointer group select-none \${isCurrent ? 'z-10' : ''}\`}
              >
                <g style={{ 
                  transform: \`scale(\${isCurrent ? 4 : 1})\`, 
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transformOrigin: '0 0'
                }}>
                  {/* Visual cue in Fold Mode for folding capable nodes */}
                  {interactionMode === "fold" && nodeExt.hasChildren && (
                    <circle
                      r={(node.level === 0 ? 46 : 36) * baseScale}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth={2 * baseScale}
                      strokeDasharray="4,4"
                      className="animate-pulse opacity-90"
                    />
                  )}

                  {/* Outer dynamic pulsating ring when currently playing */}
                  {isCurrent && (
                    <circle
                      r={(node.level === 0 ? 40 : 32) * baseScale}
                      fill="none"
                      stroke={metronomeBeat === 1 ? "#ef4444" : "#22c55e"}
                      strokeWidth={3.5 * baseScale}
                      filter="url(#neon-glow)"
                      className="animate-ping opacity-70"
                    />
                  )}

                  {/* Main node bubble */}
                  <circle
                    r={(node.level === 0 ? 35 : 26) * baseScale}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={(isCurrent ? 3 : isPath ? 2 : isPlanned ? 1.5 : 1) * baseScale}
                    filter={isCurrent ? "url(#neon-glow-strong)" : undefined}
                    className={\`transition-all duration-700 \${isPlanned && !isPath ? "animate-pulse" : ""}\`}
                  />

                  {/* Center dot inside node */}
                  <circle
                    r={2 * baseScale}
                    fill={isCurrent ? "#ffffff" : strokeColor}
                    opacity={node.level === 0 ? 0 : 0.5}
                  />

                  {/* Chord Label text */}
                  <text
                    y={(node.level === 0 ? 8 : 6) * baseScale}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={(node.level === 0 ? 24 : 19) * baseScale}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    className="pointer-events-none select-none tracking-tight"
                  >
                    {node.label}
                  </text>

                  {nodeExt.hasChildren && (
                    <circle
                      cx="0"
                      cy={(node.level === 0 ? 22 : 16) * baseScale}
                      r={5 * baseScale}
                      fill={isCollapsed ? "#ec4899" : "#312e81"}
                      opacity="0.8"
                    />
                  )}

                  {nodeExt.hasChildren && isCollapsed && (
                    <text
                      y={(node.level === 0 ? 25.5 : 19.5) * baseScale}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={9 * baseScale}
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      +
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </g>
      </svg>`;

code = code.replace(/<g id="chord-nodes">.*<\/svg>/s, newCode);
fs.writeFileSync('src/components/ChordTreeSvg.tsx', code);
