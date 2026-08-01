import { getChordSpelling, getChordMidiNotes } from './src/chordsData.ts';

const checks = new Map([
  ['C7', ['C', 'E', 'G', 'Bb']],
  ['Am', ['A', 'C', 'E']],
  ['Am7b5', ['A', 'C', 'Eb', 'G']],
  ['Ab', ['Ab', 'C', 'Eb']],
  ['Abmaj7', ['Ab', 'C', 'Eb', 'G']],
  ['Abm', ['Ab', 'Cb', 'Eb']],
  ['Ab7', ['Ab', 'C', 'Eb', 'Gb']],
  ['A', ['A', 'C#', 'E']],
  ['A7', ['A', 'C#', 'E', 'G']],
  ['G7', ['G', 'B', 'D', 'F']],
  ['Gmaj7', ['G', 'B', 'D', 'F#']],
  ['G#7', ['G#', 'B#', 'D#', 'F#']],
  ['G#m', ['G#', 'B', 'D#']],
  ['F#7', ['F#', 'A#', 'C#', 'E']],
  ['F#m7b5', ['F#', 'A', 'C', 'E']],
  ['F7', ['F', 'A', 'C', 'Eb']],
  ['E#7', ['E#', 'G##', 'B#', 'D#']],
  ['Bb7', ['Bb', 'D', 'F', 'Ab']],
  ['Em', ['E', 'G', 'B']],
]);

let ok = true;
for (const [name, expected] of checks) {
  const actual = getChordSpelling(name);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.log('FAIL SPELL', name, { actual, expected });
    ok = false;
  }

  const mids = getChordMidiNotes(name);
  const sorted = [...mids].sort((a, b) => a - b);
  if (JSON.stringify(mids) !== JSON.stringify(sorted)) {
    console.log('FAIL MIDI', name, { mids, sorted });
    ok = false;
  }
}
console.log(ok ? 'root-position regression checks passed' : 'root-position regression checks failed');
