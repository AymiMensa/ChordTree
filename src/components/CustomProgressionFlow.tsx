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

  return (
    <div className="absolute inset-0 p-4 sm:p-6 overflow-y-auto custom-scrollbar" ref={containerRef}>
      <div className="flex flex-wrap items-start content-start gap-4 h-full">
        {progression.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          return (
            <React.Fragment key={`${step.id}-${idx}`}>
              <div 
                data-active={isActive}
                className={`relative flex flex-col items-center justify-center p-4 min-w-[5rem] min-h-[5rem] rounded-2xl shadow-xl transition-all duration-300 border-2 shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-br from-pink-600 to-purple-700 border-pink-400 scale-110 shadow-pink-500/40 z-10' 
                    : 'bg-[#0f093a] border-indigo-900/50 hover:border-indigo-500/50 hover:bg-[#1a115c]'
                }`}
              >
                <div className={`text-2xl font-bold font-mono ${isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-slate-200'}`}>
                  {step.label}
                </div>
                <div className={`text-[10px] mt-1 font-mono tracking-widest ${isActive ? 'text-pink-200' : 'text-indigo-400'}`}>
                  {idx + 1}
                </div>
                
                {isActive && (
                  <div className="absolute -top-3 -right-3 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse">
                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                  </div>
                )}
              </div>
              
              {idx < progression.length - 1 && (
                <div className="flex items-center justify-center text-indigo-500 font-bold self-center opacity-60">
                  <span>→</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
