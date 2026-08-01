import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';

interface TooltipContextType {
  showTooltip: (text: string, rect: DOMRect) => void;
  hideTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}

export const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tooltipState, setTooltipState] = useState<{ text: string; rect: DOMRect } | null>(null);

  const showTooltip = (text: string, rect: DOMRect) => {
    setTooltipState({ text, rect });
  };

  const hideTooltip = () => {
    setTooltipState(null);
  };

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {tooltipState && <TooltipOverlay state={tooltipState} />}
    </TooltipContext.Provider>
  );
};

const TooltipOverlay: React.FC<{ state: { text: string; rect: DOMRect } }> = ({ state }) => {
  const { text, rect } = state;
  const [pos, setPos] = useState({ top: 0, left: 0, opacity: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const margin = 8;
      
      // Default position: above the element
      let top = rect.top - tooltipRect.height - margin;
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

      // Adjust for screen boundaries
      if (top < margin) {
        // If it goes off top, put it below
        top = rect.bottom + margin;
      }
      if (left < margin) {
        left = margin;
      } else if (left + tooltipRect.width > window.innerWidth - margin) {
        left = window.innerWidth - tooltipRect.width - margin;
      }

      setPos({ top, left, opacity: 1 });
    }
  }, [state]);

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        opacity: pos.opacity,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
      className="bg-slate-800 text-slate-100 text-[10px] sm:text-xs px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap transition-opacity duration-150"
    >
      {text}
    </div>
  );
};

export const Tooltip: React.FC<{ children: ReactNode; content: string; className?: string }> = ({ children, content, className = '' }) => {
  const { showTooltip, hideTooltip } = useTooltip();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handlePointerEnter = () => {
    if (wrapperRef.current && content) {
      showTooltip(content, wrapperRef.current.getBoundingClientRect());
    }
  };

  const handlePointerLeave = () => {
    hideTooltip();
  };

  return (
    <div 
      ref={wrapperRef} 
      className={`inline-block ${className}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      // For iOS Safari which might not fire pointer events perfectly on all elements
      onTouchStart={handlePointerEnter}
      onTouchEnd={handlePointerLeave}
      onTouchCancel={handlePointerLeave}
      // Prevent context menu on long press so tooltip stays visible
      onContextMenu={(e) => {
        // e.preventDefault(); // Un-comment if context menu blocks tooltip on long press
      }}
    >
      {children}
    </div>
  );
};
