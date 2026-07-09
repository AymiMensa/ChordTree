import React from "react";
import {
  Play,
  Square,
  Volume2,
  Music,
  Sparkles,
  RefreshCw,
  Shuffle,
  ChevronDown,
  ChevronDown,
  ChevronUp,
  Info,
  X
} from "lucide-react";
import { PlaybackState, ProgressionStep, GrooveType } from "../types";

interface MetronomeControlsProps {
  playbackState: PlaybackState;
  onTogglePlay: () => void;
  onToggleRepeat: () => void;
  onGenerateNewPath: () => void;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (type: "synth" | "metronome", value: number) => void;
  onSoundModeChange: (mode: "pad" | "arpeggio" | "silent") => void;
  onSynthStyleChange: (style: "epiano" | "pad" | "strings") => void;
  onGrooveChange?: (groove: GrooveType) => void;
  activeChordLabel: string;
  activeChordNotes: string[];
  activeChordFormula?: string;
  activeChordFullName?: string;
  onPlayChordDirectly?: () => void;
  currentStep: ProgressionStep | null;
}

export const MetronomeControls: React.FC<MetronomeControlsProps> = ({
  playbackState,
  onTogglePlay,
  onToggleRepeat,
  onGenerateNewPath,
  onBpmChange,
  onVolumeChange,
  onSoundModeChange,
  onSynthStyleChange,
  onGrooveChange,
  activeChordLabel,
  activeChordNotes,
  activeChordFormula,
  activeChordFullName,
  onPlayChordDirectly,
  currentStep,
}) => {
  const [isPlaybackExpanded, setIsPlaybackExpanded] = React.useState(true);
  const [isMixerExpanded, setIsMixerExpanded] = React.useState(false);
  const [isGrooveModalOpen, setIsGrooveModalOpen] = React.useState(false);
  
  const {
    isPlaying,
    isRepeat,
    bpm,
    currentBeat,
    soundMode,
    synthStyle,
    synthVolume,
    metronomeVolume,
  } = playbackState;

  const isTransition = currentStep?.type === "transition";

  return (
    <div className="w-full bg-[#03001e]/80 backdrop-blur-xl border border-indigo-950/50 rounded-2xl p-2 sm:p-3 md:p-4 flex flex-col gap-2 md:gap-3 shadow-2xl">
      {/* 1. Playback & Tempo Accordion */}
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => setIsPlaybackExpanded(!isPlaybackExpanded)}
          className="flex items-center justify-between bg-indigo-950/30 border border-indigo-900/40 rounded-xl p-2 md:p-3 hover:bg-indigo-900/30 transition-colors shadow-inner w-full"
          title={isPlaybackExpanded ? "收合播放與節拍控制" : "展開播放與節拍控制"}
        >
          <span className="text-[11px] md:text-xs font-mono tracking-wider text-slate-300 font-semibold flex items-center gap-1">
            <Play className="w-3 h-3" />
            播放與節拍控制 (Playback & Tempo)
          </span>
          {isPlaybackExpanded ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
        </button>

        {isPlaybackExpanded && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Playback Status & Main Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-950/40 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onTogglePlay}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform active:scale-95 cursor-pointer select-none shadow-lg ${
                    isPlaying
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 glow-button"
                  }`}
                  title={isPlaying ? "停止播放" : "開始播放"}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>停止</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>開始</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onToggleRepeat}
                  className={`flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform active:scale-95 cursor-pointer select-none shadow-lg ${
                    isRepeat
                      ? "bg-indigo-500 text-white shadow-indigo-500/30 border border-indigo-400/50"
                      : "bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-900/30"
                  }`}
                  title={isRepeat ? "關閉重複播放" : "開啟重複播放"}
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isRepeat ? "animate-spin-slow" : ""}`}
                  />
                  <span className="hidden sm:inline">重複</span>
                </button>

                <button
                  onClick={onGenerateNewPath}
                  className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all duration-300 transform active:scale-95 cursor-pointer select-none shadow-lg"
                  title="生成新的隨機路徑"
                >
                  <Shuffle className="w-3 h-3" />
                  <span className="hidden sm:inline">新路徑</span>
                </button>

                {/* Quick BPM Tweak Buttons */}
                <div className="flex items-center gap-1 bg-indigo-950/40 p-0.5 rounded-lg border border-indigo-900/30">
                  <button
                    onClick={() => onBpmChange(Math.max(40, bpm - 1))}
                    className="px-1.5 py-0.5 text-[10px] text-indigo-300 hover:text-white hover:bg-indigo-900/40 rounded transition-colors"
                    title="節拍速度減 1"
                  >
                    -1
                  </button>
                  <span className="text-[10px] font-mono px-1 text-indigo-400">
                    微調
                  </span>
                  <button
                    onClick={() => onBpmChange(Math.min(168, bpm + 1))}
                    className="px-1.5 py-0.5 text-[10px] text-indigo-300 hover:text-white hover:bg-indigo-900/40 rounded transition-colors"
                    title="節拍速度加 1"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Visual Flashing Metronome Lights (Beat Indicators) */}
              <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-xl border border-indigo-950/60 shadow-inner">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((beatNum) => {
                    const isActive = isPlaying && currentBeat === beatNum;
                    const isFirstBeat = beatNum === 1;

                    return (
                      <div
                        key={beatNum}
                        className="relative flex flex-col items-center"
                      >
                        <div
                          className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-100 ${
                            isActive
                              ? isFirstBeat
                                ? "bg-red-500 shadow-[0_0_10px_#ef4444]"
                                : "bg-green-500 shadow-[0_0_10px_#22c55e]"
                              : isFirstBeat
                                ? "bg-red-950/40 border border-red-900/50"
                                : "bg-green-950/40 border border-green-900/50"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Groove Selector */}
            <div className="flex flex-col gap-1.5 bg-black/20 p-2 rounded-xl border border-indigo-950/30">
              <div className="flex items-center justify-between text-[10px] md:text-xs">
                <span className="text-slate-400 font-medium">
                  伴奏鼓組律動 (Drum Groove)
                </span>
                <button
                  onClick={() => setIsGrooveModalOpen(true)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-colors text-[9px] sm:text-[10px]"
                  title="查看鼓組 Groove 說明"
                >
                  <Info className="w-3 h-3" />
                  Groove 說明
                </button>
              </div>
              <select
                value={playbackState.activeGroove || "None"}
                onChange={(e) => onGrooveChange && onGrooveChange(e.target.value as GrooveType)}
                className="w-full bg-indigo-950/40 border border-indigo-900/50 text-indigo-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="None">傳統節拍器 (無鼓點)</option>
                <optgroup label="Four-on-the-floor (四拍直踏)">
                  <option value="Disco">Disco</option>
                  <option value="EDM">EDM</option>
                  <option value="Pop">Pop</option>
                  <option value="Trance">Trance</option>
                </optgroup>
                <optgroup label="Backbeat Groove (後拍律動)">
                  <option value="Rock">Rock</option>
                  <option value="R&B">R&B</option>
                  <option value="Ballad">Ballad</option>
                  <option value="Folk">Folk</option>
                  <option value="Soul">Soul</option>
                  <option value="Slow Soul">Slow Soul</option>
                  <option value="Heavy Metal">Heavy Metal</option>
                  <option value="Country">Country</option>
                  <option value="Pop Ballad">Pop Ballad</option>
                  <option value="Classic Rock">Classic Rock</option>
                </optgroup>
                <optgroup label="Shuffle / Swung (搖擺律動)">
                  <option value="Swing">Swing</option>
                  <option value="Blues">Blues</option>
                  <option value="Shuffle Rock">Shuffle Rock</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Soft Swing">Soft Swing</option>
                  <option value="Jazz Ballad">Jazz Ballad</option>
                </optgroup>
                <optgroup label="Syncopated (切分音 / 放克律動)">
                  <option value="Funk">Funk</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Neo-Soul">Neo-Soul</option>
                  <option value="Drum & Bass">Drum & Bass</option>
                </optgroup>
                <optgroup label="Polyrhythm (複節奏 / 拉丁律動)">
                  <option value="Salsa">Salsa</option>
                  <option value="Bossa Nova">Bossa Nova</option>
                  <option value="Samba">Samba</option>
                  <option value="Rumba">Rumba</option>
                  <option value="Cha-Cha">Cha-Cha</option>
                  <option value="Afrobeat">Afrobeat</option>
                  <option value="Mambo">Mambo</option>
                </optgroup>
              </select>
            </div>

            {/* BPM Slider */}
            <div className="flex flex-col gap-1.5 bg-black/20 p-2 rounded-xl border border-indigo-950/30">
              <div className="flex items-center justify-between text-[10px] md:text-xs">
                <span className="text-slate-400 font-medium">
                  節拍速度
                </span>
                <span className="text-sm font-bold font-mono text-indigo-400">
                  {bpm} <span className="text-[9px] text-indigo-500">BPM</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-indigo-600">40</span>
                <input
                  type="range"
                  min="40"
                  max="168"
                  value={bpm}
                  onChange={(e) => onBpmChange(Number(e.target.value))}
                  className="flex-1 accent-indigo-500 h-1 bg-indigo-950 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[9px] font-mono text-indigo-600">168</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Sound & Mixer Accordion */}
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => setIsMixerExpanded(!isMixerExpanded)}
          className="flex items-center justify-between bg-indigo-950/30 border border-indigo-900/40 rounded-xl p-2 md:p-3 hover:bg-indigo-900/30 transition-colors shadow-inner w-full"
          title={isMixerExpanded ? "收合音色與音量設定" : "展開音色與音量設定"}
        >
          <span className="text-[11px] md:text-xs font-mono tracking-wider text-slate-300 font-semibold flex items-center gap-1">
            <Volume2 className="w-3 h-3" />
            音色與音量設定 (Sound & Mixer)
          </span>
          {isMixerExpanded ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
        </button>

        {isMixerExpanded && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Volume controls */}
            <div className="flex flex-col gap-1.5 bg-black/20 p-2 rounded-xl border border-indigo-950/30">
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                {/* Metronome Vol */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span>節拍器</span>
                    <span>{Math.round(metronomeVolume * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3 text-indigo-400 shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={metronomeVolume}
                      onChange={(e) =>
                        onVolumeChange("metronome", Number(e.target.value))
                      }
                      className="w-full accent-emerald-500 h-1 bg-indigo-950 rounded appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Synth Vol */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span>和弦音量</span>
                    <span>{Math.round(synthVolume * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Music className="w-3 h-3 text-indigo-400 shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={synthVolume}
                      onChange={(e) =>
                        onVolumeChange("synth", Number(e.target.value))
                      }
                      className="w-full accent-cyan-500 h-1 bg-indigo-950 rounded appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chord Synthesizer Sound Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5 md:gap-2">
              {[
                {
                  id: "pad",
                  label: "和弦齊奏",
                },
                {
                  id: "arpeggio",
                  label: "琶音",
                },
                { id: "silent", label: "靜音" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onSoundModeChange(mode.id as any)}
                  className={`flex flex-col items-center justify-center p-1.5 md:p-2 rounded-xl border text-center transition-all duration-200 cursor-pointer select-none w-full ${
                    soundMode === mode.id
                      ? "bg-indigo-500/15 border-indigo-500/80 text-white shadow-md shadow-indigo-500/5"
                      : "bg-indigo-950/20 border-indigo-950/40 text-slate-400 hover:bg-indigo-950/30 hover:border-indigo-900"
                  }`}
                  title={`切換至 ${mode.label} 模式`}
                >
                  <span className="text-[10px] md:text-xs font-semibold">
                    {mode.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Synth Style Selector */}
            <div className="grid grid-cols-3 gap-1.5 md:gap-2">
              {[
                { id: "epiano", label: "電鋼琴" },
                { id: "pad", label: "合成器 Pad" },
                { id: "strings", label: "柔和 Strings" },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => onSynthStyleChange(style.id as any)}
                  className={`flex flex-col items-center justify-center p-1 md:p-1.5 rounded-lg border text-center transition-all duration-200 cursor-pointer select-none w-full ${
                    synthStyle === style.id
                      ? "bg-purple-500/15 border-purple-500/80 text-white shadow-md shadow-purple-500/5"
                      : "bg-indigo-950/10 border-indigo-950/30 text-slate-500 hover:bg-indigo-950/20 hover:border-indigo-900/50"
                  }`}
                  title={`切換音色至 ${style.label}`}
                >
                  <span className="text-[9px] md:text-[10px] font-semibold">
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Groove Info Modal */}
      {isGrooveModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsGrooveModalOpen(false)}>
          <div 
            className="w-full max-w-lg bg-[#060a1f] border border-indigo-500/30 rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.15)] flex flex-col max-h-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-indigo-900/50">
              <h3 className="text-indigo-200 font-bold text-base sm:text-lg flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-400" />
                鼓點律動分類說明 (Groove Types)
              </h3>
              <button 
                onClick={() => setIsGrooveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white bg-indigo-950/50 hover:bg-indigo-900 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4 text-xs sm:text-sm text-slate-300">
              <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-900/30">
                <h4 className="text-sky-400 font-bold mb-1">Four-on-the-floor (四拍直踏)</h4>
                <p><span className="text-slate-400">特色：</span>大鼓穩穩踩在每小節的第 1, 2, 3, 4 拍，節奏極具推進感。</p>
                <p><span className="text-slate-400">適用：</span>Disco、EDM、流行舞曲。</p>
              </div>

              <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-900/30">
                <h4 className="text-sky-400 font-bold mb-1">Backbeat Groove (後拍律動)</h4>
                <p><span className="text-slate-400">特色：</span>小鼓打在第 2、4 拍（重拍），是多數流行與搖滾樂的基底。</p>
                <p><span className="text-slate-400">適用：</span>Rock、Pop、R&B。</p>
              </div>

              <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-900/30">
                <h4 className="text-sky-400 font-bold mb-1">Shuffle / Swung (搖擺律動)</h4>
                <p><span className="text-slate-400">特色：</span>將拍子劃分為三連音，產生「彈跳感」（強-弱-強-弱），給人要晃不晃的慵懶感。</p>
                <p><span className="text-slate-400">適用：</span>Blues、Jazz、Shuffle Rock。</p>
              </div>

              <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-900/30">
                <h4 className="text-sky-400 font-bold mb-1">Syncopated (切分音 / 放克律動)</h4>
                <p><span className="text-slate-400">特色：</span>強拍落在弱拍或微小細分音上（如 16 分音符），強調律動與黏稠感。</p>
                <p><span className="text-slate-400">適用：</span>Funk、Hip-Hop、Neo-Soul。</p>
              </div>

              <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-900/30">
                <h4 className="text-sky-400 font-bold mb-1">Polyrhythm (複節奏 / 拉丁律動)</h4>
                <p><span className="text-slate-400">特色：</span>不同樂器打出互不干擾但完美咬合的節奏（如 3 對 2 的跨拍），展現立體感。</p>
                <p><span className="text-slate-400">適用：</span>Salsa、Bossa Nova、Afrobeat。</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
