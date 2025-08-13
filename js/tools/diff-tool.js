export class DiffTool {
  constructor() {
    this.container = null;
    this.leftInput = null;
    this.rightInput = null;
    this.outputArea = null;
    this.viewMode = 'unified';
    this.diffWorker = null;
    this.computeTimeout = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    // Initialize Web Worker for diff computation
    if (window.Worker) {
      this.diffWorker = new Worker('/js/workers/diff-worker.js');
      this.diffWorker.addEventListener('message', (event) => this.handleWorkerMessage(event));
    }
    
    this.render();
    this.attachEventListeners();
    this.loadExample();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Diff Tool</h1>
          <p class="text-gray-600 dark:text-gray-400">Compare two texts and visualize the differences</p>
        </div>
        
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-l-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-view="unified">Unified</button>
            <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-view="split">Split</button>
            <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-r-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-view="inline">Inline</button>
          </div>
          <div class="flex gap-2">
            <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="swap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/>
              </svg>
              Swap
            </button>
            <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="clear">Clear</button>
          </div>
        </div>
        
        <div class="flex gap-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6" id="diff-stats">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Changes:</span>
            <span class="text-sm font-bold text-gray-900 dark:text-white" id="stat-changes">0</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Added:</span>
            <span class="text-sm font-bold text-green-600 dark:text-green-400" id="stat-added">0</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Removed:</span>
            <span class="text-sm font-bold text-red-600 dark:text-red-400" id="stat-removed">0</span>
          </div>
        </div>
        
        <div class="diff-inputs">
          <div class="flex-1">
            <label for="left-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Text</label>
            <textarea 
              id="left-input" 
              class="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Paste or type original text here..."
              spellcheck="false"
            >function calculateTotal(items) {
  let total = 0;
  for (let item of items) {
    total += item.price;
  }
  return total;
}</textarea>
          </div>
          
          <div class="flex-1">
            <label for="right-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modified Text</label>
            <textarea 
              id="right-input" 
              class="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Paste or type modified text here..."
              spellcheck="false"
            >function calculateTotal(items, taxRate = 0) {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }
  const tax = subtotal * taxRate;
  return subtotal + tax;
}</textarea>
          </div>
        </div>
        
        <div class="mt-8">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Diff Output</h3>
          <div id="diff-result" class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm overflow-auto max-h-96"></div>
        </div>
      </div>
    `;
    
    this.leftInput = this.container.querySelector('#left-input');
    this.rightInput = this.container.querySelector('#right-input');
    this.outputArea = this.container.querySelector('#diff-result');
  }
  
  attachEventListeners() {
    // View mode toggle
    this.container.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setViewMode(btn.dataset.view);
        this.computeDiff();
      });
    });
    
    // Action buttons
    this.container.querySelector('[data-action="swap"]').addEventListener('click', () => this.swap());
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Input changes
    this.leftInput.addEventListener('input', () => this.computeDiff());
    this.rightInput.addEventListener('input', () => this.computeDiff());
  }
  
  loadExample() {
    this.computeDiff();
  }
  
  setViewMode(mode) {
    this.viewMode = mode;
    
    // Update button states
    this.container.querySelectorAll('[data-view]').forEach(btn => {
      if (btn.dataset.view === mode) {
        btn.className = 'px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
        if (btn.dataset.view === 'unified') btn.className += ' rounded-l-lg';
        else if (btn.dataset.view === 'inline') btn.className += ' rounded-r-lg';
      } else {
        btn.className = 'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
        if (btn.dataset.view === 'unified') btn.className += ' rounded-l-lg';
        else if (btn.dataset.view === 'inline') btn.className += ' rounded-r-lg';
      }
    });
    
    // Update output class
    this.outputArea.className = `diff-result ${mode}`;
  }
  
  computeDiff() {
    const leftText = this.leftInput.value;
    const rightText = this.rightInput.value;
    
    if (!leftText && !rightText) {
      this.outputArea.innerHTML = '<div class="no-diff">Enter text to compare</div>';
      this.updateStats(0, 0, 0);
      return;
    }
    
    // Clear any pending timeout
    if (this.computeTimeout) {
      clearTimeout(this.computeTimeout);
    }
    
    // Debounce computation for large texts
    this.computeTimeout = setTimeout(() => {
      // Show loading state for large texts
      const isLargeText = leftText.length > 10000 || rightText.length > 10000;
      if (isLargeText) {
        this.outputArea.innerHTML = '<div class="loading">Computing diff...</div>';
      }
      
      // Use Web Worker if available for better performance
      if (this.diffWorker) {
        this.diffWorker.postMessage({
          type: 'COMPUTE_DIFF',
          data: {
            text1: leftText,
            text2: rightText,
            options: {
              format: this.viewMode,
              contextLines: 3
            }
          }
        });
      } else {
        // Fallback to main thread computation
        this.computeDiffFallback(leftText, rightText);
      }
    }, 300);
  }
  
  computeDiffFallback(leftText, rightText) {
    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');
    
    // Compute diff using Myers algorithm (simplified)
    const diff = this.computeLineDiff(leftLines, rightLines);
    
    // Update statistics
    const stats = this.calculateStats(diff);
    this.updateStats(stats.changes, stats.added, stats.removed);
    
    // Render diff based on view mode
    switch (this.viewMode) {
      case 'unified':
        this.renderUnifiedDiff(diff);
        break;
      case 'split':
        this.renderSplitDiff(diff);
        break;
      case 'inline':
        this.renderInlineDiff(diff);
        break;
    }
  }
  
  handleWorkerMessage(event) {
    const { type, diff } = event.data;
    
    if (type === 'DIFF_RESULT') {
      // Process the diff result from worker
      if (diff.type === 'unified') {
        this.renderUnifiedDiffFromWorker(diff);
      } else if (diff.type === 'side-by-side') {
        this.renderSplitDiffFromWorker(diff);
      } else if (diff.type === 'inline') {
        this.renderInlineDiffFromWorker(diff);
      }
      
      // Update statistics
      this.updateStatsFromWorkerDiff(diff);
    }
  }
  
  renderUnifiedDiffFromWorker(diff) {
    let html = '';
    
    diff.hunks.forEach(hunk => {
      html += `<div class="mb-4">`;
      html += `<div class="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">@@ -${hunk.oldStart} +${hunk.newStart} @@</div>`;
      
      hunk.lines.forEach(line => {
        const escaped = this.escapeHtml(line.line);
        const isDelete = line.type === 'delete';
        const isInsert = line.type === 'insert';
        const marker = isDelete ? '-' : isInsert ? '+' : ' ';
        
        const bgClass = isDelete ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 
                       isInsert ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 
                       'text-gray-600 dark:text-gray-400';
        const borderClass = isDelete ? 'border-l-4 border-red-500' : 
                           isInsert ? 'border-l-4 border-green-500' : '';
        
        html += `<div class="font-mono text-sm ${bgClass} ${borderClass} px-2 py-1">
          <span class="inline-block w-4 text-center">${marker}</span>
          <span>${escaped}</span>
        </div>`;
      });
      
      html += '</div>';
    });
    
    this.outputArea.innerHTML = html || '<div class="text-gray-500 dark:text-gray-400 text-center py-8">No differences found</div>';
  }
  
  renderSplitDiffFromWorker(diff) {
    let html = '<div class="diff-split-container">';
    
    diff.lines.forEach(line => {
      const leftEscaped = this.escapeHtml(line.left.text);
      const rightEscaped = this.escapeHtml(line.right.text);
      
      html += `<div class="diff-split-row">
        <div class="diff-split-cell diff-${line.left.type}">
          ${line.left.number ? `<span class="line-num">${line.left.number}</span>` : ''}
          <span class="line-content">${leftEscaped}</span>
        </div>
        <div class="diff-split-cell diff-${line.right.type}">
          ${line.right.number ? `<span class="line-num">${line.right.number}</span>` : ''}
          <span class="line-content">${rightEscaped}</span>
        </div>
      </div>`;
    });
    
    html += '</div>';
    this.outputArea.innerHTML = html;
  }
  
  renderInlineDiffFromWorker(diff) {
    let html = '';
    
    diff.changes.forEach(change => {
      const escaped = this.escapeHtml(change.value);
      const className = change.type === 'delete' ? 'diff-remove' : 
                       change.type === 'insert' ? 'diff-add' : 'diff-equal';
      
      html += `<span class="diff-inline ${className}">${escaped}</span>`;
    });
    
    this.outputArea.innerHTML = html || '<div class="no-diff">No differences found</div>';
  }
  
  updateStatsFromWorkerDiff(diff) {
    let added = 0;
    let removed = 0;
    
    if (diff.type === 'unified') {
      diff.hunks.forEach(hunk => {
        hunk.lines.forEach(line => {
          if (line.type === 'insert') added++;
          if (line.type === 'delete') removed++;
        });
      });
    } else if (diff.type === 'side-by-side') {
      diff.lines.forEach(line => {
        if (line.left.type === 'delete') removed++;
        if (line.right.type === 'insert') added++;
      });
    } else if (diff.type === 'inline') {
      diff.changes.forEach(change => {
        if (change.type === 'insert') added++;
        if (change.type === 'delete') removed++;
      });
    }
    
    this.updateStats(added + removed, added, removed);
  }
  
  computeLineDiff(leftLines, rightLines) {
    const diff = [];
    const lcs = this.longestCommonSubsequence(leftLines, rightLines);
    
    let i = 0, j = 0, k = 0;
    
    while (i < leftLines.length || j < rightLines.length) {
      if (k < lcs.length && i < leftLines.length && j < rightLines.length && 
          leftLines[i] === lcs[k] && rightLines[j] === lcs[k]) {
        // Common line
        diff.push({
          type: 'equal',
          value: leftLines[i],
          leftNum: i + 1,
          rightNum: j + 1
        });
        i++;
        j++;
        k++;
      } else if (i < leftLines.length && (k >= lcs.length || leftLines[i] !== lcs[k])) {
        // Removed line
        diff.push({
          type: 'remove',
          value: leftLines[i],
          leftNum: i + 1
        });
        i++;
      } else if (j < rightLines.length && (k >= lcs.length || rightLines[j] !== lcs[k])) {
        // Added line
        diff.push({
          type: 'add',
          value: rightLines[j],
          rightNum: j + 1
        });
        j++;
      }
    }
    
    return diff;
  }
  
  longestCommonSubsequence(arr1, arr2) {
    const m = arr1.length;
    const n = arr2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Reconstruct LCS
    const lcs = [];
    let i = m, j = n;
    
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        lcs.unshift(arr1[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    return lcs;
  }
  
  calculateStats(diff) {
    let added = 0;
    let removed = 0;
    
    diff.forEach(line => {
      if (line.type === 'add') added++;
      if (line.type === 'remove') removed++;
    });
    
    return {
      changes: added + removed,
      added,
      removed
    };
  }
  
  updateStats(changes, added, removed) {
    this.container.querySelector('#stat-changes').textContent = changes;
    this.container.querySelector('#stat-added').textContent = `+${added}`;
    this.container.querySelector('#stat-removed').textContent = `-${removed}`;
  }
  
  renderUnifiedDiff(diff) {
    const html = diff.map(line => {
      const escaped = this.escapeHtml(line.value);
      const lineNum = line.leftNum || line.rightNum || '';
      
      switch (line.type) {
        case 'add':
          return `<div class="diff-line diff-add">
            <span class="line-num">${lineNum}</span>
            <span class="line-marker">+</span>
            <span class="line-content">${escaped}</span>
          </div>`;
        case 'remove':
          return `<div class="diff-line diff-remove">
            <span class="line-num">${lineNum}</span>
            <span class="line-marker">-</span>
            <span class="line-content">${escaped}</span>
          </div>`;
        case 'equal':
          return `<div class="diff-line diff-equal">
            <span class="line-num">${lineNum}</span>
            <span class="line-marker"> </span>
            <span class="line-content">${escaped}</span>
          </div>`;
      }
    }).join('');
    
    this.outputArea.innerHTML = html || '<div class="no-diff">No differences found</div>';
  }
  
  renderSplitDiff(diff) {
    const leftLines = [];
    const rightLines = [];
    
    diff.forEach(line => {
      const escaped = this.escapeHtml(line.value);
      
      switch (line.type) {
        case 'add':
          leftLines.push(`<div class="diff-line diff-empty">
            <span class="line-num"></span>
            <span class="line-content"></span>
          </div>`);
          rightLines.push(`<div class="diff-line diff-add">
            <span class="line-num">${line.rightNum}</span>
            <span class="line-content">${escaped}</span>
          </div>`);
          break;
        case 'remove':
          leftLines.push(`<div class="diff-line diff-remove">
            <span class="line-num">${line.leftNum}</span>
            <span class="line-content">${escaped}</span>
          </div>`);
          rightLines.push(`<div class="diff-line diff-empty">
            <span class="line-num"></span>
            <span class="line-content"></span>
          </div>`);
          break;
        case 'equal':
          leftLines.push(`<div class="diff-line diff-equal">
            <span class="line-num">${line.leftNum}</span>
            <span class="line-content">${escaped}</span>
          </div>`);
          rightLines.push(`<div class="diff-line diff-equal">
            <span class="line-num">${line.rightNum}</span>
            <span class="line-content">${escaped}</span>
          </div>`);
          break;
      }
    });
    
    const html = `
      <div class="split-view">
        <div class="split-pane split-left">
          <div class="split-header">Original</div>
          <div class="split-content">${leftLines.join('')}</div>
        </div>
        <div class="split-pane split-right">
          <div class="split-header">Modified</div>
          <div class="split-content">${rightLines.join('')}</div>
        </div>
      </div>
    `;
    
    this.outputArea.innerHTML = html;
  }
  
  renderInlineDiff(diff) {
    const lines = [];
    let currentGroup = [];
    let currentType = null;
    
    diff.forEach((line, index) => {
      if (line.type !== currentType) {
        if (currentGroup.length > 0) {
          lines.push(this.renderInlineGroup(currentGroup, currentType));
        }
        currentGroup = [line];
        currentType = line.type;
      } else {
        currentGroup.push(line);
      }
      
      if (index === diff.length - 1 && currentGroup.length > 0) {
        lines.push(this.renderInlineGroup(currentGroup, currentType));
      }
    });
    
    this.outputArea.innerHTML = lines.join('') || '<div class="no-diff">No differences found</div>';
  }
  
  renderInlineGroup(group, type) {
    if (type === 'equal') {
      return group.map(line => `
        <div class="diff-line diff-equal">
          <span class="line-num">${line.leftNum || line.rightNum}</span>
          <span class="line-marker"> </span>
          <span class="line-content">${this.escapeHtml(line.value)}</span>
        </div>
      `).join('');
    }
    
    const className = type === 'add' ? 'diff-add' : 'diff-remove';
    const marker = type === 'add' ? '+' : '-';
    
    return `<div class="diff-block diff-block-${type}">
      ${group.map(line => `
        <div class="diff-line ${className}">
          <span class="line-num">${line.leftNum || line.rightNum || ''}</span>
          <span class="line-marker">${marker}</span>
          <span class="line-content">${this.escapeHtml(line.value)}</span>
        </div>
      `).join('')}
    </div>`;
  }
  
  swap() {
    const temp = this.leftInput.value;
    this.leftInput.value = this.rightInput.value;
    this.rightInput.value = temp;
    this.computeDiff();
  }
  
  clear() {
    this.leftInput.value = '';
    this.rightInput.value = '';
    this.outputArea.innerHTML = '<div class="no-diff">Enter text to compare</div>';
    this.updateStats(0, 0, 0);
  }
  
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}