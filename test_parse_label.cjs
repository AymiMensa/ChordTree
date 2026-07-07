const regex = /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/;
const labels = ["Dbm", "G7", "C#m", "A#m", "Gb7", "G#m", "C/E", "F#m7/E"];
for (const label of labels) {
  const match = label.match(regex);
  if (match) {
    console.log(label, '=>', 'root:', match[1], 'quality:', match[2], 'bass:', match[3]);
  } else {
    console.log(label, '=> NO MATCH');
  }
}
