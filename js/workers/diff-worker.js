// Web Worker for diff computation
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'COMPUTE_DIFF':
      const diff = computeDiff(data.text1, data.text2, data.options);
      self.postMessage({ type: 'DIFF_RESULT', diff });
      break;
      
    case 'COMPUTE_PATCH':
      const patch = computePatch(data.text1, data.text2, data.options);
      self.postMessage({ type: 'PATCH_RESULT', patch });
      break;
  }
});

function computeDiff(text1, text2, options = {}) {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  
  // Myers diff algorithm implementation
  const diff = myersDiff(lines1, lines2);
  
  // Format the diff based on options
  if (options.format === 'unified') {
    return formatUnifiedDiff(diff, lines1, lines2, options);
  } else if (options.format === 'side-by-side') {
    return formatSideBySideDiff(diff, lines1, lines2, options);
  } else {
    return formatInlineDiff(diff, lines1, lines2, options);
  }
}

function myersDiff(a, b) {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const v = new Array(2 * max + 1);
  const trace = [];
  
  v[max + 1] = 0;
  
  for (let d = 0; d <= max; d++) {
    const snapshot = v.slice();
    trace.push(snapshot);
    
    for (let k = -d; k <= d; k += 2) {
      let x;
      const kIndex = max + k;
      
      if (k === -d || (k !== d && v[kIndex - 1] < v[kIndex + 1])) {
        x = v[kIndex + 1];
      } else {
        x = v[kIndex - 1] + 1;
      }
      
      let y = x - k;
      
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      
      v[kIndex] = x;
      
      if (x >= n && y >= m) {
        return buildDiff(trace, a, b, n, m, max);
      }
    }
  }
  
  return [];
}

function buildDiff(trace, a, b, n, m, max) {
  const diff = [];
  let x = n;
  let y = m;
  
  for (let d = trace.length - 1; d >= 0 && (x > 0 || y > 0); d--) {
    const v = trace[d];
    const k = x - y;
    const kIndex = max + k;
    
    let prevK;
    if (k === -d || (k !== d && v[kIndex - 1] < v[kIndex + 1])) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }
    
    const prevX = v[max + prevK];
    const prevY = prevX - prevK;
    
    while (x > prevX && y > prevY) {
      diff.unshift({ type: 'equal', value: a[x - 1] });
      x--;
      y--;
    }
    
    if (x > prevX) {
      diff.unshift({ type: 'delete', value: a[x - 1] });
      x--;
    } else if (y > prevY) {
      diff.unshift({ type: 'insert', value: b[y - 1] });
      y--;
    }
  }
  
  return diff;
}

function formatUnifiedDiff(diff, lines1, lines2, options) {
  const contextLines = options.contextLines || 3;
  const hunks = [];
  let currentHunk = null;
  let line1 = 0;
  let line2 = 0;
  
  diff.forEach((change, index) => {
    if (change.type === 'equal') {
      line1++;
      line2++;
      
      if (currentHunk) {
        currentHunk.lines.push({ type: 'context', line: change.value });
        if (currentHunk.lines.filter(l => l.type === 'context').length >= contextLines * 2) {
          hunks.push(currentHunk);
          currentHunk = null;
        }
      }
    } else {
      if (!currentHunk) {
        currentHunk = {
          oldStart: Math.max(1, line1 - contextLines),
          newStart: Math.max(1, line2 - contextLines),
          lines: []
        };
        
        // Add context before
        for (let i = Math.max(0, index - contextLines); i < index; i++) {
          if (diff[i] && diff[i].type === 'equal') {
            currentHunk.lines.push({ type: 'context', line: diff[i].value });
          }
        }
      }
      
      if (change.type === 'delete') {
        currentHunk.lines.push({ type: 'delete', line: change.value });
        line1++;
      } else if (change.type === 'insert') {
        currentHunk.lines.push({ type: 'insert', line: change.value });
        line2++;
      }
    }
  });
  
  if (currentHunk) {
    hunks.push(currentHunk);
  }
  
  return { type: 'unified', hunks };
}

function formatSideBySideDiff(diff, lines1, lines2, options) {
  const result = [];
  let line1 = 0;
  let line2 = 0;
  
  diff.forEach(change => {
    if (change.type === 'equal') {
      result.push({
        left: { number: ++line1, text: change.value, type: 'equal' },
        right: { number: ++line2, text: change.value, type: 'equal' }
      });
    } else if (change.type === 'delete') {
      result.push({
        left: { number: ++line1, text: change.value, type: 'delete' },
        right: { number: null, text: '', type: 'empty' }
      });
    } else if (change.type === 'insert') {
      result.push({
        left: { number: null, text: '', type: 'empty' },
        right: { number: ++line2, text: change.value, type: 'insert' }
      });
    }
  });
  
  return { type: 'side-by-side', lines: result };
}

function formatInlineDiff(diff, lines1, lines2, options) {
  const result = [];
  
  diff.forEach(change => {
    result.push({
      type: change.type,
      value: change.value
    });
  });
  
  return { type: 'inline', changes: result };
}

function computePatch(text1, text2, options = {}) {
  const diff = computeDiff(text1, text2, { format: 'unified', ...options });
  
  // Generate patch in unified diff format
  let patch = `--- a/file\n+++ b/file\n`;
  
  diff.hunks.forEach(hunk => {
    const oldCount = hunk.lines.filter(l => l.type !== 'insert').length;
    const newCount = hunk.lines.filter(l => l.type !== 'delete').length;
    
    patch += `@@ -${hunk.oldStart},${oldCount} +${hunk.newStart},${newCount} @@\n`;
    
    hunk.lines.forEach(line => {
      if (line.type === 'context') {
        patch += ` ${line.line}\n`;
      } else if (line.type === 'delete') {
        patch += `-${line.line}\n`;
      } else if (line.type === 'insert') {
        patch += `+${line.line}\n`;
      }
    });
  });
  
  return patch;
}