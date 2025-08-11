export class MarkdownPreview {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.errorDisplay = null;
    this.viewMode = 'split';
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1>Markdown Preview</h1>
          <p class="tool-description">Live markdown rendering with syntax highlighting and GitHub flavored markdown support</p>
        </div>
        
        <div class="tool-controls">
          <div class="view-toggle">
            <button class="btn btn-secondary" data-view="edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button class="btn btn-primary" data-view="split">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="12" y1="3" x2="12" y2="21"/>
              </svg>
              Split
            </button>
            <button class="btn btn-secondary" data-view="preview">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview
            </button>
          </div>
          <div class="action-buttons">
            <button class="btn btn-secondary" data-action="copy-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy MD
            </button>
            <button class="btn btn-secondary" data-action="copy-html">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              Copy HTML
            </button>
            <button class="btn btn-secondary" data-action="clear">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear
            </button>
          </div>
        </div>
        
        <div class="markdown-toolbar">
          <button class="toolbar-btn" data-format="bold" title="Bold (Ctrl+B)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-format="italic" title="Italic (Ctrl+I)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="4" x2="10" y2="4"/>
              <line x1="14" y1="20" x2="5" y2="20"/>
              <line x1="15" y1="4" x2="9" y2="20"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-format="strikethrough" title="Strikethrough">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="12" x2="20" y2="12"/>
              <path d="M7.5 7.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 1.5-.5 2.5-2 3.5"/>
              <path d="M16.5 16.5c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5"/>
            </svg>
          </button>
          <div class="toolbar-separator"></div>
          <button class="toolbar-btn" data-format="h1" title="Heading 1">H1</button>
          <button class="toolbar-btn" data-format="h2" title="Heading 2">H2</button>
          <button class="toolbar-btn" data-format="h3" title="Heading 3">H3</button>
          <div class="toolbar-separator"></div>
          <button class="toolbar-btn" data-format="ul" title="Unordered List">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-format="ol" title="Ordered List">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="10" y1="6" x2="21" y2="6"/>
              <line x1="10" y1="12" x2="21" y2="12"/>
              <line x1="10" y1="18" x2="21" y2="18"/>
              <path d="M4 6h1v4"/>
              <path d="M4 10h2"/>
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-format="checklist" title="Checklist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </button>
          <div class="toolbar-separator"></div>
          <button class="toolbar-btn" data-format="link" title="Link (Ctrl+K)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-format="image" title="Image">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-format="code" title="Inline Code">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-format="codeblock" title="Code Block">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M8 12h.01M12 12h.01M16 12h.01"/>
            </svg>
          </button>
          <div class="toolbar-separator"></div>
          <button class="toolbar-btn" data-format="quote" title="Blockquote">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-format="hr" title="Horizontal Rule">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-format="table" title="Table">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
              <line x1="12" y1="3" x2="12" y2="21"/>
            </svg>
          </button>
        </div>
        
        <div class="error-display" data-error hidden></div>
        
        <div class="markdown-content" data-view-mode="split">
          <div class="markdown-editor">
            <label for="markdown-input">Markdown</label>
            <textarea 
              id="markdown-input" 
              class="code-input markdown-input" 
              placeholder="Type your markdown here..."
              spellcheck="false"
            ># Welcome to Markdown Preview

This is a **live markdown editor** with *real-time preview*.

## Features

- 🚀 **Fast** - No external dependencies
- 🎨 **Syntax Highlighting** - Code blocks with highlighting
- 📱 **Responsive** - Works on all devices
- 🔒 **Private** - Everything runs locally

## Formatting Examples

### Text Formatting

You can make text **bold**, *italic*, ~~strikethrough~~, or \`inline code\`.

### Lists

#### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

#### Ordered List
1. First step
2. Second step
3. Third step

#### Checklist
- [x] Completed task
- [ ] Pending task
- [ ] Another task

### Blockquote

> "The best way to predict the future is to invent it."
> 
> — Alan Kay

### Code Block

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
\`\`\`

### Table

| Feature | Description | Status |
|---------|-------------|---------|
| Markdown | Parse and render | ✅ Done |
| GFM | GitHub Flavored | ✅ Done |
| Themes | Dark/Light | ✅ Done |

### Links and Images

[Visit GitHub](https://github.com) or add an image:

![Placeholder](https://via.placeholder.com/150)

---

*Happy writing!* 🎉</textarea>
            <div class="editor-stats">
              <span data-stat="words">0 words</span>
              <span data-stat="chars">0 characters</span>
              <span data-stat="lines">0 lines</span>
            </div>
          </div>
          
          <div class="markdown-preview">
            <label>Preview</label>
            <div id="markdown-output" class="markdown-output"></div>
          </div>
        </div>
      </div>
    `;
    
    // Get references to elements
    this.inputArea = this.container.querySelector('#markdown-input');
    this.outputArea = this.container.querySelector('#markdown-output');
    this.errorDisplay = this.container.querySelector('[data-error]');
  }
  
  attachEventListeners() {
    // View mode toggle
    this.container.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setViewMode(btn.dataset.view);
      });
    });
    
    // Toolbar buttons
    this.container.querySelectorAll('[data-format]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyFormat(btn.dataset.format);
      });
    });
    
    // Action buttons
    this.container.querySelector('[data-action="copy-md"]').addEventListener('click', () => this.copyMarkdown());
    this.container.querySelector('[data-action="copy-html"]').addEventListener('click', () => this.copyHTML());
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Auto-render on input with debounce
    let renderTimeout;
    this.inputArea.addEventListener('input', () => {
      clearTimeout(renderTimeout);
      renderTimeout = setTimeout(() => {
        this.renderMarkdown();
        this.updateStats();
      }, 150);
    });
    
    // Keyboard shortcuts
    this.inputArea.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'b':
            e.preventDefault();
            this.applyFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            this.applyFormat('italic');
            break;
          case 'k':
            e.preventDefault();
            this.applyFormat('link');
            break;
        }
      }
    });
    
    // Initial render
    this.renderMarkdown();
    this.updateStats();
  }
  
  setViewMode(mode) {
    this.viewMode = mode;
    const contentArea = this.container.querySelector('.markdown-content');
    contentArea.setAttribute('data-view-mode', mode);
    
    // Update button states
    this.container.querySelectorAll('[data-view]').forEach(btn => {
      if (btn.dataset.view === mode) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-secondary');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
      }
    });
  }
  
  renderMarkdown() {
    const markdown = this.inputArea.value;
    
    try {
      // Parse and render markdown
      const html = this.parseMarkdown(markdown);
      this.outputArea.innerHTML = html;
      
      // Highlight code blocks
      this.highlightCodeBlocks();
      
      this.clearError();
    } catch (error) {
      this.showError(`Rendering error: ${error.message}`);
    }
  }
  
  parseMarkdown(markdown) {
    let html = markdown;
    
    // Escape HTML
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'plaintext';
      return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
    });
    
    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');
    
    // Lists
    // Unordered lists
    html = html.replace(/^\* (.+)/gim, '<li>$1</li>');
    html = html.replace(/^- (.+)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Ordered lists
    html = html.replace(/^\d+\. (.+)/gim, '<li>$1</li>');
    
    // Checkboxes
    html = html.replace(/^\- \[x\] (.+)/gim, '<li><input type="checkbox" checked disabled> $1</li>');
    html = html.replace(/^\- \[ \] (.+)/gim, '<li><input type="checkbox" disabled> $1</li>');
    
    // Tables
    html = html.replace(/\|(.+)\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g, (match, headers, rows) => {
      const headerCells = headers.split('|').filter(h => h.trim()).map(h => `<th>${h.trim()}</th>`).join('');
      const rowsHtml = rows.trim().split('\n').map(row => {
        const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${headerCells}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
    });
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)/g, '$1');
    html = html.replace(/(<hr>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table>)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');
    
    return html;
  }
  
  highlightCodeBlocks() {
    this.outputArea.querySelectorAll('pre code').forEach(block => {
      const code = block.textContent;
      const lang = block.className.replace('language-', '');
      
      if (lang === 'javascript' || lang === 'js') {
        block.innerHTML = this.highlightJavaScript(code);
      } else if (lang === 'css') {
        block.innerHTML = this.highlightCSS(code);
      } else if (lang === 'html') {
        block.innerHTML = this.highlightHTML(code);
      } else if (lang === 'json') {
        block.innerHTML = this.highlightJSON(code);
      }
    });
  }
  
  highlightJavaScript(code) {
    return code
      // Keywords
      .replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|typeof|instanceof|this|class|extends|static|async|await|import|export|from|default)\b/g, '<span class="keyword">$1</span>')
      // Strings
      .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
      // Comments
      .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
  }
  
  highlightCSS(code) {
    return code
      // Selectors
      .replace(/([.#]?[a-zA-Z0-9_-]+)\s*{/g, '<span class="selector">$1</span>{')
      // Properties
      .replace(/([a-zA-Z-]+):/g, '<span class="property">$1</span>:')
      // Values
      .replace(/:\s*([^;]+);/g, ': <span class="value">$1</span>;')
      // Comments
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
  }
  
  highlightHTML(code) {
    return code
      // Tags
      .replace(/(&lt;\/?[a-zA-Z0-9]+)/g, '<span class="tag">$1</span>')
      // Attributes
      .replace(/([a-zA-Z-]+)=/g, '<span class="attribute">$1</span>=')
      // Strings
      .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>')
      // Comments
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="comment">$1</span>');
  }
  
  highlightJSON(code) {
    return code
      .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
  }
  
  applyFormat(format) {
    const textarea = this.inputArea;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let replacement = '';
    let cursorOffset = 0;
    
    switch(format) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case 'strikethrough':
        replacement = `~~${selectedText || 'strikethrough'}~~`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case 'h1':
        replacement = `# ${selectedText || 'Heading 1'}`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case 'h2':
        replacement = `## ${selectedText || 'Heading 2'}`;
        cursorOffset = selectedText ? replacement.length : 3;
        break;
      case 'h3':
        replacement = `### ${selectedText || 'Heading 3'}`;
        cursorOffset = selectedText ? replacement.length : 4;
        break;
      case 'ul':
        replacement = `- ${selectedText || 'List item'}`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case 'ol':
        replacement = `1. ${selectedText || 'List item'}`;
        cursorOffset = selectedText ? replacement.length : 3;
        break;
      case 'checklist':
        replacement = `- [ ] ${selectedText || 'Task'}`;
        cursorOffset = selectedText ? replacement.length : 6;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`;
        cursorOffset = selectedText ? replacement.length - 4 : 1;
        break;
      case 'image':
        replacement = `![${selectedText || 'alt text'}](image-url)`;
        cursorOffset = selectedText ? replacement.length - 10 : 2;
        break;
      case 'code':
        replacement = `\`${selectedText || 'code'}\``;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case 'codeblock':
        replacement = `\`\`\`\n${selectedText || 'code'}\n\`\`\``;
        cursorOffset = selectedText ? 4 : 4;
        break;
      case 'quote':
        replacement = `> ${selectedText || 'Quote'}`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case 'hr':
        replacement = '\n---\n';
        cursorOffset = replacement.length;
        break;
      case 'table':
        replacement = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
        cursorOffset = 2;
        break;
    }
    
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.selectionStart = start + cursorOffset;
    textarea.selectionEnd = start + cursorOffset;
    textarea.focus();
    
    // Trigger render
    this.renderMarkdown();
    this.updateStats();
  }
  
  updateStats() {
    const text = this.inputArea.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    
    this.container.querySelector('[data-stat="words"]').textContent = `${words} words`;
    this.container.querySelector('[data-stat="chars"]').textContent = `${chars} characters`;
    this.container.querySelector('[data-stat="lines"]').textContent = `${lines} lines`;
  }
  
  copyMarkdown() {
    const markdown = this.inputArea.value;
    if (!markdown) {
      this.showError('Nothing to copy');
      return;
    }
    
    navigator.clipboard.writeText(markdown).then(() => {
      const btn = this.container.querySelector('[data-action="copy-md"]');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('btn-success');
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    });
  }
  
  copyHTML() {
    const html = this.outputArea.innerHTML;
    if (!html) {
      this.showError('Nothing to copy');
      return;
    }
    
    navigator.clipboard.writeText(html).then(() => {
      const btn = this.container.querySelector('[data-action="copy-html"]');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('btn-success');
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    });
  }
  
  clear() {
    this.inputArea.value = '';
    this.outputArea.innerHTML = '';
    this.clearError();
    this.updateStats();
  }
  
  showError(message) {
    this.errorDisplay.textContent = message;
    this.errorDisplay.hidden = false;
  }
  
  clearError() {
    this.errorDisplay.textContent = '';
    this.errorDisplay.hidden = true;
  }
}