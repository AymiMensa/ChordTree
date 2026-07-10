import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Settings2, X, Music, Piano } from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';
import { GrooveType } from '../types';
import { QUIZ_CHORDS, getChordMidiNotes, getChordDetails, getChordSpelling } from '../chordsData';
import { PianoVisualizer } from './PianoVisualizer';

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

  // Initialize Audio Engine once
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

  // Update params whenever they change without stopping playback
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

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-2 sm:p-4 bg-indigo-950/40 border-b border-indigo-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-500/20">
            <Music className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-[9px] sm:text-[11px] md:text-[12px] [@media(max-height:600px)]:text-[8px] [@media(max-height:400px)]:text-[5px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[7px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
              和弦隨堂考試
            </h1>
            <p className="text-[5px] sm:text-[6px] [@media(max-height:600px)]:text-[4px] [@media(max-height:400px)]:text-[3px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[3px] text-indigo-300/70 font-medium tracking-widest uppercase">
              CHORD PROGRESSION QUIZ
            </p>
          </div>
        </div>
        <button 
          title="關閉隨堂考試 (Close Quiz)"
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
      <div className={`relative z-10 flex-1 flex flex-col [@media(max-height:500px)_and_(orientation:landscape)]:flex-row items-center justify-center p-1 sm:p-2 min-h-0 overflow-hidden`}>
        
        {/* Chord Flow Display */}
        <div className={`flex flex-row items-center justify-center gap-2 sm:gap-6 md:gap-12 w-full [@media(max-height:500px)_and_(orientation:landscape)]:pr-[180px] max-w-5xl flex-1 min-h-0`}>
          
          {/* Previous Chord */}
          <div className="flex-1 flex justify-end opacity-40 scale-75 md:scale-90 transition-all duration-300 blur-[1px]">
            {prevChord && (
              <div className={`font-bold text-slate-500 whitespace-nowrap transition-all duration-300 ${showPiano ? 'text-xl sm:text-2xl md:text-4xl [@media(max-height:600px)]:text-xs' : 'text-2xl sm:text-4xl md:text-6xl [@media(max-height:600px)]:text-lg'}`}>
                {prevChord}
              </div>
            )}
          </div>

          {/* Current Chord */}
          <div className="flex-none flex flex-col items-center justify-center min-w-[100px] sm:min-w-[150px] md:min-w-[250px] shrink-0">
            <div className={`font-black transition-all duration-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]
                ${showPiano ? 'text-4xl sm:text-5xl md:text-7xl [@media(max-height:500px)]:text-2xl' : 'text-5xl sm:text-7xl md:text-[9rem] lg:text-[10rem] [@media(max-height:500px)]:text-4xl'}
                ${isPlaying ? 'text-white scale-110' : 'text-slate-200'}`}>
              {currentChord}
            </div>
            <div className={`mt-1 px-2 sm:px-4 py-0.5 sm:py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 font-bold tracking-widest whitespace-nowrap transition-all duration-300 ${showPiano ? 'text-[5px] sm:text-[6px] [@media(max-height:600px)]:text-[4px] [@media(max-height:600px)]:px-1.5 [@media(max-height:600px)]:py-0' : 'text-[6px] sm:text-[8px] md:text-[10px] md:mt-4 [@media(max-height:600px)]:text-[5px] [@media(max-height:600px)]:mt-1'}`}>
              目前和弦
            </div>
          </div>

          {/* Next Chord */}
          <div className="flex-1 flex justify-start opacity-80 scale-90 md:scale-100 transition-all duration-300">
            {nextChord && (
              <div className={`font-bold text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)] whitespace-nowrap transition-all duration-300 ${showPiano ? 'text-xl sm:text-3xl md:text-5xl [@media(max-height:600px)]:text-xs' : 'text-3xl sm:text-5xl md:text-7xl [@media(max-height:600px)]:text-lg'}`}>
                {nextChord}
              </div>
            )}
          </div>

        </div>

        {/* Controls */}
        <div className={`flex flex-col items-center bg-slate-900/60 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl w-full max-w-xl shrink-0 transition-all duration-300 
           [@media(max-height:500px)_and_(orientation:landscape)]:absolute [@media(max-height:500px)_and_(orientation:landscape)]:right-4 [@media(max-height:500px)_and_(orientation:landscape)]:top-1/2 [@media(max-height:500px)_and_(orientation:landscape)]:-translate-y-1/2 [@media(max-height:500px)_and_(orientation:landscape)]:w-auto [@media(max-height:500px)_and_(orientation:landscape)]:min-w-[160px] [@media(max-height:500px)_and_(orientation:landscape)]:z-20
           ${showPiano ? 'mt-0 p-1.5 sm:p-2 gap-1 [@media(max-height:600px)]:p-1 [@media(max-height:600px)]:gap-0.5' : 'mt-2 md:mt-6 p-2 md:p-3 gap-1.5 md:gap-3 [@media(max-height:600px)]:mt-1 [@media(max-height:600px)]:p-1.5 [@media(max-height:600px)]:gap-1'}`}>
          
          {/* Play/Pause Button */}
          <button
            title={isPlaying ? "暫停考試" : "開始考試"}
            onClick={togglePlay}
            className={`flex items-center justify-center w-full sm:w-auto rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl
              ${showPiano ? 'px-3 sm:px-4 py-1 sm:py-1.5 text-[8px] sm:text-[10px] gap-1 [@media(max-height:500px)]:py-0.5 [@media(max-height:500px)]:text-[7px]' : 'px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-[12px] gap-1.5 [@media(max-height:500px)]:py-1 [@media(max-height:500px)]:text-[8px]'}
              ${isPlaying 
                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/30' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30'}`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" />
                暫停考試
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" />
                開始考試
              </>
            )}
          </button>

          {/* Groove Selector */}
          <div className="w-full flex items-center gap-2 sm:gap-4 px-2 sm:px-4 group relative" title="選擇伴奏鼓組律動 (Select Drum Groove)">
            <span className="text-slate-400 font-bold text-[7px] sm:text-[8px] w-8 sm:w-12 text-right whitespace-nowrap">節奏</span>
            <select
              title="選擇伴奏鼓組律動"
              value={activeGroove}
              onChange={(e) => setActiveGroove(e.target.value as GrooveType)}
              className="flex-1 bg-indigo-950/40 border border-indigo-900/50 text-indigo-300 text-[7px] sm:text-[8px] rounded-lg px-2 py-0.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="None">無鼓點 (None)</option>
              <optgroup label="Dance / Electronic">
                <option value="Disco">Disco</option>
                <option value="EDM">EDM</option>
                <option value="Trance">Trance</option>
              </optgroup>
              <optgroup label="Rock / Pop">
                <option value="Rock">Rock</option>
                <option value="Classic Rock">Classic Rock</option>
                <option value="Heavy Metal">Heavy Metal</option>
                <option value="Pop">Pop</option>
                <option value="Pop Ballad">Pop Ballad</option>
              </optgroup>
              <optgroup label="Jazz / Swing">
                <option value="Swing">Swing</option>
                <option value="Soft Swing">Soft Swing</option>
                <option value="Jazz">Jazz</option>
                <option value="Jazz Ballad">Jazz Ballad</option>
              </optgroup>
              <optgroup label="Latin / World">
                <option value="Salsa">Salsa</option>
                <option value="Bossa Nova">Bossa Nova</option>
                <option value="Samba">Samba</option>
                <option value="Rumba">Rumba</option>
                <option value="Cha-Cha">Cha-Cha</option>
                <option value="Mambo">Mambo</option>
              </optgroup>
              <optgroup label="R&B / Country">
                <option value="Country">Country</option>
                <option value="R&B">R&B</option>
                <option value="Soul">Soul</option>
                <option value="Funk">Funk</option>
                <option value="Hip-Hop">Hip-Hop</option>
                <option value="Rap">Rap</option>
              </optgroup>
            </select>
          </div>

          {/* BPM Slider */}
          <div className="w-full flex items-center gap-2 sm:gap-4 px-2 sm:px-4 group relative" title="調整節拍器速度 (Adjust BPM)">
            <span className="text-slate-400 font-mono font-bold text-[7px] sm:text-[8px] w-8 sm:w-12 text-right">BPM</span>
            <input
              title="調整節拍器速度"
              type="range"
              min="30"
              max="300"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="flex-1 h-1.5 sm:h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-white font-mono font-bold text-[7px] sm:text-[8px] w-8 sm:w-12">{bpm}</span>
          </div>

          <button
            title={showPiano ? "隱藏下方鋼琴鍵盤提示 (Hide Piano)" : "顯示下方鋼琴鍵盤提示 (Show Piano)"}
            onClick={() => setShowPiano(!showPiano)}
            className="flex items-center gap-1 sm:gap-1.5 text-[6px] sm:text-[8px] text-indigo-300 hover:text-white transition-colors mt-0.5 sm:mt-1 [@media(max-height:600px)]:mt-0 [@media(max-height:600px)]:text-[5px]"
          >
            <Piano className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {showPiano ? "隱藏鋼琴提示" : "顯示鋼琴提示"}
          </button>

        </div>
      </div>

      {/* Piano Hint Footer */}
      <div className={`transition-all duration-500 ease-in-out border-t border-indigo-900/50 bg-slate-950 ${showPiano ? 'translate-y-0 opacity-100 mb-0' : 'translate-y-full opacity-0 absolute bottom-0 left-0 right-0 h-0 overflow-hidden'}`}>
        <div className="p-2 sm:p-4 [@media(max-height:600px)]:p-0 max-w-5xl mx-auto scale-90 sm:scale-100 [@media(max-height:600px)]:scale-[0.85] origin-bottom">
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
