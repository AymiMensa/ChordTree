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
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-indigo-900/50 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
              和弦隨堂考試
            </h1>
            <p className="text-xs text-indigo-300/70 font-medium tracking-widest uppercase">
              CHORD PROGRESSION QUIZ
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            engineRef.current?.stop();
            onClose();
          }}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-slate-400 hover:text-white" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        
        {/* Chord Flow Display */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full max-w-5xl h-full md:h-auto">
          
          {/* Previous Chord */}
          <div className="flex-1 flex justify-center md:justify-end opacity-40 md:scale-90 transition-all duration-300 blur-[1px]">
            {prevChord && (
              <div className="text-4xl md:text-6xl font-bold text-slate-500">
                {prevChord}
              </div>
            )}
          </div>

          {/* Current Chord */}
          <div className="flex-none flex flex-col items-center justify-center min-w-[200px] md:min-w-[250px] my-4 md:my-0">
            <div className={`text-7xl md:text-[10rem] font-black transition-all duration-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]
                ${isPlaying ? 'text-white scale-110' : 'text-slate-200'}`}>
              {currentChord}
            </div>
            <div className="mt-2 md:mt-4 px-4 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-sm md:text-base font-bold tracking-widest">
              目前和弦
            </div>
          </div>

          {/* Next Chord */}
          <div className="flex-1 flex justify-center md:justify-start opacity-80 md:scale-100 transition-all duration-300">
            {nextChord && (
              <div className="text-5xl md:text-7xl font-bold text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]">
                {nextChord}
              </div>
            )}
          </div>

        </div>

        {/* Controls */}
        <div className="mt-8 md:mt-24 flex flex-col items-center gap-6 md:gap-8 bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl w-full max-w-xl">
          
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`flex items-center justify-center gap-3 w-full md:w-auto px-12 py-4 rounded-full text-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl
              ${isPlaying 
                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/30' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30'}`}
          >
            {isPlaying ? (
              <>
                <Square className="w-6 h-6 fill-current" />
                暫停考試
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                開始考試
              </>
            )}
          </button>

          {/* BPM Slider */}
          <div className="w-full flex items-center gap-4 px-4">
            <span className="text-slate-400 font-mono font-bold w-12 text-right">BPM</span>
            <input
              type="range"
              min="40"
              max="168"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-white font-mono font-bold w-12">{bpm}</span>
          </div>

          <button
            onClick={() => setShowPiano(!showPiano)}
            className="flex items-center gap-2 text-sm text-indigo-300 hover:text-white transition-colors mt-2"
          >
            <Piano className="w-4 h-4" />
            {showPiano ? "隱藏鋼琴提示" : "顯示鋼琴提示"}
          </button>

        </div>
      </div>

      {/* Piano Hint Footer */}
      <div className={`transition-all duration-500 ease-in-out border-t border-indigo-900/50 bg-slate-950 ${showPiano ? 'translate-y-0 opacity-100 mb-0' : 'translate-y-full opacity-0 absolute bottom-0 left-0 right-0 h-0 overflow-hidden'}`}>
        <div className="p-4 max-w-5xl mx-auto">
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
