const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'import { Play, Square, Settings2, Share2, Volume2, Waves, Repeat, RefreshCw, FolderTree, FileCode, CheckSquare, Settings } from "lucide-react";',
  'import { Play, Square, Settings2, Share2, Volume2, Waves, Repeat, RefreshCw, FolderTree, FileCode, CheckSquare, Settings, Compass } from "lucide-react";'
);

fs.writeFileSync('src/App.tsx', code);
