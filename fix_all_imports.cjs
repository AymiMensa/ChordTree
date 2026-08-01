const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importsToReplace = `import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Play, Square, Settings2, Share2, Volume2, Waves, Repeat, RefreshCw, FolderTree, FileCode, CheckSquare, Settings, Compass } from "lucide-react";
import { AudioEngine } from "./utils/audioEngine";
import { getTreeData } from "./chordTreeData";
import { ChordNode, ChordLink, PlaybackState, ProgressionStep, CustomChord } from "./types";`;

const newImports = `import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Play, Square, Settings2, Share2, Volume2, Waves, Repeat, RefreshCw, FolderTree, FileCode, CheckSquare, Settings, Compass, Activity, Layers, Sparkles } from "lucide-react";
import { AudioEngine } from "./utils/audioEngine";
import { getTreeData } from "./chordTreeData";
import { ChordNode, ChordLink, PlaybackState, ProgressionStep, CustomChord } from "./types";
import { ChordTreeSvg } from "./components/ChordTreeSvg";
import { CustomProgressionFlow } from "./components/CustomProgressionFlow";
import { FreeModeEditor } from "./components/FreeModeEditor";
import { InteractiveGuides } from "./components/InteractiveGuides";
import { MetronomeControls } from "./components/MetronomeControls";`;

code = code.replace(importsToReplace, newImports);
fs.writeFileSync('src/App.tsx', code);
