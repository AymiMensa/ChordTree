import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, X, Music, Piano } from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';
import { GrooveType } from '../types';
import { QUIZ_CHORDS, getChordMidiNotes, getChordDetails, getChordSpelling } from '../chordsData';
import { PianoVisualizer } from './PianoVisualizer';
import { Tooltip } from './TooltipProvider';

export function PopQuiz({ onClose }: { onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(60);
  const [activeGroove, setActiveGroove] = useState<GrooveType>("None");
  const [showPiano, setShowPiano] = useState(false);
  
  // history to keep track of chords
  const [chordHistory, setChordHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const engineRef = useRef<AudioEngine | null>(null);

  // Initialize chord sequence on start
  useEffect(() => {
    const initial = [
      QUIZ_CHORDS[Math.floor(Math.random() * QUIZ_CHORDS.length)],
      QUIZ_CHORDS[Math.floor(Math.random() * QUIZ_CHORDS.length)],
      QUIZ_CHORDS[Math.floor(Math.random() * QUIZ_CHORDS.length)],
    ];
    setChordHistory(initial);
    setCurrentIndex(1); // the middle one is current
  }, []);

  const stateRef = useRef({
    history: chordHistory,
    index: currentIndex,
    isPlaying
  });

  useEffect(() => {
    stateRef.current = { history: chordHistory, index: currentIndex, isPlaying };
  }, [chordHistory, currentIndex, isPlaying]);

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new AudioEngine(
        (beat) => {
          if (!stateRef.current.isPlaying) return null;
          if (beat === 1) {
            stateRef.current.index++;
            if (stateRef.current.index >= stateRef.current.history.length - 1) {
              const newChord = QUIZ_CHORDS[Math.floor(Math.random() * QUIZ_CHORDS.length)];
              stateRef.current.history.push(newChord);
              setTimeout(() => setChordHistory(prev => [...prev, newChord]), 0);
            }
            setTimeout(() => setCurrentIndex(stateRef.current.index), 0);
          }
          const chord = stateRef.current.history[stateRef.current.index];
          return getChordSpelling(chord);
        },
        (beat) => {}
      );
    }
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setParams({
        bpm,
        activeGroove,
        metronomeVolume: 0.8,
        synthVolume: 0.6,
        soundMode: "pad",
        synthStyle: "epiano",
      });
    }
  }, [bpm, activeGroove]);

  const togglePlay = () => {
    if (isPlaying) {
      engineRef.current?.stop();
      setIsPlaying(false);
    } else {
      engineRef.current?.start();
      setIsPlaying(true);
    }
  };

  const currentChord = chordHistory[currentIndex] || "C";
  const prevChord = currentIndex > 0 ? chordHistory[currentIndex - 1] : "";
  const nextChord = chordHistory[currentIndex + 1] || "";
  
  const currentDetails = getChordDetails(currentChord);
  const currentNotes = getChordSpelling(currentChord);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,27,75,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,27,75,0.2)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header - Made transparent and absolute to save space on landscape */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2 sm:p-4 bg-transparent pointer-events-none">
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <div className="p-1 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-500/20 max-lg:landscape:scale-50 landscape:scale-75 landscape:opacity-80 origin-left">
            <Music className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="max-lg:landscape:scale-50 landscape:scale-75 landscape:opacity-80 origin-left">
            <h1 className="text-[7px] sm:text-[11px] md:text-[12px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
              和弦隨堂考試
            </h1>
            <p className="text-[4px] sm:text-[6px] text-indigo-300/70 font-medium tracking-widest uppercase mt-0.5">
              CHORD PROGRESSION QUIZ
            </p>
          </div>
        </div>
        <Tooltip content="關閉隨堂考試">
          <button 
            onClick={() => {
              engineRef.current?.stop();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors pointer-events-auto max-lg:landscape:scale-50 landscape:scale-75 origin-right"
          >
            <X className="w-4 h-4 sm:w-6 sm:h-6 text-slate-400 hover:text-white" />
          </button>
        </Tooltip>
      </div>

      {/* Main Content Area */}
      <div className={`relative z-10 flex-1 flex flex-col landscape:flex-row items-center justify-center p-1 sm:p-2 min-h-0 overflow-hidden pt-2 sm:pt-6 landscape:pt-0`}>
        
        {/* Chord Flow Display */}
        <div className={`flex flex-row items-center justify-center gap-2 sm:gap-6 md:gap-12 w-full max-w-5xl flex-1 min-h-0 max-lg:landscape:pr-12 landscape:pr-32`}>
          
          {/* Previous Chord */}
          <div className="flex-1 flex justify-end opacity-40 scale-75 md:scale-90 transition-all duration-300 blur-[1px]">
            {prevChord && (
              <div className={`font-bold text-slate-500 whitespace-nowrap transition-all duration-300 ${showPiano ? 'text-xl sm:text-2xl md:text-4xl max-lg:landscape:text-[10px] landscape:text-xl' : 'text-2xl sm:text-4xl md:text-6xl max-lg:landscape:text-sm landscape:text-2xl'}`}>
                {prevChord}
              </div>
            )}
          </div>

          {/* Current Chord */}
          <div className="flex-none flex flex-col items-center justify-center min-w-[100px] sm:min-w-[150px] md:min-w-[250px] shrink-0">
            <div className={`font-black transition-all duration-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]
                ${showPiano ? 'text-4xl sm:text-5xl md:text-7xl max-lg:landscape:text-2xl landscape:text-5xl' : 'text-5xl sm:text-7xl md:text-[9rem] lg:text-[10rem] max-lg:landscape:text-4xl landscape:text-7xl'}
                ${isPlaying ? 'text-white scale-110' : 'text-slate-200'}`}>
              {currentChord}
            </div>
            <div className={`mt-1 px-2 sm:px-4 py-0.5 sm:py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 font-bold tracking-widest whitespace-nowrap transition-all duration-300 ${showPiano ? 'text-[5px] sm:text-[6px] max-lg:landscape:text-[4px] landscape:text-[6px] max-lg:landscape:px-1 max-lg:landscape:py-0' : 'text-[6px] sm:text-[8px] md:text-[10px] md:mt-4 max-lg:landscape:text-[5px] landscape:text-[8px] max-lg:landscape:mt-0.5 landscape:mt-1'}`}>
              目前和弦
            </div>
          </div>

          {/* Next Chord */}
          <div className="flex-1 flex justify-start opacity-80 scale-90 md:scale-100 transition-all duration-300">
            {nextChord && (
              <div className={`font-bold text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)] whitespace-nowrap transition-all duration-300 ${showPiano ? 'text-xl sm:text-3xl md:text-5xl max-lg:landscape:text-[10px] landscape:text-xl' : 'text-3xl sm:text-5xl md:text-7xl max-lg:landscape:text-sm landscape:text-2xl'}`}>
                {nextChord}
              </div>
            )}
          </div>

        </div>

        {/* Controls - Moved to right side on landscape */}
        <div className={`flex flex-col items-center bg-slate-900/60 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl w-full max-w-xl shrink-0 transition-all duration-300 
           landscape:absolute landscape:right-2 md:landscape:right-6 landscape:top-2 md:landscape:top-4 landscape:w-auto landscape:min-w-[160px] landscape:z-20 max-lg:landscape:scale-100 max-lg:landscape:origin-top-right landscape:scale-100 landscape:origin-top-right
           max-lg:landscape:bottom-2 max-lg:landscape:justify-between max-lg:landscape:min-w-[120px]
           lg:landscape:bottom-4 lg:landscape:justify-between 
           xl:landscape:bottom-auto xl:landscape:justify-start xl:landscape:min-w-[160px]
           ${showPiano ? 'mt-0 p-1.5 sm:p-2 gap-1 max-lg:landscape:p-1 max-lg:landscape:gap-1 lg:landscape:p-3 lg:landscape:gap-3 xl:landscape:p-1.5 xl:landscape:gap-1.5' : 'mt-2 md:mt-6 p-2 md:p-3 gap-1.5 md:gap-3 max-lg:landscape:p-2 max-lg:landscape:gap-1.5 lg:landscape:p-4 lg:landscape:gap-4 xl:landscape:p-2.5 xl:landscape:gap-2.5'}`}>
          
          {/* Play/Pause Button */}
          <Tooltip content={isPlaying ? "暫停考試" : "開始考試"}>
            <button
              onClick={togglePlay}
              className={`flex items-center justify-center w-full sm:w-auto rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl
                ${showPiano ? 'px-3 sm:px-4 py-1 sm:py-1.5 text-[8px] sm:text-[10px] gap-1 max-lg:landscape:px-2 max-lg:landscape:py-1 max-lg:landscape:text-[8px] lg:landscape:px-6 lg:landscape:py-3 lg:landscape:text-[16px] xl:landscape:px-5 xl:landscape:py-2 xl:landscape:text-[14px]' : 'px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-[12px] gap-1.5 max-lg:landscape:px-3 max-lg:landscape:py-1.5 max-lg:landscape:text-[10px] lg:landscape:px-8 lg:landscape:py-4 lg:landscape:text-[18px] xl:landscape:px-6 xl:landscape:py-2.5 xl:landscape:text-[16px]'}
                ${isPlaying 
                  ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/30' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30'}`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 sm:w-5 sm:h-5 max-lg:landscape:w-3 max-lg:landscape:h-3 lg:landscape:w-6 lg:landscape:h-6 xl:landscape:w-5 xl:landscape:h-5 fill-current" />
                  暫停
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 max-lg:landscape:w-3 max-lg:landscape:h-3 lg:landscape:w-6 lg:landscape:h-6 xl:landscape:w-5 xl:landscape:h-5 fill-current" />
                  開始
                </>
              )}
            </button>
          </Tooltip>

          {/* Groove Selector */}
          <div className="w-full flex items-center gap-1 sm:gap-4 px-1 sm:px-4 relative landscape:flex-col landscape:items-start landscape:gap-1 max-lg:landscape:gap-0.5">
            <span className="text-slate-400 font-bold text-[7px] sm:text-[8px] w-8 sm:w-12 text-right landscape:text-left landscape:w-auto whitespace-nowrap max-lg:landscape:text-[7px] lg:landscape:text-[14px] xl:landscape:text-[12px]">節奏</span>
            <Tooltip content="選擇伴奏鼓組律動" className="w-full">
              <select
                value={activeGroove}
                onChange={(e) => setActiveGroove(e.target.value as GrooveType)}
                className="w-full bg-indigo-950/40 border border-indigo-900/50 text-indigo-300 text-[7px] sm:text-[8px] max-lg:landscape:text-[7px] lg:landscape:text-[14px] xl:landscape:text-[12px] rounded-lg px-2 py-1 max-lg:landscape:py-0.5 lg:landscape:py-2 xl:landscape:py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="None" className="bg-slate-900 text-white">無鼓點 (None)</option>
                <optgroup label="Dance / Electronic" className="bg-slate-900 text-white font-bold">
                  <option value="Disco" className="font-normal text-indigo-200">Disco</option>
                  <option value="EDM" className="font-normal text-indigo-200">EDM</option>
                  <option value="Trance" className="font-normal text-indigo-200">Trance</option>
                </optgroup>
                <optgroup label="Rock / Pop" className="bg-slate-900 text-white font-bold">
                  <option value="Rock" className="font-normal text-indigo-200">Rock</option>
                  <option value="Classic Rock" className="font-normal text-indigo-200">Classic Rock</option>
                  <option value="Heavy Metal" className="font-normal text-indigo-200">Heavy Metal</option>
                  <option value="Pop" className="font-normal text-indigo-200">Pop</option>
                  <option value="Pop Ballad" className="font-normal text-indigo-200">Pop Ballad</option>
                </optgroup>
                <optgroup label="Jazz / Swing" className="bg-slate-900 text-white font-bold">
                  <option value="Swing" className="font-normal text-indigo-200">Swing</option>
                  <option value="Soft Swing" className="font-normal text-indigo-200">Soft Swing</option>
                  <option value="Jazz" className="font-normal text-indigo-200">Jazz</option>
                  <option value="Jazz Ballad" className="font-normal text-indigo-200">Jazz Ballad</option>
                </optgroup>
                <optgroup label="Latin / World" className="bg-slate-900 text-white font-bold">
                  <option value="Salsa" className="font-normal text-indigo-200">Salsa</option>
                  <option value="Bossa Nova" className="font-normal text-indigo-200">Bossa Nova</option>
                  <option value="Samba" className="font-normal text-indigo-200">Samba</option>
                  <option value="Rumba" className="font-normal text-indigo-200">Rumba</option>
                  <option value="Cha-Cha" className="font-normal text-indigo-200">Cha-Cha</option>
                  <option value="Mambo" className="font-normal text-indigo-200">Mambo</option>
                </optgroup>
                <optgroup label="R&B / Country" className="bg-slate-900 text-white font-bold">
                  <option value="Country" className="font-normal text-indigo-200">Country</option>
                  <option value="R&B" className="font-normal text-indigo-200">R&B</option>
                  <option value="Soul" className="font-normal text-indigo-200">Soul</option>
                  <option value="Funk" className="font-normal text-indigo-200">Funk</option>
                  <option value="Hip-Hop" className="font-normal text-indigo-200">Hip-Hop</option>
                  <option value="Rap" className="font-normal text-indigo-200">Rap</option>
                </optgroup>
              </select>
            </Tooltip>
          </div>

          {/* BPM Slider */}
          <div className="w-full flex items-center gap-1 sm:gap-4 px-1 sm:px-4 relative landscape:flex-col landscape:items-start landscape:gap-1 max-lg:landscape:gap-0.5">
            <span className="text-slate-400 font-mono font-bold text-[7px] sm:text-[8px] w-8 sm:w-12 text-right landscape:text-left landscape:w-auto max-lg:landscape:text-[7px] lg:landscape:text-[14px] xl:landscape:text-[12px]">BPM</span>
            <Tooltip content="調整節拍器速度" className="w-full flex">
              <input
                type="range"
                min="30"
                max="300"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="flex-1 h-1.5 sm:h-2 max-lg:landscape:h-1 lg:landscape:h-3 xl:landscape:h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 w-full landscape:my-1 max-lg:landscape:my-0.5 lg:landscape:my-2 xl:landscape:my-1"
              />
            </Tooltip>
            <span className="text-white font-mono font-bold text-[7px] sm:text-[8px] w-8 sm:w-12 text-left landscape:absolute landscape:right-2 landscape:top-0 max-lg:landscape:text-[7px] lg:landscape:text-[14px] xl:landscape:text-[12px]">{bpm}</span>
          </div>

          <Tooltip content={showPiano ? "隱藏下方鋼琴鍵盤提示" : "顯示下方鋼琴鍵盤提示"}>
            <button
              onClick={() => setShowPiano(!showPiano)}
              className="flex items-center justify-center gap-1 sm:gap-1.5 text-[6px] sm:text-[8px] max-lg:landscape:text-[6px] lg:landscape:text-[14px] xl:landscape:text-[12px] text-indigo-300 hover:text-white transition-colors mt-0.5 sm:mt-1 bg-indigo-900/30 px-2 py-1 max-lg:landscape:py-0.5 lg:landscape:py-2 xl:landscape:py-1.5 max-lg:landscape:mt-1 lg:landscape:mt-3 xl:landscape:mt-2 rounded w-full"
            >
              <Piano className="w-3.5 h-3.5 sm:w-4 sm:h-4 max-lg:landscape:w-3 max-lg:landscape:h-3 lg:landscape:w-6 lg:landscape:h-6 xl:landscape:w-5 xl:landscape:h-5" />
              {showPiano ? "隱藏鋼琴提示" : "顯示鋼琴提示"}
            </button>
          </Tooltip>

        </div>
      </div>

      {/* Piano Hint Footer */}
      <div className={`transition-all duration-500 ease-in-out border-t border-indigo-900/50 bg-slate-950 flex justify-center ${showPiano ? 'translate-y-0 opacity-100 mb-0' : 'translate-y-full opacity-0 absolute bottom-0 left-0 right-0 h-0 overflow-hidden'}`}>
        <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 max-lg:landscape:px-1 max-lg:landscape:py-0 landscape:px-4 landscape:py-2 scale-90 sm:scale-95 lg:scale-100 landscape:scale-100 max-lg:landscape:scale-75 max-lg:landscape:origin-bottom origin-bottom transition-transform duration-300">
          <PianoVisualizer 
             activeMidiNotes={getChordMidiNotes(currentChord)}
             chordType={null} 
             activeChordLabel={currentChord}
             activeChordNotes={currentNotes}
             activeChordFormula={currentDetails.formula}
             activeChordFullName={currentDetails.fullName}
             onPlayChordDirectly={() => {
               engineRef.current?.triggerChordDirectly(currentNotes);
             }}
          />
        </div>
      </div>
    </div>
  );
}

