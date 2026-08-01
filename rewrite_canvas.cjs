const fs = require('fs');

const code = `import React, { useMemo, useEffect, useRef, useState } from "react";
import { ChordNode, ChordLink, ProgressionStep } from "../types";

interface ChordTreeSvgProps {
  CHORD_NODES: ChordNode[];
  CHORD_LINKS: ChordLink[];
  maxDepth: number;
  collapsedNodes: Set<string>;
  activeNodeId: string;
  activeStepIndex: number;
  activeProgression: ProgressionStep[];
  onNodeClick: (node: ChordNode) => void;
  onToggleFold: (nodeId: string) => void;
  metronomeBeat: number;
  interactionMode?: "play" | "fold";
}

export const ChordTreeSvg: React.FC<ChordTreeSvgProps> = ({
  CHORD_NODES,
  CHORD_LINKS,
  maxDepth,
  collapsedNodes,
  activeNodeId,
  activeStepIndex,
  activeProgression,
  onNodeClick,
  onToggleFold,
  metronomeBeat,
  interactionMode = "play",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  // Handle ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ w: width, h: height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Translate polar coordinates (angle, radius) into Cartesian (x, y)
  const { nodeCoords, optimalScale } = useMemo(() => {
    const coords: { [id: string]: { x: number; y: number } } = {};
    const maxRadius = 460;
    CHORD_NODES.forEach((node) => {
      const angleRad = (node.angle * Math.PI) / 180;
      const r = node.radius * maxRadius;
      coords[node.id] = {
        x: r * Math.cos(angleRad),
        y: r * Math.sin(angleRad),
      };
    });

    const distRootToLevel1 = maxRadius / Math.max(1, maxDepth);
    const maxScaleForRoot = (distRootToLevel1 * 0.92) / 61;
    let minNormalDistance = distRootToLevel1;
    
    const normalNodeIds = CHORD_NODES.filter((n) => n.level > 0).map((n) => n.id);
    for (let i = 0; i < normalNodeIds.length; i++) {
      const p1 = coords[normalNodeIds[i]];
      for (let j = i + 1; j < normalNodeIds.length; j++) {
        const p2 = coords[normalNodeIds[j]];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.1 && dist < minNormalDistance) {
          minNormalDistance = dist;
        }
      }
    }

    const maxScaleForNormal = (minNormalDistance * 0.92) / 52;
    const calculatedScale = Math.min(maxScaleForRoot, maxScaleForNormal);
    const scale = Math.min(3.0, Math.max(0.2, calculatedScale));

    return { nodeCoords: coords, optimalScale: scale };
  }, [CHORD_NODES, maxDepth]);

  const baseScale = optimalScale;
  const viewLimit = 460 + 46 * baseScale + 10;

  // Derive state logic (same as SVG)
  const { visitedNodes, visitedLinks, activeLinkId, plannedNodes, plannedLinks } = useMemo(() => {
    const nodes = new Set<string>();
    const links = new Set<string>();
    const pNodes = new Set<string>();
    const pLinks = new Set<string>();
    let activeLink: string | null = null;
    let prevNodeId: string | null = null;
    let prevPlannedNodeId: string | null = null;
    const currentStep = activeProgression[activeStepIndex] || null;

    for (let i = 0; i < activeProgression.length; i++) {
      const step = activeProgression[i];
      if (!step || step.type !== "node") continue;

      pNodes.add(step.id);
      if (prevPlannedNodeId) {
        const pLink = CHORD_LINKS.find((l) => l.from === prevPlannedNodeId && l.to === step.id);
        if (pLink) pLinks.add(pLink.id);
      }
      prevPlannedNodeId = step.id;

      if (i <= activeStepIndex) {
        nodes.add(step.id);
        if (prevNodeId) {
          const link = CHORD_LINKS.find((l) => l.from === prevNodeId && l.to === step.id);
          if (link) {
            links.add(link.id);
            if (i === activeStepIndex) {
              activeLink = link.id;
            }
          }
        }
        prevNodeId = step.id;
      }
    }

    return {
      visitedNodes: nodes,
      visitedLinks: links,
      activeLinkId: activeLink,
      plannedNodes: pNodes,
      plannedLinks: pLinks,
    };
  }, [activeProgression, activeStepIndex, CHORD_LINKS]);

  // RequestAnimationFrame setup for animations (pulsing metronome)
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || dimensions.w === 0 || dimensions.h === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.w * dpr;
    canvas.height = dimensions.h * dpr;
    ctx.scale(dpr, dpr);

    const render = (time: number) => {
      // Clear background
      ctx.fillStyle = "#02000f";
      ctx.fillRect(0, 0, dimensions.w, dimensions.h);

      ctx.save();
      ctx.translate(dimensions.w / 2, dimensions.h / 2);

      // Fit the viewLimit to the canvas size
      const scaleToFit = Math.min(dimensions.w, dimensions.h) / (viewLimit * 2);
      ctx.scale(scaleToFit, scaleToFit);

      // 1. Draw Background guidelines
      ctx.strokeStyle = "#1e1b4b";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      for (let i = 1; i <= maxDepth; i++) {
        ctx.beginPath();
        const r = Math.pow(i / Math.max(1, maxDepth), 0.85) * 460;
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 2. Draw Links
      CHORD_LINKS.forEach((link) => {
        const start = nodeCoords[link.from];
        const end = nodeCoords[link.to];
        if (!start || !end) return;

        const isCurrentLink = activeLinkId === link.id;
        const isVisitedLink = visitedLinks.has(link.id);
        const isPlannedLink = plannedLinks.has(link.id);

        if (isCurrentLink) {
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 10;
          ctx.lineCap = "round";
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        ctx.strokeStyle = isCurrentLink
          ? "#fbbf24"
          : isVisitedLink
          ? "#a855f7"
          : isPlannedLink
          ? "#6366f1"
          : "#1e1b4b";
        ctx.lineWidth = isCurrentLink ? 4 : isVisitedLink ? 2.5 : isPlannedLink ? 2 : 1.5;
        if (isPlannedLink && !isVisitedLink) ctx.setLineDash([4, 6]);
        else ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Label
        if (link.label) {
          const mx = (start.x + end.x) / 2;
          const my = (start.y + end.y) / 2;
          ctx.fillStyle = "#02000f";
          ctx.strokeStyle = isCurrentLink ? "#fbbf24" : isVisitedLink ? "#a855f7" : "#1e1b4b";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(mx, my, 9 * baseScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          ctx.fillStyle = isCurrentLink ? "#fbbf24" : isVisitedLink ? "#d8b4fe" : "#6b7280";
          ctx.font = \`bold \${8 * baseScale}px sans-serif\`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(link.label, mx, my);
        }
      });
      ctx.setLineDash([]);

      // 3. Draw Nodes
      // Sort nodes to render active node last
      const currentStepObj = activeProgression[activeStepIndex] || null;
      const nodesSorted = [...CHORD_NODES].sort((a, b) => 
        (a.id === activeNodeId ? 1 : 0) - (b.id === activeNodeId ? 1 : 0)
      );

      nodesSorted.forEach((node) => {
        const coord = nodeCoords[node.id];
        if (!coord) return;

        const isCurrent = activeNodeId === node.id && currentStepObj?.type === "node";
        const isPath = visitedNodes.has(node.id);
        const isPlanned = plannedNodes.has(node.id);
        const nodeExt = node as ChordNode & { hasChildren?: boolean };
        const isCollapsed = collapsedNodes.has(node.id);

        let strokeColor = "#1e1b4b";
        let fillColor = "#020210";
        let textColor = "#4b5563";

        if (node.level === 0) {
          strokeColor = isCurrent ? "#ec4899" : isPath ? "#d946ef" : "#9333ea";
          fillColor = isCurrent ? "#7e22ce" : "#3b0764";
          textColor = "#ffffff";
        } else if (node.type === "major") {
          strokeColor = isCurrent ? "#fbbf24" : isPath ? "#f43f5e" : isPlanned ? "#6366f1" : "#9f1239";
          textColor = isCurrent ? "#ffffff" : isPath ? "#ffffff" : isPlanned ? "#a5b4fc" : "#fb7185";
          fillColor = isCurrent ? "#e11d48" : isPath ? "#881337" : isPlanned ? "#1e1b4b" : "#2a0416";
        } else {
          strokeColor = isCurrent ? "#fbbf24" : isPath ? "#0ea5e9" : isPlanned ? "#6366f1" : "#0369a1";
          textColor = isCurrent ? "#ffffff" : isPath ? "#ffffff" : isPlanned ? "#a5b4fc" : "#38bdf8";
          fillColor = isCurrent ? "#0284c7" : isPath ? "#0c4a6e" : isPlanned ? "#1e1b4b" : "#041428";
        }

        ctx.save();
        ctx.translate(coord.x, coord.y);

        const nodeScale = isCurrent ? Math.max(1, 1 + Math.sin(time / 200) * 0.1) : 1;
        ctx.scale(nodeScale, nodeScale);

        // Fold mode indicator
        if (interactionMode === "fold" && nodeExt.hasChildren) {
          ctx.strokeStyle = "#ec4899";
          ctx.lineWidth = 2 * baseScale;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, (node.level === 0 ? 46 : 36) * baseScale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Current active ping
        if (isCurrent) {
          const pingScale = 1 + (time % 1000) / 1000 * 0.3;
          ctx.strokeStyle = metronomeBeat === 1 ? "#ef4444" : "#22c55e";
          ctx.lineWidth = 3.5 * baseScale * (1 - (time % 1000) / 1000);
          ctx.beginPath();
          ctx.arc(0, 0, (node.level === 0 ? 40 : 32) * baseScale * pingScale, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Main bubble
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = (isCurrent ? 3 : isPath ? 2 : isPlanned ? 1.5 : 1) * baseScale;
        
        ctx.beginPath();
        ctx.arc(0, 0, (node.level === 0 ? 35 : 26) * baseScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Center dot
        ctx.fillStyle = isCurrent ? "#ffffff" : strokeColor;
        ctx.globalAlpha = node.level === 0 ? 0 : 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, 2 * baseScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Label
        ctx.fillStyle = textColor;
        ctx.font = \`bold \${(node.level === 0 ? 24 : 19) * baseScale}px sans-serif\`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, 0, (node.level === 0 ? 3 : 2) * baseScale);

        // Plus icon for collapsed
        if (nodeExt.hasChildren) {
          ctx.fillStyle = isCollapsed ? "#ec4899" : "#312e81";
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(0, (node.level === 0 ? 22 : 16) * baseScale, 5 * baseScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          if (isCollapsed) {
            ctx.fillStyle = "#fff";
            ctx.font = \`bold \${9 * baseScale}px sans-serif\`;
            ctx.fillText("+", 0, (node.level === 0 ? 22.5 : 16.5) * baseScale);
          }
        }

        ctx.restore();
      });

      ctx.restore();
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, CHORD_NODES, CHORD_LINKS, maxDepth, nodeCoords, viewLimit, baseScale, visitedNodes, visitedLinks, plannedNodes, plannedLinks, activeLinkId, activeNodeId, activeStepIndex, activeProgression, collapsedNodes, interactionMode, metronomeBeat]);

  const getPointerCoord = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const x = clientX - rect.left - dimensions.w / 2;
    const y = clientY - rect.top - dimensions.h / 2;
    
    // Reverse scale
    const scaleToFit = Math.min(dimensions.w, dimensions.h) / (viewLimit * 2);
    return { x: x / scaleToFit, y: y / scaleToFit };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pt = getPointerCoord(e);
    if (!pt) return;

    // Find closest node
    let closestNode = null;
    let minDist = Infinity;

    for (const node of CHORD_NODES) {
      const coord = nodeCoords[node.id];
      if (!coord) continue;
      const dx = pt.x - coord.x;
      const dy = pt.y - coord.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = (node.level === 0 ? 35 : 26) * baseScale;
      
      if (dist < radius + 10 && dist < minDist) {
        minDist = dist;
        closestNode = node;
      }
    }

    if (closestNode) {
      // Differentiate right click / long press via onContextMenu if possible, 
      // but here we just handle left click since we will bind onContextMenu to the container.
      // Wait, let's keep it simple:
      if (e.type === "contextmenu" || ("button" in e && e.button === 2)) {
        e.preventDefault();
        const nodeExt = closestNode as ChordNode & { hasChildren?: boolean };
        if (nodeExt.hasChildren) {
          onToggleFold(closestNode.id);
        }
      } else {
        if (interactionMode === "fold" && (closestNode as ChordNode & { hasChildren?: boolean }).hasChildren) {
            onToggleFold(closestNode.id);
        } else {
            onNodeClick(closestNode);
        }
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePointerDown(e);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#02000f] rounded-xl ring-1 ring-white/5">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer touch-none"
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
};
`
fs.writeFileSync('src/components/ChordTreeSvg.tsx', code);
