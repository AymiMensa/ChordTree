import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Settings2, X, Music, Piano } from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';
import { QUIZ_CHORDS, getChordMidiNotes, getChordDetails, getChordSpelling } from '../chordsData';
import { PianoVisualizer } from './PianoVisualizer';

export function PopQuiz({ onClose }: { onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(60);
  const [showPiano, setShowPiano] = useState(false);
  
  // history to keep track of chords
  const [chordHistory, setChordHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const engineRef = useRef<AudioEngine | null>(null);

  // Initialize chord sequence on start
  useEffect(() => {
    // Generate initial 3 chords
    const initial = [
      QUIZ_CHORDS[Math.floor(Math.random() * QUIZ_CHORDS.length)],
      QUIZ_CHORDS[Math.floor(Math.random() * QUIZ_CHORDS.length)],
      QUIZ_CHORDS[Math.floor(Math.random() * QUIZ_CHORDS.length)],
    ];
    setChordHistory(initial);
    setCurrentIndex(1); // the middle one is current
  }, []);

  const handleScheduleBeat = useCallback((beat: number) => {
    // handled internally in the AudioEngine constructor
    return null; 
  }, []);

  // We need to keep a mutable reference to the sequence for the audio engine
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
            // advance
            stateRef.current.index++;
            if (stateRef.current.index >= stateRef.current.history.length - 1) {
              const newChord = QUIZ_CHORDS[Math.floor(Math.random() * QUIZ_CHORDS.length)];
              stateRef.current.history.push(newChord);
              // also update React state so UI follows
              setTimeout(() => {
                setChordHistory(prev => [...prev, newChord]);
              }, 0);
            }
            setTimeout(() => {
              setCurrentIndex(stateRef.current.index);
            }, 0);
          }
          
          const chord = stateRef.current.history[stateRef.current.index];
          return getChordSpelling(chord);
        },
        (beat) => {
          // Play beat callback for visual sync if needed
        }
      );
    }
    
    engineRef.current.setParams({
      bpm,
      metronomeVolume: 0.8,
      synthVolume: 0.6,
      soundMode: "pad",
      synthStyle: "epiano",
    });

    return () => {
      engineRef.current?.stop();
    };
  }, [bpm]);

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

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-2 sm:p-4 bg-indigo-950/40 border-b border-indigo-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-500/20">
            <Music className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl md:text-2xl [@media(max-height:500px)]:text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
              和弦隨堂考試
            </h1>
            <p className="text-[9px] sm:text-xs [@media(max-height:500px)]:text-[8px] text-indigo-300/70 font-medium tracking-widest uppercase">
              CHORD PROGRESSION QUIZ
            </p>
          </div>
        </div>
        </div>
        <button 
          title="關閉隨堂考試"
          onClick={() => {
            engineRef.current?.stop();
            onClose();
          }}
          className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 hover:text-white" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 min-h-0 overflow-hidden">
        
        {/* Chord Flow Display */}
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-6 md:gap-12 w-full max-w-5xl flex-1 min-h-0">
          
          {/* Previous Chord */}
          <div className="flex-1 flex justify-end opacity-40 scale-75 md:scale-90 transition-all duration-300 blur-[1px]">
            {prevChord && (
              <div className={`font-bold text-slate-500 whitespace-nowrap transition-all duration-300 ${showPiano ? 'text-xl sm:text-2xl md:text-4xl [@media(max-height:500px)]:text-sm' : 'text-2xl sm:text-4xl md:text-6xl [@media(max-height:500px)]:text-xl'}`}>
                {prevChord}
              </div>
            )}
          </div>

          {/* Current Chord */}
          <div className="flex-none flex flex-col items-center justify-center min-w-[100px] sm:min-w-[150px] md:min-w-[250px] shrink-0">
            <div className={`font-black transition-all duration-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]
                ${showPiano ? 'text-4xl sm:text-5xl md:text-7xl [@media(max-height:500px)]:text-3xl' : 'text-5xl sm:text-7xl md:text-[9rem] lg:text-[10rem] [@media(max-height:500px)]:text-5xl'}
                ${isPlaying ? 'text-white scale-110' : 'text-slate-200'}`}>
              {currentChord}
            </div>
            <div className={`mt-1 px-2 sm:px-4 py-0.5 sm:py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 font-bold tracking-widest whitespace-nowrap transition-all duration-300 ${showPiano ? 'text-[9px] sm:text-xs [@media(max-height:500px)]:text-[8px] [@media(max-height:500px)]:mt-0' : 'text-[10px] sm:text-sm md:text-base md:mt-4 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:mt-1'}`}>
              目前和弦
            </div>
          </div>

          {/* Next Chord */}
          <div className="flex-1 flex justify-start opacity-80 scale-90 md:scale-100 transition-all duration-300">
            {nextChord && (
              <div className={`font-bold text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)] whitespace-nowrap transition-all duration-300 ${showPiano ? 'text-xl sm:text-3xl md:text-5xl [@media(max-height:500px)]:text-lg' : 'text-3xl sm:text-5xl md:text-7xl [@media(max-height:500px)]:text-2xl'}`}>
                {nextChord}
              </div>
            )}
          </div>

        </div>

        {/* Controls */}
        <div className={`flex flex-col items-center bg-slate-900/60 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl w-full max-w-xl shrink-0 transition-all duration-300 
           ${showPiano ? 'mt-1 p-2 sm:p-4 gap-1 sm:gap-4 [@media(max-height:500px)]:p-1.5 [@media(max-height:500px)]:gap-1' : 'mt-4 md:mt-12 p-4 md:p-8 gap-4 md:gap-8 [@media(max-height:500px)]:mt-2 [@media(max-height:500px)]:p-2 [@media(max-height:500px)]:gap-2'}`}>
          
          {/* Play/Pause Button */}
          <button
            title={isPlaying ? "暫停考試" : "開始考試"}
            onClick={togglePlay}
            className={`flex items-center justify-center w-full sm:w-auto rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl
              ${showPiano ? 'px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base gap-1.5 [@media(max-height:500px)]:py-1.5 [@media(max-height:500px)]:text-xs' : 'px-6 sm:px-12 py-3 sm:py-4 text-base sm:text-xl gap-2 sm:gap-3 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm'}
              ${isPlaying 
                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/30' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30'}`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
                暫停考試
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
                開始考試
              </>
            )}
          </button>

          {/* BPM Slider */}
          <div className="w-full flex items-center gap-2 sm:gap-4 px-2 sm:px-4" title="調整節拍器速度">
            <span className="text-slate-400 font-mono font-bold text-xs sm:text-base w-8 sm:w-12 text-right">BPM</span>
            <input
              type="range"
              min="40"
              max="168"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="flex-1 h-1.5 sm:h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-white font-mono font-bold text-xs sm:text-base w-8 sm:w-12">{bpm}</span>
          </div>

          <button
            title={showPiano ? "隱藏下方鋼琴鍵盤提示" : "顯示下方鋼琴鍵盤提示"}
            onClick={() => setShowPiano(!showPiano)}
            className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-indigo-300 hover:text-white transition-colors mt-1 sm:mt-2 [@media(max-height:500px)]:mt-0"
          >
            <Piano className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {showPiano ? "隱藏鋼琴提示" : "顯示鋼琴提示"}
          </button>

        </div>
      </div>

      {/* Piano Hint Footer */}
      <div className={`transition-all duration-500 ease-in-out border-t border-indigo-900/50 bg-slate-950 ${showPiano ? 'translate-y-0 opacity-100 mb-0' : 'translate-y-full opacity-0 absolute bottom-0 left-0 right-0 h-0 overflow-hidden'}`}>
        <div className="p-2 sm:p-4 [@media(max-height:500px)]:p-1 max-w-5xl mx-auto">
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
