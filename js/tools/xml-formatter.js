export class XMLFormatter {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.validationResult = null;
    this.formatOptions = {
      indent: 2,
      preserveComments: true,
      expandEmptyElements: false
    };
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.loadExample();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1>XML Formatter & Validator</h1>
          <p class="tool-description">Format, validate, and minify XML documents</p>
        </div>
        
        <div class="tool-controls">
          <div class="control-group">
            <label for="indent-size">Indent Size:</label>
            <select id="indent-size" class="select-input">
              <option value="2" selected>2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="\t">Tab</option>
            </select>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" data-action="format">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="21" y1="10" x2="7" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="21" y1="18" x2="7" y2="18"></line>
              </svg>
              Format XML
            </button>
            <button class="btn btn-secondary" data-action="validate">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Validate
            </button>
            <button class="btn btn-secondary" data-action="minify">Minify</button>
            <button class="btn btn-secondary" data-action="clear">Clear</button>
          </div>
        </div>
        
        <div class="format-options">
          <label class="checkbox-label">
            <input type="checkbox" id="preserve-comments" checked>
            <span>Preserve Comments</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="expand-empty">
            <span>Expand Empty Elements</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="sort-attributes">
            <span>Sort Attributes</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="highlight-syntax">
            <span>Syntax Highlighting</span>
          </label>
        </div>
        
        <div class="validation-result" id="validation-result" hidden></div>
        
        <div class="input-output-container">
          <div class="input-section">
            <div class="section-header">
              <label for="xml-input">Input XML</label>
              <button class="btn-icon" data-action="paste" title="Paste from clipboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="xml-input" 
              class="code-input" 
              placeholder="Paste or type your XML here..."
              spellcheck="false"
            ><?xml version="1.0" encoding="UTF-8"?><catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer's Guide</title><genre>Computer</genre><price>44.95</price><publish_date>2000-10-01</publish_date><description>An in-depth look at creating applications with XML.</description></book><book id="bk102"><author>Ralls, Kim</author><title>Midnight Rain</title><genre>Fantasy</genre><price>5.95</price><publish_date>2000-12-16</publish_date><description>A former architect battles corporate zombies.</description></book></catalog></textarea>
            <div class="input-stats">
              <span data-stat="elements">0 elements</span>
              <span data-stat="attributes">0 attributes</span>
              <span data-stat="size">0 bytes</span>
            </div>
          </div>
          
          <div class="output-section">
            <div class="section-header">
              <label for="xml-output">Formatted XML</label>
              <button class="btn-icon" data-action="copy" title="Copy to clipboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <div id="xml-output" class="code-output xml-syntax"></div>
            <div class="output-actions">
              <button class="btn btn-sm" data-action="download">Download XML</button>
              <button class="btn btn-sm" data-action="tree">Tree View</button>
              <button class="btn btn-sm" data-action="xpath">XPath Tester</button>
            </div>
          </div>
        </div>
        
        <div class="xml-tree" id="xml-tree" hidden>
          <h3>Tree View</h3>
          <div class="tree-content"></div>
        </div>
        
        <div class="xpath-tester" id="xpath-tester" hidden>
          <h3>XPath Tester</h3>
          <div class="xpath-controls">
            <input type="text" id="xpath-input" class="input-field" placeholder="Enter XPath expression (e.g., //book[@id='bk101']/title)">
            <button class="btn btn-sm" data-action="test-xpath">Test XPath</button>
          </div>
          <div class="xpath-results" id="xpath-results"></div>
        </div>
      </div>
    `;
    
    this.inputArea = this.container.querySelector('#xml-input');
    this.outputArea = this.container.querySelector('#xml-output');
    this.validationResult = this.container.querySelector('#validation-result');
  }
  
  attachEventListeners() {
    // Action buttons
    this.container.querySelector('[data-action="format"]').addEventListener('click', () => this.formatXML());
    this.container.querySelector('[data-action="validate"]').addEventListener('click', () => this.validateXML());
    this.container.querySelector('[data-action="minify"]').addEventListener('click', () => this.minifyXML());
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => this.copyOutput());
    this.container.querySelector('[data-action="paste"]').addEventListener('click', () => this.pasteInput());
    this.container.querySelector('[data-action="download"]').addEventListener('click', () => this.downloadXML());
    this.container.querySelector('[data-action="tree"]').addEventListener('click', () => this.toggleTreeView());
    this.container.querySelector('[data-action="xpath"]').addEventListener('click', () => this.toggleXPathTester());
    this.container.querySelector('[data-action="test-xpath"]').addEventListener('click', () => this.testXPath());
    
    // Options change
    this.container.querySelector('#indent-size').addEventListener('change', () => this.formatXML());
    this.container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => this.formatXML());
    });
    
    // Auto-format on input with debounce
    let formatTimeout;
    this.inputArea.addEventListener('input', () => {
      this.updateStats();
      clearTimeout(formatTimeout);
      formatTimeout = setTimeout(() => {
        this.formatXML();
        this.validateXML(false);
      }, 500);
    });
  }
  
  loadExample() {
    this.updateStats();
    this.formatXML();
    this.validateXML(false);
  }
  
  formatXML() {
    const xml = this.inputArea.value.trim();
    if (!xml) {
      this.outputArea.textContent = '';
      return;
    }
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error(parserError.textContent);
      }
      
      // Get formatting options
      const indentValue = this.container.querySelector('#indent-size').value;
      const indent = indentValue === '\t' ? '\t' : ' '.repeat(parseInt(indentValue));
      const preserveComments = this.container.querySelector('#preserve-comments').checked;
      const expandEmpty = this.container.querySelector('#expand-empty').checked;
      const sortAttributes = this.container.querySelector('#sort-attributes').checked;
      const syntaxHighlight = this.container.querySelector('#highlight-syntax').checked;
      
      // Format the XML
      const formatted = this.serializeXML(doc.documentElement, {
        indent,
        preserveComments,
        expandEmpty,
        sortAttributes,
        level: 0
      });
      
      // Add XML declaration if present in original
      let result = formatted;
      if (xml.startsWith('<?xml')) {
        const declMatch = xml.match(/<\?xml[^?]*\?>/);
        if (declMatch) {
          result = declMatch[0] + '\n' + formatted;
        }
      }
      
      // Display with or without syntax highlighting
      if (syntaxHighlight) {
        this.outputArea.innerHTML = this.highlightXML(result);
      } else {
        this.outputArea.textContent = result;
      }
    } catch (error) {
      this.outputArea.textContent = `Error: ${error.message}`;
      this.outputArea.classList.add('error');
    }
  }
  
  serializeXML(node, options) {
    const { indent, level, preserveComments, expandEmpty, sortAttributes } = options;
    const indentStr = indent.repeat(level);
    let result = '';
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      result += `${indentStr}<${node.tagName}`;
      
      // Add attributes
      const attrs = Array.from(node.attributes);
      if (sortAttributes) {
        attrs.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      attrs.forEach(attr => {
        result += ` ${attr.name}="${this.escapeXML(attr.value)}"`;
      });
      
      // Handle empty elements
      if (!node.hasChildNodes()) {
        if (expandEmpty) {
          result += `></${node.tagName}>`;
        } else {
          result += '/>';
        }
        return result;
      }
      
      result += '>';
      
      // Check if element has only text content
      const hasOnlyText = node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE;
      
      if (hasOnlyText) {
        result += this.escapeXML(node.textContent);
        result += `</${node.tagName}>`;
      } else {
        result += '\n';
        
        // Process child nodes
        Array.from(node.childNodes).forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            result += this.serializeXML(child, { ...options, level: level + 1 });
            result += '\n';
          } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent.trim();
            if (text) {
              result += `${indent.repeat(level + 1)}${this.escapeXML(text)}\n`;
            }
          } else if (child.nodeType === Node.COMMENT_NODE && preserveComments) {
            result += `${indent.repeat(level + 1)}<!--${child.textContent}-->\n`;
          }
        });
        
        result += `${indentStr}</${node.tagName}>`;
      }
    }
    
    return result;
  }
  
  escapeXML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  highlightXML(xml) {
    return xml
      .replace(/(&lt;\/?[\w:.-]+)/g, '<span class="xml-tag">$1</span>')
      .replace(/([\w:.-]+)(\s*=\s*"[^"]*")/g, '<span class="xml-attr">$1</span><span class="xml-value">$2</span>')
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>')
      .replace(/(&lt;\?[\s\S]*?\?&gt;)/g, '<span class="xml-declaration">$1</span>')
      .replace(/(&gt;)([^&<]+)(&lt;)/g, '$1<span class="xml-text">$2</span>$3');
  }
  
  validateXML(showSuccess = true) {
    const xml = this.inputArea.value.trim();
    if (!xml) {
      this.validationResult.hidden = true;
      return;
    }
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        this.showValidationError(parserError.textContent);
        return false;
      }
      
      // Validate structure
      const validation = this.validateStructure(doc);
      if (!validation.valid) {
        this.showValidationError(validation.error);
        return false;
      }
      
      if (showSuccess) {
        this.showValidationSuccess();
      } else {
        this.validationResult.hidden = true;
      }
      return true;
    } catch (error) {
      this.showValidationError(error.message);
      return false;
    }
  }
  
  validateStructure(doc) {
    // Check for multiple root elements
    const rootElements = Array.from(doc.childNodes).filter(n => n.nodeType === Node.ELEMENT_NODE);
    if (rootElements.length > 1) {
      return { valid: false, error: 'XML must have only one root element' };
    }
    
    // Check for well-formedness
    const stack = [doc.documentElement];
    while (stack.length > 0) {
      const node = stack.pop();
      
      // Check element names
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (!/^[a-zA-Z_][\w.-]*$/.test(node.tagName)) {
          return { valid: false, error: `Invalid element name: ${node.tagName}` };
        }
        
        // Check attribute names
        Array.from(node.attributes).forEach(attr => {
          if (!/^[a-zA-Z_][\w.-]*$/.test(attr.name)) {
            return { valid: false, error: `Invalid attribute name: ${attr.name}` };
          }
        });
        
        // Add children to stack
        Array.from(node.childNodes).forEach(child => stack.push(child));
      }
    }
    
    return { valid: true };
  }
  
  showValidationSuccess() {
    this.validationResult.innerHTML = `
      <div class="validation-success">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Valid XML document
      </div>
    `;
    this.validationResult.hidden = false;
  }
  
  showValidationError(error) {
    this.validationResult.innerHTML = `
      <div class="validation-error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        ${error}
      </div>
    `;
    this.validationResult.hidden = false;
  }
  
  minifyXML() {
    const xml = this.inputArea.value.trim();
    if (!xml) {
      this.outputArea.textContent = '';
      return;
    }
    
    try {
      // Remove comments, whitespace between tags
      const minified = xml
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
      
      this.outputArea.textContent = minified;
    } catch (error) {
      this.outputArea.textContent = `Error: ${error.message}`;
    }
  }
  
  toggleTreeView() {
    const treeEl = this.container.querySelector('#xml-tree');
    const isHidden = treeEl.hidden;
    
    if (isHidden) {
      this.renderTreeView();
      treeEl.hidden = false;
    } else {
      treeEl.hidden = true;
    }
  }
  
  renderTreeView() {
    const xml = this.inputArea.value.trim();
    if (!xml) return;
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error(parserError.textContent);
      }
      
      const treeContent = this.container.querySelector('.tree-content');
      treeContent.innerHTML = this.buildTreeHTML(doc.documentElement, 0);
    } catch (error) {
      const treeContent = this.container.querySelector('.tree-content');
      treeContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
  }
  
  buildTreeHTML(node, level) {
    const indent = '  '.repeat(level);
    let html = '';
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      html += `<div class="tree-node" style="margin-left: ${level * 20}px">`;
      html += `<span class="tree-element">&lt;${node.tagName}`;
      
      // Add attributes
      Array.from(node.attributes).forEach(attr => {
        html += ` <span class="tree-attr">${attr.name}="${attr.value}"</span>`;
      });
      
      html += '&gt;</span>';
      
      // Process children
      if (node.hasChildNodes()) {
        Array.from(node.childNodes).forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            html += this.buildTreeHTML(child, level + 1);
          } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent.trim();
            if (text) {
              html += `<div class="tree-text" style="margin-left: ${(level + 1) * 20}px">${text}</div>`;
            }
          }
        });
      }
      
      html += '</div>';
    }
    
    return html;
  }
  
  toggleXPathTester() {
    const xpathEl = this.container.querySelector('#xpath-tester');
    xpathEl.hidden = !xpathEl.hidden;
  }
  
  testXPath() {
    const xml = this.inputArea.value.trim();
    const xpath = this.container.querySelector('#xpath-input').value.trim();
    
    if (!xml || !xpath) return;
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error(parserError.textContent);
      }
      
      const evaluator = new XPathEvaluator();
      const result = evaluator.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
      
      const resultsEl = this.container.querySelector('#xpath-results');
      const matches = [];
      let node;
      
      while ((node = result.iterateNext())) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          matches.push(`<${node.tagName}>${node.textContent}</${node.tagName}>`);
        } else if (node.nodeType === Node.ATTRIBUTE_NODE) {
          matches.push(`${node.name}="${node.value}"`);
        } else {
          matches.push(node.textContent);
        }
      }
      
      if (matches.length > 0) {
        resultsEl.innerHTML = `
          <div class="xpath-matches">
            <strong>Found ${matches.length} match${matches.length !== 1 ? 'es' : ''}:</strong>
            <ul>
              ${matches.map(m => `<li><code>${this.escapeHTML(m)}</code></li>`).join('')}
            </ul>
          </div>
        `;
      } else {
        resultsEl.innerHTML = '<div class="xpath-no-matches">No matches found</div>';
      }
    } catch (error) {
      const resultsEl = this.container.querySelector('#xpath-results');
      resultsEl.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
  }
  
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  updateStats() {
    const xml = this.inputArea.value;
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      
      const parserError = doc.querySelector('parsererror');
      if (!parserError) {
        const elements = doc.getElementsByTagName('*').length;
        let attributes = 0;
        Array.from(doc.getElementsByTagName('*')).forEach(el => {
          attributes += el.attributes.length;
        });
        
        this.container.querySelector('[data-stat="elements"]').textContent = `${elements} element${elements !== 1 ? 's' : ''}`;
        this.container.querySelector('[data-stat="attributes"]').textContent = `${attributes} attribute${attributes !== 1 ? 's' : ''}`;
      }
    } catch (e) {
      // Ignore parse errors for stats
    }
    
    const bytes = new Blob([xml]).size;
    this.container.querySelector('[data-stat="size"]').textContent = `${bytes} bytes`;
  }
  
  async copyOutput() {
    const text = this.outputArea.textContent;
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '✓';
      btn.style.color = 'var(--color-success)';
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.color = '';
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }
  
  async pasteInput() {
    try {
      const text = await navigator.clipboard.readText();
      this.inputArea.value = text;
      this.updateStats();
      this.formatXML();
      this.validateXML(false);
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  }
  
  downloadXML() {
    const xml = this.outputArea.textContent || this.inputArea.value;
    if (!xml) return;
    
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.xml';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  clear() {
    this.inputArea.value = '';
    this.outputArea.textContent = '';
    this.validationResult.hidden = true;
    this.container.querySelector('#xml-tree').hidden = true;
    this.container.querySelector('#xpath-tester').hidden = true;
    this.updateStats();
  }
}