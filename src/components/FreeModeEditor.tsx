import React, { useRef, useState } from 'react';
import { Plus, X, ArrowLeft, Check, Trash2, Settings2, Download, Upload } from 'lucide-react';
import { parseChordToNotes } from '../utils/chordParser';
import { ProgressionStep } from '../types';
import { Tooltip } from './TooltipProvider';

export const CHORD_ROOTS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];

export const CHORD_QUALITIES_MAJOR = [
  { value: "M", label: "M (Major)" },
  { value: "M7", label: "M7" },
  { value: "7", label: "7" },
  { value: "6", label: "6" },
  { value: "sus2", label: "sus2" },
  { value: "sus4", label: "sus4" },
  { value: "7sus4", label: "7sus4" },
  { value: "aug", label: "aug" },
  { value: "M7+5", label: "M7+5" },
  { value: "7+5", label: "7+5" },
  { value: "-5", label: "-5" },
  { value: "7-5", label: "7-5" },
  { value: "power", label: "power" },
  { value: "M9", label: "M9" },
  { value: "9", label: "9" },
  { value: "69", label: "69" },
  { value: "11", label: "11" },
  { value: "13", label: "13" },
  { value: "add9", label: "add9" },
  { value: "7-9", label: "7-9" },
  { value: "7-9+5", label: "7-9+5" },
  { value: "7+9", label: "7+9" },
  { value: "9+5", label: "9+5" },
  { value: "9-5", label: "9-5" },
  { value: "9+11", label: "9+11" },
  { value: "13-9", label: "13-9" },
  { value: "13-9-5", label: "13-9-5" }
];

export const CHORD_QUALITIES_MINOR = [
  { value: "m", label: "m (Minor)" },
  { value: "mM7", label: "mM7" },
  { value: "m7", label: "m7" },
  { value: "m6", label: "m6" },
  { value: "m-5", label: "m-5" },
  { value: "m7-5", label: "m7-5" },
  { value: "dim7", label: "dim7" },
  { value: "mM9", label: "mM9" },
  { value: "m9", label: "m9" },
  { value: "m69", label: "m69" },
  { value: "m11", label: "m11" },
  { value: "madd9", label: "madd9" },
  { value: "madd11", label: "madd11" }
];

export interface CustomChord {
  id: string;
  root: string;
  quality: string;
  bass?: string;
}

interface FreeModeEditorProps {
  initialChords: CustomChord[];
  onConfirm: (progression: ProgressionStep[], rawChords: CustomChord[]) => void;
  onCancel: () => void;
}

export const FreeModeEditor: React.FC<FreeModeEditorProps> = ({ initialChords, onConfirm, onCancel }) => {
  const [chords, setChords] = useState<CustomChord[]>(
    initialChords.length > 0 ? initialChords : [{ id: Date.now().toString(), root: "C", quality: "M", bass: "" }, { id: (Date.now()+1).toString(), root: "F", quality: "M", bass: "" }, { id: (Date.now()+2).toString(), root: "G", quality: "7", bass: "" }, { id: (Date.now()+3).toString(), root: "C", quality: "M", bass: "" }]
  );

  const handleAddChord = () => {
    setChords([...chords, { id: Date.now().toString(), root: "C", quality: "M", bass: "" }]);
  };

  const handleInsertChord = (index: number) => {
    const newChords = [...chords];
    newChords.splice(index + 1, 0, { id: Date.now().toString(), root: "C", quality: "M", bass: "" });
    setChords(newChords);
  };

  const handleRemoveChord = (idToRemove: string) => {
    if (chords.length <= 1) return;
    setChords(chords.filter(c => c.id !== idToRemove));
  };

  const handleUpdateChord = (id: string, field: 'root' | 'quality' | 'bass', value: string) => {
    setChords(chords.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSave = () => {
    const progression: ProgressionStep[] = chords.map((c, idx) => {
      const qDisplay = c.quality === 'M' ? '' : c.quality;
      const bassDisplay = c.bass ? `/${c.bass}` : '';
      return {
        type: "node",
        id: `custom-${c.id}-${idx}`,
        label: `${c.root}${qDisplay}${bassDisplay}`,
        notes: parseChordToNotes(c.root, c.quality, c.bass)
      };
    });
    onConfirm(progression, chords);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(chords, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `custom_chords_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsedChords = JSON.parse(json);
        if (Array.isArray(parsedChords)) {
          // Simply assign and re-generate IDs to ensure uniqueness if needed, but direct parse is fine.
          setChords(parsedChords);
        } else {
          alert('匯入的 JSON 格式錯誤。');
        }
      } catch (error) {
        console.error('JSON parsing error:', error);
        alert('匯入檔案失敗，可能不是有效的 JSON 格式。');
      }
    };
    reader.readAsText(file);
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="absolute inset-0 bg-[#03001a] p-3 sm:p-6 flex flex-col z-20 h-full max-md:fixed max-md:inset-0 max-md:z-[100] max-md:w-screen max-md:h-[100dvh] max-md:p-3 max-md:portrait:pt-4 max-md:landscape:p-1 max-md:landscape:pt-1">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 md:mb-6 shrink-0 gap-3 max-md:landscape:flex-row max-md:landscape:items-center max-md:landscape:mb-1 max-md:landscape:gap-2">
        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 max-md:landscape:text-sm">
          <Settings2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-400 max-md:landscape:w-4 max-md:landscape:h-4" />
          自由編輯模式
        </h2>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto max-md:landscape:w-auto max-md:landscape:gap-1.5">
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportJSON} 
          />
          <div className="flex bg-indigo-950/40 rounded-lg md:rounded-xl border border-indigo-900/40 p-1 max-md:landscape:p-0.5">
            <Tooltip content="匯入 JSON 檔案">
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900/60 transition-colors text-xs md:text-sm font-medium max-md:landscape:px-1.5 max-md:landscape:py-0.5 max-md:landscape:text-[10px]" title="匯入 JSON (讀取)">
                <Upload className="w-4 h-4 md:w-4 md:h-4 max-md:landscape:w-3 max-md:landscape:h-3" />
                <span className="hidden sm:inline">讀取</span>
              </button>
            </Tooltip>
            <div className="w-[1px] bg-indigo-900/50 mx-1 max-md:landscape:mx-0.5"></div>
            <Tooltip content="匯出成 JSON 檔案">
              <button onClick={handleExportJSON} className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900/60 transition-colors text-xs md:text-sm font-medium max-md:landscape:px-1.5 max-md:landscape:py-0.5 max-md:landscape:text-[10px]" title="匯出 JSON (儲存)">
                <Download className="w-4 h-4 md:w-4 md:h-4 max-md:landscape:w-3 max-md:landscape:h-3" />
                <span className="hidden sm:inline">儲存</span>
              </button>
            </Tooltip>
          </div>

          <Tooltip content="放棄變更並關閉">
            <button onClick={onCancel} className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-slate-300 hover:bg-white/5 transition-colors text-sm md:text-base font-medium ml-auto max-md:landscape:px-2 max-md:landscape:py-1 max-md:landscape:text-[10px]">取消</button>
          </Tooltip>
          <Tooltip content="確認並套用變更">
            <button onClick={handleSave} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm md:text-base font-medium shadow-lg shadow-indigo-500/25 transition-all max-md:landscape:px-2 max-md:landscape:py-1 max-md:landscape:text-[10px]">
              <Check className="w-4 h-4 max-md:landscape:w-3 max-md:landscape:h-3" />
              確認
            </button>
          </Tooltip>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto overscroll-contain touch-pan-y custom-scrollbar bg-black/20 rounded-xl md:rounded-2xl border border-indigo-950/50 p-2 md:p-4 max-md:landscape:p-1 max-md:landscape:rounded-lg">
        <div className="flex flex-wrap gap-2 md:gap-3 items-start content-start w-full max-md:landscape:gap-1.5">
          {chords.map((chord, index) => (
            <div key={chord.id} className="relative group flex flex-nowrap items-center gap-1.5 md:gap-2 bg-[#090524] border border-indigo-900/40 p-2 md:p-3 rounded-lg md:rounded-xl shadow-lg hover:border-indigo-500/50 transition-colors w-full sm:w-auto min-w-[280px] max-md:landscape:p-1 max-md:landscape:min-w-[200px] max-md:landscape:gap-1 max-md:landscape:rounded-md">
              <span className="absolute -top-2 -left-2 md:-top-2.5 md:-left-2.5 w-5 h-5 md:w-6 md:h-6 bg-indigo-950 text-indigo-300 text-[10px] md:text-xs flex items-center justify-center rounded-full font-mono border border-indigo-900/50 shadow-md z-10 max-md:landscape:w-4 max-md:landscape:h-4 max-md:landscape:text-[8px] max-md:landscape:-top-1.5 max-md:landscape:-left-1.5">
                {index + 1}
              </span>
              
              <div className="flex flex-col gap-1 flex-1 min-w-[3.5rem] max-md:landscape:gap-0.5 max-md:landscape:min-w-[2.5rem]">
                <select 
                  value={chord.root} 
                  onChange={(e) => handleUpdateChord(chord.id, 'root', e.target.value)}
                  className="bg-[#0f172a] border border-indigo-500/50 rounded-md md:rounded-lg text-amber-400 font-bold md:font-extrabold px-1.5 py-1 md:px-2 md:py-1.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 appearance-none text-center cursor-pointer w-full shadow-sm text-sm md:text-base max-md:landscape:px-1 max-md:landscape:py-0.5 max-md:landscape:text-[10px]"
                >
                  {CHORD_ROOTS.map(r => <option key={r} value={r} className="bg-slate-900 text-amber-400">{r}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-1 flex-[1.5] min-w-[5.5rem] max-md:landscape:gap-0.5 max-md:landscape:min-w-[4.5rem]">
                <select 
                  value={chord.quality} 
                  onChange={(e) => handleUpdateChord(chord.id, 'quality', e.target.value)}
                  className="bg-[#0f172a] border border-indigo-500/50 rounded-md md:rounded-lg text-emerald-400 font-bold font-mono text-xs md:text-sm px-1 py-1 md:px-2 md:py-1.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer w-full shadow-sm text-center max-md:landscape:px-0.5 max-md:landscape:py-0.5 max-md:landscape:text-[9px]"
                >
                  <optgroup label="M 大調類 (Major)" className="bg-slate-800 text-pink-400 font-sans">
                    {CHORD_QUALITIES_MAJOR.map(q => <option key={q.value} value={q.value} className="bg-slate-900 text-emerald-400">{q.label}</option>)}
                  </optgroup>
                  <optgroup label="m 小調類 (Minor)" className="bg-slate-800 text-sky-400 font-sans">
                    {CHORD_QUALITIES_MINOR.map(q => <option key={q.value} value={q.value} className="bg-slate-900 text-emerald-400">{q.label}</option>)}
                  </optgroup>
                </select>
              </div>
              
              <div className="flex flex-row items-center gap-0.5 md:gap-1 flex-1 min-w-[3.5rem] max-md:landscape:gap-0.5 max-md:landscape:min-w-[2.5rem]">
                <span className="text-slate-500 font-bold px-0.5 md:px-1 text-sm md:text-base max-md:landscape:text-[10px] max-md:landscape:px-0.5">/</span>
                <select 
                  value={chord.bass || ""} 
                  onChange={(e) => handleUpdateChord(chord.id, 'bass', e.target.value)}
                  className="bg-[#0f172a] border border-indigo-500/50 rounded-md md:rounded-lg text-fuchsia-400 font-bold md:font-extrabold px-1.5 py-1 md:px-2 md:py-1.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 appearance-none text-center cursor-pointer w-full shadow-sm text-sm md:text-base max-md:landscape:px-1 max-md:landscape:py-0.5 max-md:landscape:text-[10px]"
                >
                  <option value="" className="bg-slate-900 text-fuchsia-400">-</option>
                  {CHORD_ROOTS.map(r => <option key={r} value={r} className="bg-slate-900 text-fuchsia-400">{r}</option>)}
                </select>
              </div>
              
              <div className="flex items-center gap-0.5 md:gap-1 ml-0 md:ml-1 shrink-0">
                <Tooltip content="在此和弦之後插入新和弦">
                  <button 
                    onClick={() => handleInsertChord(index)}
                    className="p-1 md:p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors max-md:landscape:p-0.5 text-[10px] md:text-xs font-bold flex items-center justify-center gap-0.5"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4 max-md:landscape:w-2.5 max-md:landscape:h-2.5" />
                    🎵
                  </button>
                </Tooltip>
                {chords.length > 1 && (
                  <Tooltip content="移除這個和弦">
                    <button 
                      onClick={() => handleRemoveChord(chord.id)}
                      className="p-1 md:p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors max-md:landscape:p-0.5"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5 max-md:landscape:w-3 max-md:landscape:h-3" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
          
          <Tooltip content="在尾端新增一個和弦" className="w-full max-md:portrait:w-full sm:w-auto flex">
            <button 
              onClick={handleAddChord}
              className="flex items-center justify-center h-[42px] md:h-[62px] px-4 md:px-5 border-2 border-dashed border-indigo-900/50 rounded-lg md:rounded-xl text-indigo-400 hover:text-indigo-300 hover:border-indigo-500 hover:bg-indigo-950/30 transition-all font-medium w-full text-sm md:text-base max-md:landscape:h-[32px] max-md:landscape:px-3 max-md:landscape:text-xs"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 max-md:landscape:w-3 max-md:landscape:h-3 max-md:landscape:mr-0.5" />
              增加和弦
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
