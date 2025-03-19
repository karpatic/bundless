// Position tracking variables
let currentLine = 1;
let currentColumn = 0;

// Export function that initializes source mapping
function initSourceMapper(debug) {
  if (!debug) {
    return { map: null, updatePosition: () => {} };
  }
  
  const sourceFilename = debug.sourceFilename;
  const sourceCode = debug.sourceCode;
  const GenMapping = debug.GenMapping;
  const maybeAddSegment = debug.maybeAddSegment;
  
  // Create source map if GenMapping is available
  const map = GenMapping ? new GenMapping({ file: sourceFilename }) : null;
  
  // Helper function to calculate line and column from offset
  function getLineAndColumnFromOffset(offset) {
    if (!sourceCode) return { line: 1, column: 0 };
    
    const lines = sourceCode.split('\n');
    let currentOffset = 0;
  
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for the newline character
      if (currentOffset + lineLength > offset) {
        return { line: i + 1, column: offset - currentOffset };
      }
      currentOffset += lineLength;
    }
  
    return { line: lines.length, column: 0 }; // Fallback
  }

  // Helper to update position counters and add mappings
  function updatePosition(str, originalNode = null) {
    if (!str) return;
    
    const startColumn = currentColumn;
    
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '\n') {
        currentLine++;
        currentColumn = 0;
      } else {
        currentColumn++;
      }
    }
    
    if (originalNode && typeof originalNode.start === 'number' && maybeAddSegment && map) {
      const startPosition = getLineAndColumnFromOffset(originalNode.start);
      maybeAddSegment(
        map,
        currentLine - 1,
        startColumn,
        sourceFilename,
        startPosition.line - 1,
        startPosition.column
      );
    }
  }

  return { map, updatePosition };
}

// Initialize with default empty implementations that will be overridden when initSourceMapper is called
let activeMapper = { map: null, updatePosition: () => {} };

// Export the current active mapper functions for direct import
const updatePosition = (str, originalNode) => activeMapper.updatePosition(str, originalNode);
const getMap = () => activeMapper.map;

// Export a function to set the active mapper
function setActiveMapper(mapper) {
  activeMapper = mapper;
  return activeMapper;
}

export { getMap, initSourceMapper, setActiveMapper, updatePosition };
