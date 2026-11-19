import React, { useState, useMemo } from "react";
import { Play, Square, Music, Sparkles, BookOpen, Layers, Award, ChevronDown, ChevronUp, Table, Info } from "lucide-react";
import { 
  ALL_SCALES, 
  ROOT_NOTES, 
  TRADITIONAL_CHINESE_7_TABLE, 
  getScaleNotes, 
  ScaleDefinition, 
  ScaleCategory, 
  ScaleDifficulty 
} from "../utils/scaleData";
import { Tooltip } from "./TooltipProvider";

export interface ScalePlayItem {
  note: string;
  semitone: number;
  root: string;
}

interface ScaleExplorerProps {
  onPlayScaleNotes?: (notes: string[], mode?: "up" | "down" | "updown" | "chord") => void;
  onPlayScale?: (items: ScalePlayItem[], mode: "up" | "down" | "updown" | "chord", chordNotes?: string[]) => void;
  onPlaySingleNote?: (root: string, semitone: number, note: string) => void;
  onStopScale?: () => void;
  onSelectScaleForPiano?: (notes: string[], scaleName: string) => void;
  activeScaleNotePlaying?: string | null;
  activePlayingNote?: string | null;
}

export const ScaleExplorer: React.FC<ScaleExplorerProps> = ({
  onPlayScaleNotes,
  onPlayScale,
  onPlaySingleNote,
  onStopScale,
  onSelectScaleForPiano,
  activeScaleNotePlaying,
  activePlayingNote
}) => {
  const currentActivePlayingNote = activeScaleNotePlaying || activePlayingNote;
  const [selectedRoot, setSelectedRoot] = useState<string>("C");
  const [selectedScaleId, setSelectedScaleId] = useState<string>("gong-pentatonic");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | ScaleDifficulty>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ScaleCategory>("all");
  const [showChinese7Table, setShowChinese7Table] = useState<boolean>(true);
  const [isPlayingScale, setIsPlayingScale] = useState<boolean>(false);

  // Filtered scales
  const filteredScales = useMemo(() => {
    return ALL_SCALES.filter((scale) => {
      const matchDiff = difficultyFilter === "all" || scale.difficulty === difficultyFilter;
      const matchCat = categoryFilter === "all" || scale.category === categoryFilter;
      return matchDiff && matchCat;
    });
  }, [difficultyFilter, categoryFilter]);

  // Currently selected scale definition
  const currentScale = useMemo(() => {
    return ALL_SCALES.find((s) => s.id === selectedScaleId) || ALL_SCALES[0];
  }, [selectedScaleId]);

  // Computed scale notes based on selected root
  const currentScaleNotes = useMemo(() => {
    return getScaleNotes(selectedRoot, currentScale.semitones);
  }, [selectedRoot, currentScale]);

  // Handle play modes
  const handlePlay = (mode: "up" | "down" | "updown" | "chord") => {
    setIsPlayingScale(true);

    const semitones = currentScale.semitones;
    const notes = currentScaleNotes;

    // 構建帶半音音高的完整階梯
    const scaleItems: ScalePlayItem[] = semitones.map((st, idx) => ({
      note: notes[idx],
      semitone: st,
      root: selectedRoot
    }));

    // 高八度根音 (semitone = 12)
    const octaveRootItem: ScalePlayItem = {
      note: selectedRoot,
      semitone: 12,
      root: selectedRoot
    };

    let sequenceItems: ScalePlayItem[] = [];

    if (mode === "up") {
      sequenceItems = [...scaleItems, octaveRootItem];
    } else if (mode === "down") {
      sequenceItems = [octaveRootItem, ...[...scaleItems].reverse()];
    } else if (mode === "updown") {
      sequenceItems = [...scaleItems, octaveRootItem, ...[...scaleItems].reverse().slice(1)];
    } else if (mode === "chord") {
      // 主和弦 (三和弦)
      const chordNotes = [
        notes[0],
        notes[2] || notes[1],
        notes[4] || notes[2] || notes[notes.length - 1]
      ];
      if (onPlayScale) {
        onPlayScale([], "chord", chordNotes);
      } else if (onPlayScaleNotes) {
        onPlayScaleNotes(chordNotes, "chord");
      }
      return;
    }

    if (onPlayScale) {
      onPlayScale(sequenceItems, mode);
    } else if (onPlayScaleNotes) {
      onPlayScaleNotes(sequenceItems.map(s => s.note), mode);
    }
  };

  const handleStop = () => {
    setIsPlayingScale(false);
    if (onStopScale) onStopScale();
  };

  return (
    <div className="flex flex-col gap-2.5 p-2 sm:p-3 bg-[#030018]/90 border border-indigo-950/50 rounded-xl max-h-[75dvh] overflow-y-auto custom-scrollbar text-slate-200">
      {/* Header & Quick stats */}
      <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2">
        <div className="flex items-center gap-1.5">
          <Music className="w-4 h-4 text-pink-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
            全難度音階系統 (Scale Master & Explorer)
          </h3>
          <span className="text-[9px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-1.5 py-0.5 rounded font-mono">
            {filteredScales.length} 款音階
          </span>
        </div>

        <button
          onClick={() => setShowChinese7Table(!showChinese7Table)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
            showChinese7Table
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm"
              : "bg-indigo-950/40 border-indigo-900/50 text-slate-400 hover:text-slate-200"
          }`}
          title="查看中國三大傳統七聲音階對照表"
        >
          <Table className="w-3 h-3 text-amber-400" />
          三大傳統七聲對照表
          {showChinese7Table ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* 傳統三大七聲音階對照表 (專題卡片) */}
      {showChinese7Table && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-2.5 animate-in fade-in duration-200 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              三大傳統七聲音階對照表 (Traditional Chinese 7-Tone Scales)
            </span>
            <span className="text-[9px] text-amber-400/80 font-mono">
              雅樂 · 清樂 · 燕樂
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-[10px] sm:text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-amber-500/30 text-amber-200 font-bold bg-amber-950/40">
                  <th className="py-1 px-2 whitespace-nowrap">音階名稱</th>
                  <th className="py-1 px-2 whitespace-nowrap">別名</th>
                  <th className="py-1 px-2 whitespace-nowrap">加入的兩個偏音</th>
                  <th className="py-1 px-2 whitespace-nowrap">現代簡譜對應 (以 C 為宮)</th>
                  <th className="py-1 px-2 min-w-[200px]">特點與應用</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/20 text-slate-300">
                {TRADITIONAL_CHINESE_7_TABLE.map((row) => (
                  <tr 
                    key={row.name} 
                    className="hover:bg-amber-500/10 cursor-pointer transition-colors"
                    onClick={() => {
                      const match = ALL_SCALES.find(s => s.name === row.name);
                      if (match) setSelectedScaleId(match.id);
                    }}
                  >
                    <td className="py-1.5 px-2 font-bold text-amber-400 whitespace-nowrap">{row.name}</td>
                    <td className="py-1.5 px-2 text-slate-400 whitespace-nowrap">{row.alias}</td>
                    <td className="py-1.5 px-2 font-semibold text-rose-300 whitespace-nowrap">{row.biasNotes}</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-300 font-bold whitespace-nowrap">{row.solfegeC}</td>
                    <td className="py-1.5 px-2 text-slate-300 text-[10px] leading-relaxed">{row.features}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Root Note Selector */}
      <div className="flex flex-col gap-1 bg-black/30 p-2 rounded-xl border border-indigo-950/40">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            選擇主音 / 根音 (Root Note):
          </span>
          <span className="font-mono text-indigo-300 font-bold">{selectedRoot} 調</span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
          {ROOT_NOTES.map((root) => (
            <button
              key={root}
              onClick={() => setSelectedRoot(root)}
              className={`py-1 rounded text-center text-[10px] sm:text-xs font-mono font-bold transition-all ${
                selectedRoot === root
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105 border border-indigo-400"
                  : "bg-indigo-950/40 text-slate-400 hover:text-slate-200 hover:bg-indigo-900/40 border border-indigo-900/30"
              }`}
            >
              {root}
            </button>
          ))}
        </div>
      </div>

      {/* Filters: Category & Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Category filter */}
        <div className="flex flex-col gap-1 bg-black/20 p-2 rounded-xl border border-indigo-950/30">
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Layers className="w-2.5 h-2.5 text-sky-400" />
            音階風格類別:
          </span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: "all", label: "全部類別" },
              { id: "chinese", label: "中國五聲與七聲" },
              { id: "western", label: "西方大小調" },
              { id: "modes", label: "七大教會調式" },
              { id: "jazz_blues", label: "藍調與爵士" },
              { id: "world", label: "世界民族調式" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium transition-all ${
                  categoryFilter === cat.id
                    ? "bg-sky-500/20 text-sky-300 border border-sky-400/50"
                    : "bg-indigo-950/30 text-slate-400 hover:text-slate-200 border border-indigo-950"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty filter */}
        <div className="flex flex-col gap-1 bg-black/20 p-2 rounded-xl border border-indigo-950/30">
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Award className="w-2.5 h-2.5 text-emerald-400" />
            音階難度等級 (隨堂考試除外):
          </span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: "all", label: "全部難度" },
              { id: "beginner", label: "初級入門" },
              { id: "intermediate", label: "中級進階" },
              { id: "advanced", label: "高級大師" },
            ].map((diff) => (
              <button
                key={diff.id}
                onClick={() => setDifficultyFilter(diff.id as any)}
                className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium transition-all ${
                  difficultyFilter === diff.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/50"
                    : "bg-indigo-950/30 text-slate-400 hover:text-slate-200 border border-indigo-950"
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scale Selection Grid */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-slate-400 font-semibold">
          點選要探索與演練的音階:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto custom-scrollbar p-1 bg-black/30 rounded-xl border border-indigo-950/40">
          {filteredScales.map((scale) => {
            const isSelected = scale.id === selectedScaleId;
            return (
              <button
                key={scale.id}
                onClick={() => {
                  setSelectedScaleId(scale.id);
                  if (onSelectScaleForPiano) {
                    onSelectScaleForPiano(getScaleNotes(selectedRoot, scale.semitones), `${selectedRoot} ${scale.name}`);
                  }
                }}
                className={`flex flex-col items-start p-1.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "bg-pink-600/20 border-pink-500 text-white shadow-md shadow-pink-500/10"
                    : "bg-indigo-950/20 border-indigo-900/30 text-slate-400 hover:bg-indigo-900/30 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-slate-100 truncate">
                    {scale.name}
                  </span>
                  <span className={`text-[8px] px-1 rounded font-mono ${
                    scale.difficulty === "beginner" ? "text-emerald-400 bg-emerald-950/50" :
                    scale.difficulty === "intermediate" ? "text-amber-400 bg-amber-950/50" :
                    "text-purple-400 bg-purple-950/50"
                  }`}>
                    {scale.difficulty === "beginner" ? "初" : scale.difficulty === "intermediate" ? "中" : "高"}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 truncate w-full">
                  {scale.englishName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Scale Detail Card */}
      {currentScale && (
        <div className="flex flex-col gap-2 p-3 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-black/40 border border-indigo-500/30 rounded-xl shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-1 border-b border-indigo-900/40 pb-1.5">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-pink-300">
                  {selectedRoot} {currentScale.name}
                </h4>
                <span className="text-[10px] text-slate-400">
                  ({currentScale.englishName})
                </span>
                {currentScale.alias && (
                  <span className="text-[9px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-900/40">
                    別名: {currentScale.alias}
                  </span>
                )}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1">
              <Tooltip content="順行階梯試聽 (由低到高)">
                <button
                  onClick={() => handlePlay("up")}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold transition-all active:scale-95"
                >
                  <Play className="w-2.5 h-2.5" />
                  順行 ↗
                </button>
              </Tooltip>
              <Tooltip content="逆行階梯試聽 (由高到低)">
                <button
                  onClick={() => handlePlay("down")}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40 text-[10px] font-semibold transition-all active:scale-95"
                >
                  <Play className="w-2.5 h-2.5" />
                  逆行 ↘
                </button>
              </Tooltip>
              <Tooltip content="上下行往返試聽">
                <button
                  onClick={() => handlePlay("updown")}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-[10px] font-semibold transition-all active:scale-95"
                >
                  <Play className="w-2.5 h-2.5" />
                  往返 ⇄
                </button>
              </Tooltip>
              <Tooltip content="主和弦試聽">
                <button
                  onClick={() => handlePlay("chord")}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 border border-pink-500/40 text-[10px] font-semibold transition-all active:scale-95"
                >
                  <Music className="w-2.5 h-2.5" />
                  主和弦
                </button>
              </Tooltip>
              <Tooltip content="停止試聽">
                <button
                  onClick={handleStop}
                  className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-all active:scale-95"
                >
                  <Square className="w-3 h-3" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Notes & Solfege Tokens */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">
                音階組成音與唱名 (點擊單音可試聽):
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                {currentScaleNotes.length} 音體系
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {currentScaleNotes.map((note, idx) => {
                const sol = currentScale.solfege[idx] || "";
                const chi = currentScale.chineseNames?.[idx] || "";
                const isPlayingThis = currentActivePlayingNote === note;

                return (
                  <button
                    key={`${note}-${idx}`}
                    onClick={() => {
                      if (onPlaySingleNote) {
                        onPlaySingleNote(selectedRoot, currentScale.semitones[idx], note);
                      } else if (onPlayScaleNotes) {
                        onPlayScaleNotes([note]);
                      }
                    }}
                    title={`試聽單音: ${note}`}
                    className={`flex flex-col items-center justify-center min-w-[38px] p-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                      isPlayingThis
                        ? "bg-pink-500 text-white border-white scale-110 shadow-lg shadow-pink-500/50"
                        : "bg-slate-900/80 border-indigo-900/40 text-slate-200 hover:border-pink-500/60 hover:bg-indigo-950/50"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{note}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">{sol}</span>
                    {chi && <span className="text-[9px] text-amber-300 font-serif">{chi}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scale characteristic info */}
          {currentScale.characteristicBias && (
            <div className="flex items-center gap-1.5 bg-rose-950/20 border border-rose-500/30 p-2 rounded-lg text-[10px] text-rose-300">
              <Info className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>
                <strong>加入偏音：</strong>{currentScale.characteristicBias}
              </span>
            </div>
          )}

          <p className="text-[11px] text-slate-300 leading-relaxed bg-black/20 p-2 rounded-lg border border-indigo-950/40">
            {currentScale.description}
          </p>

          {/* Sync with Piano Button */}
          {onSelectScaleForPiano && (
            <button
              onClick={() => onSelectScaleForPiano(currentScaleNotes, `${selectedRoot} ${currentScale.name}`)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-xs font-semibold transition-all active:scale-[0.99]"
            >
              <Music className="w-3.5 h-3.5 text-indigo-400" />
              在鋼琴鍵盤上點亮標記此音階 ({currentScaleNotes.join(" - ")})
            </button>
          )}
        </div>
      )}
    </div>
  );
};
