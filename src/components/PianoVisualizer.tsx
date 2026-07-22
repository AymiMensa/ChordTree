import React, { useState } from 'react';
import { Play, Sparkles, ChevronDown, ChevronUp, Keyboard, Music2 } from 'lucide-react';

interface PianoVisualizerProps {
  activeMidiNotes: number[];
  chordType: 'major' | 'minor' | 'dominant' | 'seventh' | 'diminished' | 'other' | null;
  activeChordLabel: string;
  activeChordNotes: string[];
  activeChordFormula?: string;
  activeChordFullName?: string;
  onPlayChordDirectly?: () => void;
}

const WHITE_KEYS = [
  { midi: 48, label: "C3", idx: 0 },
  { midi: 50, label: "D3", idx: 1 },
  { midi: 52, label: "E3", idx: 2 },
  { midi: 53, label: "F3", idx: 3 },
  { midi: 55, label: "G3", idx: 4 },
  { midi: 57, label: "A3", idx: 5 },
  { midi: 59, label: "B3", idx: 6 },
  { midi: 60, label: "C4", idx: 7 },
  { midi: 62, label: "D4", idx: 8 },
  { midi: 64, label: "E4", idx: 9 },
  { midi: 65, label: "F4", idx: 10 },
  { midi: 67, label: "G4", idx: 11 },
  { midi: 69, label: "A4", idx: 12 },
  { midi: 71, label: "B4", idx: 13 },
  { midi: 72, label: "C5", idx: 14 }
];

const BLACK_KEYS = [
  { midi: 49, label: "C#3", x: 17 },
  { midi: 51, label: "D#3", x: 41 },
  { midi: 54, label: "F#3", x: 89 },
  { midi: 56, label: "G#3", x: 113 },
  { midi: 58, label: "A#3", x: 137 },
  { midi: 61, label: "C#4", x: 185 },
  { midi: 63, label: "D#4", x: 209 },
  { midi: 66, label: "F#4", x: 257 },
  { midi: 68, label: "G#4", x: 281 },
  { midi: 70, label: "A#4", x: 305 }
];

export const PianoVisualizer: React.FC<PianoVisualizerProps> = ({ 
  activeMidiNotes, 
  chordType,
  activeChordLabel,
  activeChordNotes,
  activeChordFormula,
  activeChordFullName,
  onPlayChordDirectly
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [displayMode, setDisplayMode] = useState<'keyboard' | 'staff'>('keyboard');

  const getHighlightColor = () => {
    switch (chordType) {
      case 'minor': return 'bg-blue-500 fill-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]';
      case 'major': return 'bg-pink-500 fill-pink-500 shadow-[0_0_12px_rgba(219,39,119,0.6)]';
      case 'dominant': 
      case 'seventh': return 'bg-amber-500 fill-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]';
      default: return 'bg-sky-400 fill-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]';
    }
  };

  const isNoteActive = (midi: number) => {
    return activeMidiNotes.includes(midi);
  };

  const keyWidth = 24;
  const totalWidth = 15 * keyWidth;
  const staffNotes: number[] = Array.from(new Set<number>(activeMidiNotes)).sort((a, b) => a - b);
  const staffPosition = (midi: number) => {
    const steps: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 10: 5, 11: 6 };
    return (Math.floor(midi / 12) - 4) * 7 + steps[midi % 12];
  };

  return (
    <div className="w-full bg-[#0a0f1d] border border-indigo-900/40 rounded-xl p-2 md:p-3 shadow-inner flex flex-col landscape:flex-row items-stretch gap-3 md:gap-4 landscape:gap-2 relative overflow-hidden backdrop-blur-sm">
      
      {/* Fold/Unfold Header */}
      <div className="flex items-center justify-between px-1 md:hidden">
         <div className="text-[7px] md:text-[8px] font-mono text-slate-500 flex items-center gap-1">
           <Sparkles className="w-3 h-3 text-indigo-400" />
           <span>和弦與鍵盤資訊</span>
         </div>
         <button 
           onClick={() => setIsExpanded(!isExpanded)}
           className="flex items-center gap-1 text-[7px] md:text-[8px] bg-indigo-950/50 hover:bg-indigo-900 text-indigo-300 px-2 py-1 rounded transition-colors active:scale-95"
         >
           {isExpanded ? (
             <><ChevronUp className="w-3 h-3" /> 摺疊資訊</>
           ) : (
             <><ChevronDown className="w-3 h-3" /> 展開資訊</>
           )}
         </button>
      </div>

      {/* Left Area: Chord Details and Formula */}
      <div className={`w-full landscape:w-[45%] flex-col gap-2 min-w-0 landscape:justify-center ${isExpanded ? 'flex' : 'hidden md:flex landscape:flex'}`}>
        
        {/* Card 1: Main details */}
        <div className="flex-1 bg-black/40 border border-indigo-950/80 rounded-lg p-2.5 md:p-3 flex flex-col justify-center shadow-lg relative overflow-hidden group mobile-landscape-card">
           <div className="flex items-center justify-between mb-1">
             <span className="text-[7px] md:text-[8px] text-slate-500 font-medium flex items-center gap-1" title="當前選擇的和弦">
               <Sparkles className="w-3 h-3 text-pink-500" />
               當前和弦
             </span>
             <div className="flex items-center gap-1 bg-[#022c22]/80 border border-[#047857] text-[#34d399] px-1.5 py-0.5 rounded text-[6px] md:text-[7px] font-bold" title="此和弦已被選取">
               已選取
             </div>
           </div>
           
           <div className="flex items-center gap-2 mb-1.5">
             <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
               {activeChordLabel}
             </div>
             
             <div className="flex flex-col gap-1 mt-0.5">
               <span className="text-[6px] md:text-[7px] font-bold text-[#f59e0b] border border-[#b45309] bg-[#451a03]/50 px-2 py-0.5 rounded-full whitespace-nowrap self-start mobile-landscape-chord-name" title="和弦完整名稱">
                 {activeChordFullName || "Unknown"}
               </span>
               <span className="text-[6px] md:text-[7px] font-medium text-slate-300 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full whitespace-nowrap self-start mobile-landscape-chord-name" title="和弦組成音符">
                 組成音: {activeChordNotes.join(", ")}
               </span>
             </div>
           </div>
           
           {onPlayChordDirectly && (
             <button 
               onClick={onPlayChordDirectly} 
               title="播放當前和弦 (Play Current Chord)"
               className="w-full bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-600 text-slate-200 font-medium py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all shadow text-[8px] md:text-[9px] max-lg:landscape:text-[6px] max-lg:landscape:py-1 max-lg:landscape:gap-1 landscape:py-1.5 landscape:text-[10px] mt-auto mobile-landscape-play-btn"
             >
               <Play className="w-3.5 h-3.5 fill-current text-slate-300" />
               播放和弦
             </button>
           )}
        </div>

        {/* Card 2: Formula */}
        <div className="bg-black/40 border border-indigo-950/80 rounded-lg p-2.5 md:p-3 shadow-lg flex flex-col justify-center min-w-0 overflow-hidden mobile-landscape-card">
          <span className="text-[7px] md:text-[8px] text-slate-400 font-bold mb-1" title="和弦結構公式">和弦公式 (Formula)</span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[7px] md:text-[8px] font-mono min-w-0 gap-1">
            <span className="text-slate-500 truncate min-w-0 mr-2 mobile-landscape-chord-formula">{activeChordFullName || "Unknown"}</span>
            <span className="text-indigo-300 font-bold tracking-widest whitespace-nowrap shrink-0 mobile-landscape-chord-formula">{activeChordFormula || "N/A"}</span>
          </div>
        </div>

      </div>

      {/* Right Area: Keyboard Visualizer */}
      <div className="shrink-0 flex flex-col items-center justify-center bg-indigo-950/20 p-2 md:p-3 max-lg:landscape:p-1 landscape:p-2 rounded-lg border border-indigo-900/40 w-full landscape:w-[55%] min-w-0">
        <button type="button" onClick={() => setDisplayMode(mode => mode === 'keyboard' ? 'staff' : 'keyboard')} className="self-end mb-1 flex items-center gap-1 rounded border border-indigo-800/80 bg-indigo-950/70 px-1.5 py-1 text-[6px] md:text-[7px] text-indigo-300 transition-colors hover:bg-indigo-900">
          {displayMode === 'keyboard' ? <Music2 className="h-3 w-3" /> : <Keyboard className="h-3 w-3" />}
          {displayMode === 'keyboard' ? '\u4e94\u7dda\u8b5c\u6a21\u5f0f' : '\u9375\u76e4\u53ef\u8996\u5316'}
        </button>
        <div className="text-[6px] md:text-[7px] font-mono text-slate-500 mb-2 flex flex-wrap items-center justify-between w-full gap-1" title="下方為鋼琴鍵盤可視化">
          <span>鍵盤可視化</span>
          <span className="bg-indigo-950 px-1 py-0.5 rounded text-indigo-400 border border-indigo-900 text-[5px] md:text-[6px]" title="顯示範圍">MIDI C3 - C5</span>
        </div>

        <div className={`${displayMode === 'keyboard' ? 'flex' : 'hidden'} relative overflow-visible w-full items-center justify-center mt-1`}>
          <svg 
            width="100%" 
            viewBox={`0 0 ${totalWidth} 120`}
            preserveAspectRatio="xMidYMid meet"
            className="select-none overflow-visible h-auto max-h-[120px] min-h-[40px]"
            style={{ 
              filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' 
            }}
          >
            {/* White Keys */}
            {WHITE_KEYS.map((key) => {
              const active = isNoteActive(key.midi);
              return (
                <rect
                  key={key.midi}
                  x={key.idx * keyWidth}
                  y={0}
                  width={keyWidth - 1}
                  height={120}
                  rx={3}
                  className={`transition-all duration-150 cursor-default stroke-indigo-950 stroke-1 ${
                    active 
                      ? getHighlightColor() 
                      : 'fill-slate-200'
                  }`}
                />
              );
            })}

            {/* Black Keys */}
            {BLACK_KEYS.map((key) => {
              const active = isNoteActive(key.midi);
              return (
                <rect
                  key={key.midi}
                  x={key.x}
                  y={0}
                  width={14}
                  height={75}
                  rx={2}
                  className={`transition-all duration-150 cursor-default stroke-indigo-950 stroke-1 ${
                    active 
                      ? getHighlightColor() 
                      : 'fill-slate-800'
                  }`}
                />
              );
            })}
          </svg>
        </div>
        {displayMode === 'staff' && (
          <div className="flex h-[120px] w-full items-center justify-center rounded-md border border-indigo-900/40 bg-slate-950/40 px-1">
            <svg viewBox="0 0 390 150" className="h-full w-full" role="img" aria-label="Treble staff chord notes">
              {[45, 60, 75, 90, 105].map(y => <line key={y} x1="56" x2="372" y1={y} y2={y} stroke="currentColor" strokeWidth="1.5" className="text-slate-500" />)}
              <text x="62" y="105" fill="currentColor" className="text-slate-200" fontSize="82" fontFamily="serif">{'\uD834\uDD1E'}</text>
              {staffNotes.map((midi, index) => {
                const y = 135 - staffPosition(midi) * 7.5;
                const x = 166 + index * 62;
                const sharp = [1, 3, 6, 8, 10].includes(midi % 12);
                const ledgerLines = y > 105 ? Array.from({ length: Math.floor((y - 105) / 15) + 1 }, (_, i) => 120 + i * 15) : y < 45 ? Array.from({ length: Math.floor((45 - y) / 15) + 1 }, (_, i) => 30 - i * 15) : [];
                return <g key={midi} className={getHighlightColor()}>
                  {ledgerLines.map(lineY => <line key={lineY} x1={x - 14} x2={x + 14} y1={lineY} y2={lineY} stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />)}
                  {sharp && <text x={x - 22} y={y + 6} fill="currentColor" className="text-slate-200" fontSize="20">{'\u266F'}</text>}
                  <ellipse cx={x} cy={y} rx="10" ry="7" fill="currentColor" transform={`rotate(-20 ${x} ${y})`} />
                </g>;
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
