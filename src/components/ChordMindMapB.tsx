import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type NodeType = 'Root' | 'Dom' | 'Major' | 'Minor';

interface TreeNode {
  name: string;
  type: NodeType;
  children?: TreeNode[];
}

const chromatic = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

function getIndex(note: string) {
  const aliases: Record<string, string> = {
    'Db': 'C#', 'D#': 'Eb', 'Gb': 'F#', 'G#': 'Ab', 'A#': 'Bb'
  };
  const n = aliases[note] || note;
  return chromatic.indexOf(n);
}

function getNote(index: number) {
  return chromatic[(index % 12 + 12) % 12];
}

function getP5Down(note: string) { 
  return getNote(getIndex(note) + 5);
}

function getM3Up(note: string) { 
  return getNote(getIndex(note) + 3);
}

function getMaj3Up(note: string) { 
  return getNote(getIndex(note) + 4);
}

function buildHierarchy(name: string, type: NodeType, depth: number, maxDepth: number): TreeNode {
  if (depth >= maxDepth) return { name, type };

  let children: TreeNode[] = [];

  if (type === 'Root') {
    children = [
      buildHierarchy('E7', 'Dom', depth + 1, maxDepth),
      buildHierarchy('B7', 'Dom', depth + 1, maxDepth),
      buildHierarchy('G7', 'Dom', depth + 1, maxDepth)
    ];
  } else if (type === 'Dom') {
    const rootNote = name.replace('7', '');
    const resMaj = getP5Down(rootNote);
    const resMin = resMaj + 'm';
    children = [
      buildHierarchy(resMaj, 'Major', depth + 1, maxDepth),
      buildHierarchy(resMin, 'Minor', depth + 1, maxDepth)
    ];
  } else if (type === 'Minor') {
    const rootNote = name.replace('m', '');
    const m3Note = getM3Up(rootNote);
    const dom1 = m3Note + '7';
    const dom2 = rootNote + '7';
    children = [
      buildHierarchy(dom1, 'Dom', depth + 1, maxDepth),
      buildHierarchy(dom2, 'Dom', depth + 1, maxDepth)
    ];
  } else if (type === 'Major') {
    const M3Note = getMaj3Up(name);
    const dom = M3Note + '7';
    children = [
      buildHierarchy(dom, 'Dom', depth + 1, maxDepth)
    ];
  }

  return { name, type, children: children.length > 0 ? children : undefined };
}

const getStrokeColor = (type: NodeType) => {
  if (type === 'Major' || type === 'Root') return '#9e2a46'; 
  if (type === 'Minor') return '#2a6a8c'; 
  return '#7a5a3a'; 
};

const getFillColor = (type: NodeType) => {
  if (type === 'Major' || type === 'Root') return '#e86a8a'; 
  if (type === 'Minor') return '#6ecaf5'; 
  return '#d99e6a'; 
};

interface ChordMindMapBProps {
  maxDepth: number;
}

export const ChordMindMapB: React.FC<ChordMindMapBProps> = ({ maxDepth }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    let currentZoomTransform = d3.zoomIdentity;
    const svg = d3.select(svgRef.current);
    
    // Create main group only once to preserve it during resizes
    if (svg.select('g.main-group').empty()) {
      svg.append('g').attr('class', 'main-group');
    }
    const g = svg.select('g.main-group');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (e) => {
        currentZoomTransform = e.transform;
        g.attr('transform', e.transform as any);
      });
    
    svg.call(zoom);

    // Generate tree data
    const treeData = buildHierarchy('C', 'Root', 0, maxDepth);
    
    // Create hierarchy
    const root = d3.hierarchy<TreeNode>(treeData);
    
    // Radial layout
    const radius = 1200;
    const treeLayout = d3.tree<TreeNode>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
      
    treeLayout(root);

    // Convert to cartesian coordinates for bounding box ONLY
    root.each(d => {
      const dAny = d as any;
      // linkRadial uses 0 angle as UP (12 o'clock), so angle is d.x - Math.PI / 2
      const angle = d.x - Math.PI / 2; 
      dAny.cx = d.y * Math.cos(angle);
      dAny.cy = d.y * Math.sin(angle);
    });

    // Auto-fit zoom based on bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    root.each(d => {
      const dAny = d as any;
      if (dAny.cx < minX) minX = dAny.cx;
      if (dAny.cx > maxX) maxX = dAny.cx;
      if (dAny.cy < minY) minY = dAny.cy;
      if (dAny.cy > maxY) maxY = dAny.cy;
    });

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    // Drawing
    g.selectAll('*').remove();

    // Links
    g.append('g')
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 1.5)
      .attr('d', d3.linkRadial<any, any>()
        .angle(d => d.x)
        .radius(d => d.y)
      );

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', d => {
        const dAny = d as any;
        return `translate(${dAny.cx},${dAny.cy})`;
      });

    node.append('circle')
      .attr('r', d => d.data.type === 'Dom' ? 12 : 24)
      .attr('fill', '#0a0a0a')
      .attr('stroke', d => getStrokeColor(d.data.type))
      .attr('stroke-width', d => d.data.type === 'Dom' ? 1.5 : 2);

    node.append('text')
      .text(d => d.data.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', d => getFillColor(d.data.type))
      .attr('font-size', d => d.data.type === 'Dom' ? '11px' : '15px')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('font-weight', '500')
      .style('pointer-events', 'none');

    const handleResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      svg.attr('width', width).attr('height', height);

      // Only calculate initial zoom if it hasn't been set by user interaction
      if (currentZoomTransform.k === 1 && currentZoomTransform.x === 0 && currentZoomTransform.y === 0) {
        const scale = Math.min(width / (graphWidth + 200), height / (graphHeight + 200));
        const tx = width / 2 - ((minX + maxX) / 2) * scale;
        const ty = height / 2 - ((minY + maxY) / 2) * scale;
        svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerRef.current);
    
    // Initial size
    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [maxDepth]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden bg-[#0a0a0a]">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
