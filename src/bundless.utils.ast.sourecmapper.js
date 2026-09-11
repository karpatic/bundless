// Each compilation owns its generated position, including final module edits.
export function initSourceMapper({ GenMapping, maybeAddSegment, sourceFilename, sourceCode }) {
  const map = new GenMapping({ file: sourceFilename });
  const lines = [0];
  for (let i = 0; i < sourceCode.length; i++) if (sourceCode[i] === '\n') lines.push(i + 1);
  let generatedLine = 0, generatedColumn = 0;
  function updatePosition(text, node, original = false) {
    let offset = node.start;
    // Binary search also works when JSX emission revisits an earlier offset.
    let low = 0, high = lines.length;
    while (low + 1 < high) {
      const mid = (low + high) >>> 1;
      if (lines[mid] <= offset) low = mid;
      else high = mid;
    }
    let line = low, column = offset - lines[low];
    for (let i = 0; i < text.length; i++) {
      // Keep exact columns in preserved source; synthetic code anchors to its node.
      if (original || i === 0 || generatedColumn === 0) {
        maybeAddSegment(map, generatedLine, generatedColumn, sourceFilename, line, column);
      }
      if (text[i] === '\n') { generatedLine++; generatedColumn = 0; }
      else generatedColumn++;
      if (original) {
        if (text[i] === '\n') { line++; column = 0; }
        else column++;
      }
    }
  }
  return { map, updatePosition };
}
