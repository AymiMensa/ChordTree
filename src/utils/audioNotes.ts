// Base fundamental frequencies for standard scientific pitch notation (4th Octave)
export const NOTE_BASE_FREQS: { [key: string]: number } = {
  "C": 261.63,
  "C#": 277.18,
  "Db": 277.18,
  "D": 293.66,
  "D#": 311.13,
  "Eb": 311.13,
  "E": 329.63,
  "F": 349.23,
  "F#": 369.99,
  "Gb": 369.99,
  "G": 392.00,
  "G#": 415.30,
  "Ab": 415.30,
  "A": 440.00,
  "A#": 466.16,
  "Bb": 466.16,
  "B": 493.88,
  "Cb": 246.94, // equivalent to B3
  "Fb": 329.63, // equivalent to E4
  "E#": 349.23,
  "B#": 261.63,
};

// Transition dominant 7th chord decomposition note spellings
export const TRANSITION_CHORD_NOTES: { [key: string]: string[] } = {
  "G7": ["G", "B", "D", "F"],
  "B7": ["B", "D#", "F#", "A"],
  "E7": ["E", "G#", "B", "D"],
  "Eb7": ["Eb", "G", "Bb", "Db"],
  "Bb7": ["Bb", "D", "F", "Ab"],
  "D7": ["D", "F#", "A", "C"],
  "C7": ["C", "E", "G", "Bb"],
  "Ab7": ["Ab", "C", "Eb", "Gb"],
  "F7": ["F", "A", "C", "Eb"],
  "F#7": ["F#", "A#", "C#", "E"],
  "G#7": ["G#", "C", "D#", "F#"],
  "D#7": ["D#", "G", "A#", "C#"],
  "A7": ["A", "C#", "E", "G"],
  "C#7": ["C#", "F", "G#", "B"],
  "A#7": ["A#", "D", "F", "G#"],
  "Db7": ["Db", "F", "Ab", "Cb"]
};

export const CHORD_NOTES: { [key: string]: string[] } = {
  "C": ["C", "E", "G"],
  "F": ["F", "A", "C"],
  "Bb": ["Bb", "D", "F"],
  "Eb": ["Eb", "G", "Bb"],
  "Ab": ["Ab", "C", "Eb"],
  "Db": ["Db", "F", "Ab"],
  "Gb": ["Gb", "Bb", "Db"],
  "B": ["B", "D#", "F#"],
  "E": ["E", "G#", "B"],
  "A": ["A", "C#", "E"],
  "D": ["D", "F#", "A"],
  "G": ["G", "B", "D"],
  "F#": ["F#", "A#", "C#"],
  "Am": ["A", "C", "E"],
  "Dm": ["D", "F", "A"],
  "Gm": ["G", "Bb", "D"],
  "Cm": ["C", "Eb", "G"],
  "Fm": ["F", "Ab", "C"],
  "Bbm": ["Bb", "Db", "F"],
  "Ebm": ["Eb", "Gb", "Bb"],
  "Abm": ["Ab", "Cb", "Eb"],
  "C#m": ["C#", "E", "G#"],
  "F#m": ["F#", "A", "C#"],
  "Bm": ["B", "D", "F#"],
  "Em": ["E", "G", "B"],
  "G#m": ["G#", "B", "D#"],
  "D#m": ["D#", "F#", "A#"]
};
