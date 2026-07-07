import React, { useRef, useState } from 'react';
import { Plus, X, ArrowLeft, Check, Trash2, Settings2, Download, Upload } from 'lucide-react';
import { parseChordToNotes } from '../utils/chordParser';
import { ProgressionStep } from '../types';

export const CHORD_ROOTS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];

export const CHORD_QUALITIES = [
  // Major Group
  { value: "M", label: "Major (M)" },
  { value: "M7", label: "Major 7 (M7)" },
  { value: "7", label: "Dominant 7 (7)" },
  { value: "6", label: "Major 6 (6)" },
  { value: "sus2", label: "Sus 2 (sus2)" },
  { value: "sus4", label: "Sus 4 (sus4)" },
  { value: "7sus4", label: "7 Sus 4 (7sus4)" },
  { value: "aug", label: "Augmented (aug)" },
  { value: "M7+5", label: "Major 7 #5 (M7+5)" },
  { value: "7+5", label: "Dominant 7 #5 (7+5)" },
  { value: "-5", label: "Major b5 (-5)" },
  { value: "7-5", label: "Dominant 7 b5 (7-5)" },
  { value: "power", label: "Power Chord (power)" },
  { value: "M9", label: "Major 9 (M9)" },
  { value: "9", label: "Dominant 9 (9)" },
  { value: "69", label: "6/9 (69)" },
  { value: "11", label: "Dominant 11 (11)" },
  { value: "13", label: "Dominant 13 (13)" },
  { value: "add9", label: "Add 9 (add9)" },
  { value: "7-9", label: "Dominant 7 b9 (7-9)" },
  { value: "7-9+5", label: "Dominant 7 b9 #5 (7-9+5)" },
  { value: "7+9", label: "Dominant 7 #9 (7+9)" },
  { value: "9+5", label: "Dominant 9 #5 (9+5)" },
  { value: "9-5", label: "Dominant 9 b5 (9-5)" },
  { value: "9+11", label: "Dominant 9 #11 (9+11)" },
  { value: "13-9", label: "Dominant 13 b9 (13-9)" },
  { value: "13-9-5", label: "Dominant 13 b9 b5 (13-9-5)" },

  // Minor Group
  { value: "m", label: "Minor (m)" },
  { value: "mM7", label: "Minor Major 7 (mM7)" },
  { value: "m7", label: "Minor 7 (m7)" },
  { value: "m6", label: "Minor 6 (m6)" },
  { value: "m-5", label: "Minor b5 (m-5 / dim)" },
  { value: "m7-5", label: "Minor 7 b5 (m7-5 / m7b5)" },
  { value: "dim7", label: "Diminished 7 (dim7)" },
  { value: "mM9", label: "Minor Major 9 (mM9)" },
  { value: "m9", label: "Minor 9 (m9)" },
  { value: "m69", label: "Minor 6/9 (m69)" },
  { value: "m11", label: "Minor 11 (m11)" },
  { value: "madd9", label: "Minor Add 9 (madd9)" },
  { value: "madd11", label: "Minor Add 11 (madd11)" },
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
    <div className="absolute inset-0 bg-[#03001a] p-4 sm:p-6 flex flex-col z-20 h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-indigo-400" />
          自由編輯模式
        </h2>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportJSON} 
          />
          <div className="flex bg-indigo-950/40 rounded-xl border border-indigo-900/40 p-1">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900/60 transition-colors text-sm font-medium" title="匯入 JSON (讀取)">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">讀取</span>
            </button>
            <div className="w-[1px] bg-indigo-900/50 mx-1"></div>
            <button onClick={handleExportJSON} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900/60 transition-colors text-sm font-medium" title="匯出 JSON (儲存)">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">儲存</span>
            </button>
          </div>

          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors font-medium">取消</button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all">
            <Check className="w-4 h-4" />
            確認
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-2xl border border-indigo-950/50 p-4">
        <div className="flex flex-wrap gap-3 items-start content-start">
          {chords.map((chord, index) => (
            <div key={chord.id} className="relative group flex items-center gap-2 bg-[#090524] border border-indigo-900/40 p-3 rounded-xl shadow-lg hover:border-indigo-500/50 transition-colors">
              <span className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-indigo-950 text-indigo-300 text-xs flex items-center justify-center rounded-full font-mono border border-indigo-900/50 shadow-md">
                {index + 1}
              </span>
              
              <div className="flex flex-col gap-1">
                <select 
                  value={chord.root} 
                  onChange={(e) => handleUpdateChord(chord.id, 'root', e.target.value)}
                  className="bg-[#0f172a] border border-indigo-500/50 rounded-lg text-amber-400 font-extrabold px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 appearance-none text-center cursor-pointer min-w-[3.5rem] shadow-sm"
                >
                  {CHORD_ROOTS.map(r => <option key={r} value={r} className="bg-slate-900 text-amber-400">{r}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <select 
                  value={chord.quality} 
                  onChange={(e) => handleUpdateChord(chord.id, 'quality', e.target.value)}
                  className="bg-[#0f172a] border border-indigo-500/50 rounded-lg text-emerald-400 font-bold font-mono text-sm px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer min-w-[8.5rem] shadow-sm"
                >
                  {CHORD_QUALITIES.map(q => <option key={q.value} value={q.value} className="bg-slate-900 text-emerald-400">{q.label}</option>)}
                </select>
              </div>
              
              <div className="flex flex-row items-center gap-1">
                <span className="text-slate-500 font-bold px-1">/</span>
                <select 
                  value={chord.bass || ""} 
                  onChange={(e) => handleUpdateChord(chord.id, 'bass', e.target.value)}
                  className="bg-[#0f172a] border border-indigo-500/50 rounded-lg text-fuchsia-400 font-bold px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 appearance-none text-center cursor-pointer min-w-[3.5rem] shadow-sm"
                >
                  <option value="" className="bg-slate-900 text-fuchsia-400">-</option>
                  {CHORD_ROOTS.map(r => <option key={r} value={r} className="bg-slate-900 text-fuchsia-400">{r}</option>)}
                </select>
              </div>
              
              {chords.length > 1 && (
                <button 
                  onClick={() => handleRemoveChord(chord.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          <button 
            onClick={handleAddChord}
            className="flex items-center justify-center h-[62px] px-5 border-2 border-dashed border-indigo-900/50 rounded-xl text-indigo-400 hover:text-indigo-300 hover:border-indigo-500 hover:bg-indigo-950/30 transition-all font-medium"
          >
            <Plus className="w-5 h-5 mr-1" />
            增加和弦
          </button>
        </div>
      </div>
    </div>
  );
};
