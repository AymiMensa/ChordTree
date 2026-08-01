import React, { useEffect, useRef } from 'react';
import { ProgressionStep } from '../types';
import { Play } from 'lucide-react';

interface CustomProgressionFlowProps {
  progression: ProgressionStep[];
  activeStepIndex: number;
}

export const CustomProgressionFlow: React.FC<CustomProgressionFlowProps> = ({ progression, activeStepIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to active step
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [activeStepIndex]);

  // Filter out transition steps if any, or just treat all steps as nodes?
  // Let's assume all steps in the array should be displayed in order.
  const displaySteps = progression;

  return (
    <div className="absolute inset-0 p-2 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col justify-center" ref={containerRef}>
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-y-4 sm:gap-y-6 md:gap-y-8 relative">
          {displaySteps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            // On mobile (sm breakpoint), we show 4 per row. On larger screens, 8 per row.
            // But requirement says: "一排八個和弦". I'll force 8 columns on all screens to strictly meet requirement, 
            // and use very small circles on phones to fit them.
            return (
              <div 
                key={`${step.id}-${idx}`} 
                className="relative flex justify-center items-center"
              >
                {/* Connecting Line to next item (except last in row) */}
                {idx < displaySteps.length - 1 && (idx % 8 !== 7) && (
                  <div className="absolute top-1/2 left-[50%] w-full h-[2px] bg-indigo-900/40 -z-10 transform -translate-y-1/2" />
                )}
                {/* If it's the last in a row and not the absolute last, maybe draw a line down and back? 
                    Requirement says "中間有連線", simple horizontal is enough. */}

                <div 
                  data-active={isActive}
                  className={`relative flex flex-col items-center justify-center 
                    w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 
                    rounded-full shadow-xl transition-all duration-300 border-2 shrink-0 z-10
                    ${isActive 
                      ? 'bg-gradient-to-br from-pink-600 to-purple-700 border-pink-400 scale-125 shadow-pink-500/40' 
                      : 'bg-[#0f093a] border-indigo-900/50 hover:border-indigo-500/50 hover:bg-[#1a115c]'
                  }`}
                >
                  <div className={`font-bold font-mono tracking-tighter
                    ${isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-slate-200'}
                    text-[10px] sm:text-xs md:text-sm lg:text-base
                  `}>
                    {step.label}
                  </div>
                  
                  {isActive && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse">
                      <Play className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 text-white fill-white ml-[1px]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
