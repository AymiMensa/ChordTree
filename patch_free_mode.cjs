const fs = require('fs');
let code = fs.readFileSync('src/components/FreeModeEditor.tsx', 'utf8');

code = code.replace(
  'export interface CustomChord {\n  id: string;\n  root: string;\n  quality: string;\n}',
  'export interface CustomChord {\n  id: string;\n  root: string;\n  quality: string;\n  bass?: string;\n}'
);

code = code.replace(
  /initialChords\.length > 0 \? initialChords : \[\{ id: Date\.now\(\)\.toString\(\), root: "C", quality: "M" \}, \{ id: \(Date\.now\(\)\+1\)\.toString\(\), root: "F", quality: "M" \}, \{ id: \(Date\.now\(\)\+2\)\.toString\(\), root: "G", quality: "7" \}, \{ id: \(Date\.now\(\)\+3\)\.toString\(\), root: "C", quality: "M" \}\]/,
  'initialChords.length > 0 ? initialChords : [{ id: Date.now().toString(), root: "C", quality: "M", bass: "" }, { id: (Date.now()+1).toString(), root: "F", quality: "M", bass: "" }, { id: (Date.now()+2).toString(), root: "G", quality: "7", bass: "" }, { id: (Date.now()+3).toString(), root: "C", quality: "M", bass: "" }]'
);

code = code.replace(
  /setChords\(\[\.\.\.chords, \{ id: Date\.now\(\)\.toString\(\), root: "C", quality: "M" \}\]\);/,
  'setChords([...chords, { id: Date.now().toString(), root: "C", quality: "M", bass: "" }]);'
);

code = code.replace(
  /const qDisplay = c\.quality === 'M' \? '' : c\.quality;/,
  `const qDisplay = c.quality === 'M' ? '' : c.quality;
      const bassDisplay = c.bass ? \`/\${c.bass}\` : '';`
);

code = code.replace(
  /label: \`\$\{c\.root\}\$\{qDisplay\}\`,/,
  'label: `${c.root}${qDisplay}${bassDisplay}`,'
);

code = code.replace(
  /notes: parseChordToNotes\(c\.root, c\.quality\)/,
  'notes: parseChordToNotes(c.root, c.quality, c.bass)'
);

const newSelects = `<div className="flex flex-col gap-1">
                <select 
                  value={chord.root} 
                  onChange={(e) => handleUpdateChord(chord.id, 'root', e.target.value)}
                  className="bg-black/50 border border-indigo-950/80 rounded-lg text-white font-bold px-2 py-1.5 outline-none focus:border-indigo-500 appearance-none text-center cursor-pointer min-w-[3.5rem]"
                >
                  {CHORD_ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <select 
                  value={chord.quality} 
                  onChange={(e) => handleUpdateChord(chord.id, 'quality', e.target.value)}
                  className="bg-black/50 border border-indigo-950/80 rounded-lg text-slate-300 font-mono text-sm px-2 py-1.5 outline-none focus:border-indigo-500 cursor-pointer min-w-[8.5rem]"
                >
                  {CHORD_QUALITIES.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-1 flex-row items-center">
                <span className="text-slate-500 font-bold px-1">/</span>
                <select 
                  value={chord.bass || ""} 
                  onChange={(e) => handleUpdateChord(chord.id, 'bass', e.target.value)}
                  className="bg-black/50 border border-indigo-950/80 rounded-lg text-indigo-300 font-bold px-2 py-1.5 outline-none focus:border-indigo-500 appearance-none text-center cursor-pointer min-w-[3.5rem]"
                >
                  <option value="">-</option>
                  {CHORD_ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>`;

code = code.replace(
  /<div className="flex flex-col gap-1">\s*<select\s*value=\{chord\.root\}[\s\S]*?<\/select>\s*<\/div>[\s\S]*?<div className="flex flex-col gap-1">\s*<select\s*value=\{chord\.quality\}[\s\S]*?<\/select>\s*<\/div>/,
  newSelects
);

fs.writeFileSync('src/components/FreeModeEditor.tsx', code);
