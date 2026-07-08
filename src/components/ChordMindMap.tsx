import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ChordTreeNode, buildChordTree, getDominant } from '../chordsData';
import { ProgressionStep } from '../types';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, HelpCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface ChordMindMapProps {
  rootTree: ChordTreeNode;
  maxTreeDepth: number;
  collapsedNodes: Set<string>;
  activeNodeId: string;
  activeProgression: ProgressionStep[];
  activeStepIndex: number;
  onNodeClick: (nodeId: string, chordName: string, path: string[]) => void;
  onToggleFold: (nodeId: string) => void;
  metronomeBeat: number;
  interactionMode: "play" | "fold";
  isPlaying: boolean;
}

export const ChordMindMap: React.FC<ChordMindMapProps> = ({ 
  rootTree, 
  maxTreeDepth, 
  collapsedNodes, 
  activeNodeId, 
  activeProgression,
  activeStepIndex,
  onNodeClick, 
  onToggleFold,
  metronomeBeat,
  interactionMode,
  isPlaying
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const zoomBehaviorRef = useRef<any>(null);
  const timeRef = useRef<number>(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 400),
          height: Math.max(height, 500)
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: Math.max(rect.width, 400), height: Math.max(rect.height, 500) });
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    // 1. Get raw hierarchical data
    const hierarchy = d3.hierarchy(rootTree, d => {
      if (collapsedNodes.has(d.id)) return null;
      return d.children;
    });

    // 2. Setup D3 Radial Tree layout
    const radiusStep = dimensions.width < 640 ? 70 : 100;
    const treeLayout = d3.tree<ChordTreeNode>().size([2 * Math.PI, maxTreeDepth * radiusStep]);
    treeLayout(hierarchy);

    // 3. Extract and position nodes
    const mainNodes: any[] = [];
    const domNodes: any[] = [];
    const links: any[] = [];

    hierarchy.each(d => {
      // Rotate -PI/2 to start the first branch perfectly UP (12 o'clock)
      const angle = d.x - Math.PI / 2;
      const radius = d.depth * radiusStep;
      
      d.data.cx = radius * Math.cos(angle);
      d.data.cy = radius * Math.sin(angle);
      
      mainNodes.push(d);

      if (d.parent) {
        links.push({
          source: d.parent,
          target: d
        });

        const domChord = getDominant(d.data.name);
        domNodes.push({
          id: `dom-${d.parent.data.id}-${d.data.id}`,
          name: domChord,
          type: 'dominant',
          cx: (d.parent.data.cx + d.data.cx) / 2,
          cy: (d.parent.data.cy + d.data.cy) / 2,
          path: [...d.parent.data.path, domChord]
        });
      }
    });

    // 4. Render SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'main-group');

    // Restore previous zoom transform if exists
    if (zoomBehaviorRef.current) {
       const currentTransform = d3.zoomTransform(svg.node() as Element);
       g.attr('transform', currentTransform.toString());
    }

    const zoom = d3.zoom()
      .scaleExtent([0.15, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    // Apply zoom
    svg.call(zoom as any);
    zoomBehaviorRef.current = zoom;

    // Apply initial transform only if it's the very first time
    if (!svg.attr('data-zoomed')) {
        const initialScale = dimensions.width < 640 ? 0.7 : 0.9;
        const initialTransform = d3.zoomIdentity
            .translate(dimensions.width / 2, dimensions.height / 2)
            .scale(initialScale);
        svg.call(zoom.transform as any, initialTransform);
        svg.attr('data-zoomed', 'true');
    } else {
        const currentTransform = d3.zoomTransform(svg.node() as Element);
        svg.call(zoom.transform as any, currentTransform);
    }

    // Prepare active tracking lists
    const activeProgressionIds = new Set(activeProgression.map(p => p.id));

    // 5. Draw Links
    g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('x1', d => d.source.data.cx)
      .attr('y1', d => d.source.data.cy)
      .attr('x2', d => d.target.data.cx)
      .attr('y2', d => d.target.data.cy)
      .attr('stroke', d => {
         const isActive = activeProgressionIds.has(d.source.data.id) && activeProgressionIds.has(d.target.data.id);
         return isActive ? '#6366f1' : '#1e1b4b';
      })
      .attr('stroke-opacity', d => {
         const isActive = activeProgressionIds.has(d.source.data.id) && activeProgressionIds.has(d.target.data.id);
         return isActive ? 0.9 : 0.6;
      })
      .attr('stroke-width', d => {
         const isActive = activeProgressionIds.has(d.source.data.id) && activeProgressionIds.has(d.target.data.id);
         return isActive ? 3 : 1.2;
      });

    // 6. Draw Dominant Nodes (Transitions)
    const domG = g.append('g')
      .selectAll('.dom-node')
      .data(domNodes)
      .join('g')
      .attr('class', 'dom-node')
      .attr('id', d => `node-g-${d.id}`)
      .attr('transform', d => `translate(${d.cx},${d.cy})`);

    domG.append('circle')
      .attr('class', 'active-halo')
      .attr('r', 15)
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('stroke-width', 3);

    domG.append('circle')
      .attr('class', 'main-circle')
      .attr('r', 11)
      .attr('fill', d => activeProgressionIds.has(d.id) ? '#451a03' : '#1a140f') 
      .attr('stroke', d => activeProgressionIds.has(d.id) ? '#f59e0b' : '#c78642') 
      .attr('stroke-width', d => activeProgressionIds.has(d.id) ? 2 : 1.2);

    domG.append('text')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#c78642')
      .style('font-size', '9px')
      .style('font-weight', '600')
      .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
      .text(d => d.name);

    // 7. Draw Main Nodes
    const nodeG = g.append('g')
      .selectAll('.main-node')
      .data(mainNodes)
      .join('g')
      .attr('class', 'main-node')
      .attr('id', d => `node-g-${d.data.id}`)
      .attr('transform', d => `translate(${d.data.cx},${d.data.cy})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (interactionMode === "fold" && d.data.children.length > 0) {
            onToggleFold(d.data.id);
        } else {
            onNodeClick(d.data.id, d.data.name, d.data.path);
        }
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        onToggleFold(d.data.id);
      })
      .on('contextmenu', (event, d) => {
        event.preventDefault();
        onToggleFold(d.data.id);
      });

    // Fold mode indicator
    if (interactionMode === "fold") {
        nodeG.filter((d: any) => d.data.children.length > 0)
            .append('circle')
            .attr('r', d => d.depth === 0 ? 32 : 26)
            .attr('fill', 'none')
            .attr('stroke', '#ec4899')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4,4');
    }

    // Pulsing Active Halo
    nodeG.append('circle')
      .attr('class', 'active-halo')
      .attr('r', d => d.depth === 0 ? 28 : 22)
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('stroke-width', 3);

    // Main Circle
    nodeG.append('circle')
      .attr('class', 'main-circle')
      .attr('r', d => d.depth === 0 ? 24 : 18)
      .attr('fill', d => {
         const isPath = activeProgressionIds.has(d.data.id);
         return isPath ? '#881337' : '#240a13';
      }) 
      .attr('stroke', d => {
         const isPath = activeProgressionIds.has(d.data.id);
         if (d.data.type === 'minor') return isPath ? '#0ea5e9' : '#4eb8df';
         return isPath ? '#f43f5e' : '#df4e7e';
      })
      .attr('stroke-width', 2);

    // Text Label
    nodeG.append('text')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.data.type === 'minor' ? '#8fd6f5' : '#f58fb3')
      .style('font-size', d => d.depth === 0 ? '14px' : '12px')
      .style('font-weight', '600')
      .style('font-family', 'sans-serif')
      .text(d => d.data.name);

    // Collapsed Subtree Indicator
    nodeG.filter((d: any) => d.data.children && d.data.children.length > 0 && collapsedNodes.has(d.data.id))
      .append('circle')
      .attr('r', d => d.depth === 0 ? 27 : 21)
      .attr('fill', 'none')
      .attr('stroke', d => d.data.type === 'minor' ? '#4eb8df' : '#df4e7e')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2, 2');

  }, [dimensions, collapsedNodes, rootTree, interactionMode, activeProgression]); // Rebuild tree when structure changes

  // Separate animation loop for active node pulsing (avoids rebuilding D3 DOM)
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    const animate = (time: number) => {
        timeRef.current = time;
        
        // Reset all halos and circles and text
        svg.selectAll('.active-halo')
           .attr('stroke', 'none');
        
        svg.selectAll('.main-circle')
           .attr('transform', 'scale(1)');
           
        svg.selectAll('text')
           .attr('transform', 'scale(1)');

        const currentStep = activeProgression[activeStepIndex];
        const animatingId = currentStep ? currentStep.id : activeNodeId;

        if (animatingId) {
            // Use CSS.escape to prevent syntax errors on chords like C#m, fallback to getElementById
            let activeG = d3.select(svgRef.current).select(`#node-g-${CSS.escape(animatingId)}`);
            if (activeG.empty()) {
                const el = document.getElementById(`node-g-${animatingId}`);
                if (el) activeG = d3.select(el);
            }
            
            if (!activeG.empty()) {
                const targetScale = 4;
                const pingScale = targetScale + (time % 1000) / 1000 * 0.4;
                const strokeOpacity = 1 - (time % 1000) / 1000;
                
                activeG.select('.active-halo')
                   .attr('stroke', metronomeBeat === 1 ? '#ef4444' : '#22c55e')
                   .attr('stroke-opacity', strokeOpacity)
                   .attr('transform', `scale(${pingScale})`);

                // Pulsing main circle for extreme enlargement
                const baseEnlargeScale = targetScale;
                const nodeScale = baseEnlargeScale + (isPlaying ? Math.sin(time / 200) * 0.15 : 0);
                activeG.select('.main-circle').attr('transform', `scale(${nodeScale})`);
                
                // Enlarge text and center dot
                activeG.select('text').attr('transform', `scale(${nodeScale})`);
            }
        }

        if (isPlaying || animatingId) {
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activeNodeId, isPlaying, metronomeBeat, activeProgression, activeStepIndex]);

  const handleZoom = (factor: number) => {
    const svg = d3.select(svgRef.current);
    if (zoomBehaviorRef.current) {
      svg.transition().duration(250).call(zoomBehaviorRef.current.scaleBy as any, factor);
    }
  };

  const handleResetZoom = () => {
    const svg = d3.select(svgRef.current);
    if (zoomBehaviorRef.current) {
      const initialScale = dimensions.width < 640 ? 0.7 : 0.9;
      const initialTransform = d3.zoomIdentity
        .translate(dimensions.width / 2, dimensions.height / 2)
        .scale(initialScale);
      svg.transition().duration(400).call(zoomBehaviorRef.current.transform as any, initialTransform);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[200px] bg-[#0a0a0d] rounded-2xl border border-indigo-950/40 overflow-hidden select-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
      
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

      {/* SVG Canvas */}
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="block relative z-10 w-full h-full touch-none cursor-grab active:cursor-grabbing"
      />

      {/* Top Right Guide (Scaled down on md/lg to prevent clipping) */}
      <div className="absolute top-2 right-0 z-20 w-max max-w-[240px] md:max-w-[280px] bg-[#060a1f]/90 backdrop-blur-md border border-indigo-900/50 border-r-0 rounded-l-xl pl-3 pr-1 py-2 md:pl-4 md:pr-2 md:py-3 shadow-2xl select-none origin-top-right transform scale-75 xl:scale-100 mobile-guide transition-all duration-300">
        <button 
          onClick={() => setIsGuideExpanded(!isGuideExpanded)}
          className={`flex items-center justify-between w-full gap-1.5 text-slate-200 font-bold text-[13px] ${isGuideExpanded ? 'mb-2 border-b border-indigo-900/50 pb-1.5' : ''} pr-2 cursor-pointer hover:text-sky-300 transition-colors`}
          title={isGuideExpanded ? "收合探索指南" : "展開探索指南"}
        >
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="whitespace-nowrap">探索指南 (Tree Mode)</span>
          </div>
          {isGuideExpanded ? <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-indigo-400 shrink-0" />}
        </button>
        
        {isGuideExpanded && (
          <ul className="text-[11px] font-medium tracking-wide flex flex-col gap-1.5 list-disc pl-4 pr-1 marker:text-slate-500 animate-in fade-in slide-in-from-top-2 duration-200">
            <li className="text-slate-300">完美對齊原圖的碎形結構</li>
            <li>
              <span className="text-pink-400">粉色大調</span> <span className="text-slate-500">/</span> <span className="text-sky-400">藍色小調</span>
            </li>
            <li className="text-amber-500">黃褐色為過渡屬七和弦</li>
            <li className="text-slate-400">單擊選取播放，雙擊折疊子樹</li>
          </ul>
        )}
      </div>

      {/* Controls: Zoom and Expand */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20 flex flex-wrap gap-2 items-center mobile-landscape-zoom-btns">
        <button onClick={() => handleZoom(1.3)} className="p-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 rounded-lg border border-indigo-900 backdrop-blur transition-all active:scale-95" title="放大"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={() => handleZoom(0.7)} className="p-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 rounded-lg border border-indigo-900 backdrop-blur transition-all active:scale-95" title="縮小"><ZoomOut className="w-4 h-4" /></button>
        <button onClick={handleResetZoom} className="p-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 rounded-lg border border-indigo-900 backdrop-blur transition-all active:scale-95" title="重設視角"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={() => { onToggleFold("EXPAND_ALL"); }} className="p-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 rounded-lg border border-indigo-900 backdrop-blur transition-all active:scale-95" title="展開所有節點"><Maximize2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
};
