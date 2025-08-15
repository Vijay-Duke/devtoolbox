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
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">XML Formatter & Validator</h1>
          <p class="text-gray-600 dark:text-gray-300">Format, validate, and minify XML documents</p>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-4">
          <div>
            <label for="indent-size" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Indent Size:</label>
            <select id="indent-size" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="2" selected>2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="\t">Tab</option>
            </select>
          </div>
          
          <div class="flex gap-2 items-end">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="format">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="21" y1="10" x2="7" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="21" y1="18" x2="7" y2="18"></line>
              </svg>
              Format XML
            </button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="validate">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Validate
            </button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="minify">Minify</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="clear">Clear</button>
          </div>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-4">
          <label class="flex items-center">
            <input type="checkbox" id="preserve-comments" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
            <span class="text-sm text-gray-700 dark:text-gray-300">Preserve Comments</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" id="expand-empty" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
            <span class="text-sm text-gray-700 dark:text-gray-300">Expand Empty Elements</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" id="sort-attributes" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
            <span class="text-sm text-gray-700 dark:text-gray-300">Sort Attributes</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" id="highlight-syntax" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
            <span class="text-sm text-gray-700 dark:text-gray-300">Syntax Highlighting</span>
          </label>
        </div>
        
        <div class="mb-4 p-4 rounded-lg" id="validation-result" hidden></div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="xml-input" class="text-sm font-medium text-gray-700 dark:text-gray-300">Input XML</label>
              <button class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" data-action="paste" title="Paste from clipboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="xml-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
              placeholder="Paste or type your XML here..."
              spellcheck="false"
              rows="10"
            ><?xml version="1.0" encoding="UTF-8"?><catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer's Guide</title><genre>Computer</genre><price>44.95</price><publish_date>2000-10-01</publish_date><description>An in-depth look at creating applications with XML.</description></book><book id="bk102"><author>Ralls, Kim</author><title>Midnight Rain</title><genre>Fantasy</genre><price>5.95</price><publish_date>2000-12-16</publish_date><description>A former architect battles corporate zombies.</description></book></catalog></textarea>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-400 flex gap-4">
              <span data-stat="elements">0 elements</span>
              <span data-stat="attributes">0 attributes</span>
              <span data-stat="size">0 bytes</span>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="xml-output" class="text-sm font-medium text-gray-700 dark:text-gray-300">Formatted XML</label>
              <button class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" data-action="copy" title="Copy to clipboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="xml-output" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
              readonly
              spellcheck="false"
              rows="10"
            ></textarea>
            <div class="mt-2 flex gap-2">
              <button class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="download">Download XML</button>
              <button class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="tree">Tree View</button>
              <button class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="xpath">XPath Tester</button>
            </div>
          </div>
        </div>
        
        <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg" id="xml-tree" hidden>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Tree View</h3>
          <div class="tree-content text-sm text-gray-700 dark:text-gray-300 font-mono"></div>
        </div>
        
        <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg" id="xpath-tester" hidden>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">XPath Tester</h3>
          <div class="flex gap-2 mb-4">
            <input type="text" id="xpath-input" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Enter XPath expression (e.g., //book[@id='bk101']/title)">
            <button class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="test-xpath">Test XPath</button>
          </div>
          <div class="xpath-results text-sm text-gray-700 dark:text-gray-300" id="xpath-results"></div>
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
      this.outputArea.value = '';
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
      
      // Display the formatted XML (textareas don't support HTML highlighting)
      this.outputArea.value = result;
    } catch (error) {
      this.outputArea.value = `Error: ${error.message}`;
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
      this.outputArea.value = '';
      return;
    }
    
    try {
      // Remove comments, whitespace between tags
      const minified = xml
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
      
      this.outputArea.value = minified;
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
    const resultsEl = this.container.querySelector('#xpath-results');
    
    // Clear previous results
    resultsEl.innerHTML = '';
    
    if (!xml) {
      this.showXPathError('No XML document provided. Please enter some XML content first.');
      return;
    }
    
    if (!xpath) {
      this.showXPathError('No XPath expression provided. Please enter an XPath expression to test.');
      return;
    }
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      
      // Check for XML parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error(`XML parsing error: ${parserError.textContent}`);
      }
      
      // Test XPath expression
      const results = this.evaluateXPath(xpath, doc);
      this.displayXPathResults(results, xpath);
      
    } catch (error) {
      this.showXPathError(`XPath evaluation failed: ${error.message}`);
    }
  }
  
  evaluateXPath(xpath, doc) {
    try {
      // Try using document.evaluate (most reliable method)
      if (document.evaluate) {
        const result = document.evaluate(
          xpath, 
          doc, 
          null, 
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, 
          null
        );
        
        const matches = [];
        for (let i = 0; i < result.snapshotLength; i++) {
          const node = result.snapshotItem(i);
          matches.push(this.formatXPathResult(node));
        }
        
        return { matches, method: 'document.evaluate' };
      }
      
      // Fallback to manual XPath parsing for simple expressions
      return this.evaluateXPathFallback(xpath, doc);
      
    } catch (error) {
      // Try fallback method
      return this.evaluateXPathFallback(xpath, doc);
    }
  }
  
  evaluateXPathFallback(xpath, doc) {
    const matches = [];
    
    // Handle common XPath patterns
    if (xpath.startsWith('//')) {
      // Descendant axis: //elementName
      const elementName = xpath.slice(2).split('[')[0].split('/')[0];
      if (elementName) {
        const elements = doc.getElementsByTagName(elementName);
        for (let element of elements) {
          if (this.matchesXPathConditions(element, xpath)) {
            matches.push(this.formatXPathResult(element));
          }
        }
      }
    } else if (xpath.startsWith('/')) {
      // Absolute path: /root/child
      const pathParts = xpath.split('/').filter(part => part);
      const result = this.followAbsolutePath(doc.documentElement, pathParts, 0);
      if (result) {
        matches.push(this.formatXPathResult(result));
      }
    } else {
      // Try to find elements by tag name
      const elements = doc.getElementsByTagName(xpath);
      for (let element of elements) {
        matches.push(this.formatXPathResult(element));
      }
    }
    
    return { matches, method: 'fallback' };
  }
  
  matchesXPathConditions(element, xpath) {
    // Parse conditions in brackets like [@id='value'] or [position()=1]
    const conditionMatch = xpath.match(/\[([^\]]+)\]/);
    if (!conditionMatch) return true;
    
    const condition = conditionMatch[1];
    
    // Handle attribute conditions: @attribute='value'
    const attrMatch = condition.match(/@([^=]+)='([^']+)'/);
    if (attrMatch) {
      const attrName = attrMatch[1];
      const attrValue = attrMatch[2];
      return element.getAttribute(attrName) === attrValue;
    }
    
    // Handle attribute existence: @attribute
    const attrExistsMatch = condition.match(/@([^=\s]+)$/);
    if (attrExistsMatch) {
      const attrName = attrExistsMatch[1];
      return element.hasAttribute(attrName);
    }
    
    // Handle position conditions: position()=1
    const posMatch = condition.match(/position\(\)=(\d+)/);
    if (posMatch) {
      const position = parseInt(posMatch[1]);
      const siblings = Array.from(element.parentNode.children).filter(
        child => child.tagName === element.tagName
      );
      return siblings.indexOf(element) + 1 === position;
    }
    
    // Handle text content conditions: text()='value'
    const textMatch = condition.match(/text\(\)='([^']+)'/);
    if (textMatch) {
      const textValue = textMatch[1];
      return element.textContent.trim() === textValue;
    }
    
    return true;
  }
  
  followAbsolutePath(element, pathParts, index) {
    if (index >= pathParts.length) return element;
    
    const currentPart = pathParts[index];
    const [tagName, condition] = currentPart.split('[');
    
    if (element.tagName.toLowerCase() !== tagName.toLowerCase()) {
      return null;
    }
    
    if (condition) {
      // Handle conditions for absolute paths
      const conditionStr = '[' + condition;
      if (!this.matchesXPathConditions(element, conditionStr)) {
        return null;
      }
    }
    
    if (index === pathParts.length - 1) {
      return element;
    }
    
    // Continue with children
    const nextPart = pathParts[index + 1];
    const nextTagName = nextPart.split('[')[0];
    
    for (let child of element.children) {
      if (child.tagName.toLowerCase() === nextTagName.toLowerCase()) {
        const result = this.followAbsolutePath(child, pathParts, index + 1);
        if (result) return result;
      }
    }
    
    return null;
  }
  
  formatXPathResult(node) {
    if (!node) return null;
    
    const result = {
      type: this.getNodeTypeString(node.nodeType),
      nodeName: node.nodeName,
      nodeValue: null,
      textContent: null,
      attributes: {},
      path: this.getNodePath(node)
    };
    
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        result.textContent = node.textContent?.trim() || '';
        result.innerHTML = node.innerHTML;
        // Get attributes
        for (let attr of node.attributes || []) {
          result.attributes[attr.name] = attr.value;
        }
        break;
        
      case Node.ATTRIBUTE_NODE:
        result.nodeValue = node.value;
        break;
        
      case Node.TEXT_NODE:
        result.nodeValue = node.nodeValue?.trim() || '';
        break;
        
      default:
        result.nodeValue = node.nodeValue;
    }
    
    return result;
  }
  
  getNodeTypeString(nodeType) {
    switch (nodeType) {
      case Node.ELEMENT_NODE: return 'Element';
      case Node.ATTRIBUTE_NODE: return 'Attribute';
      case Node.TEXT_NODE: return 'Text';
      case Node.COMMENT_NODE: return 'Comment';
      case Node.DOCUMENT_NODE: return 'Document';
      default: return 'Unknown';
    }
  }
  
  getNodePath(node) {
    if (!node || node.nodeType === Node.DOCUMENT_NODE) return '/';
    
    const parts = [];
    let current = node;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let part = current.tagName.toLowerCase();
      
      // Add position if there are siblings with the same name
      const siblings = Array.from(current.parentNode?.children || [])
        .filter(child => child.tagName === current.tagName);
      
      if (siblings.length > 1) {
        const position = siblings.indexOf(current) + 1;
        part += `[${position}]`;
      }
      
      parts.unshift(part);
      current = current.parentNode;
    }
    
    return '/' + parts.join('/');
  }
  
  displayXPathResults(results, xpath) {
    const resultsEl = this.container.querySelector('#xpath-results');
    const { matches, method } = results;
    
    if (matches.length === 0) {
      resultsEl.innerHTML = `
        <div class="xpath-no-matches bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
          <div class="flex items-center text-yellow-800 dark:text-yellow-200">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <strong>No matches found</strong>
          </div>
          <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>The XPath expression <code class="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">${this.escapeHTML(xpath)}</code> did not match any nodes.</p>
            <div class="mt-2">
              <p><strong>Tips:</strong></p>
              <ul class="list-disc list-inside space-y-1">
                <li>Check that element names match exactly (case-sensitive)</li>
                <li>Verify the XML structure matches your XPath</li>
                <li>Try simpler expressions like <code>//elementName</code></li>
                <li>Use <code>//*</code> to select all elements</li>
              </ul>
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    let html = `
      <div class="xpath-matches bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
        <div class="flex items-center text-green-800 dark:text-green-200 mb-3">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <strong>Found ${matches.length} match${matches.length !== 1 ? 'es' : ''}</strong>
        </div>
        
        <div class="space-y-3">
    `;
    
    matches.forEach((match, index) => {
      html += `
        <div class="match-item border border-gray-200 dark:border-gray-600 rounded p-3 bg-white dark:bg-gray-800">
          <div class="flex items-start justify-between mb-2">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              Match ${index + 1}: ${match.type} "${match.nodeName}"
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">
              ${match.path}
            </div>
          </div>
      `;
      
      if (match.type === 'Element') {
        if (Object.keys(match.attributes).length > 0) {
          html += `
            <div class="mb-2">
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Attributes:</div>
              <div class="space-y-1">
          `;
          for (const [name, value] of Object.entries(match.attributes)) {
            html += `
              <div class="text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 font-mono">
                <span class="text-blue-600 dark:text-blue-400">${this.escapeHTML(name)}</span>="<span class="text-green-600 dark:text-green-400">${this.escapeHTML(value)}</span>"
              </div>
            `;
          }
          html += `</div></div>`;
        }
        
        if (match.textContent) {
          html += `
            <div>
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Text Content:</div>
              <div class="text-sm bg-gray-100 dark:bg-gray-700 rounded p-2 font-mono whitespace-pre-wrap">${this.escapeHTML(match.textContent)}</div>
            </div>
          `;
        }
      } else if (match.nodeValue) {
        html += `
          <div>
            <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Value:</div>
            <div class="text-sm bg-gray-100 dark:bg-gray-700 rounded p-2 font-mono">${this.escapeHTML(match.nodeValue)}</div>
          </div>
        `;
      }
      
      html += `</div>`;
    });
    
    html += `
        </div>
        <div class="mt-3 text-xs text-gray-600 dark:text-gray-400">
          Evaluation method: ${method}
        </div>
      </div>
    `;
    
    resultsEl.innerHTML = html;
  }
  
  showXPathError(message) {
    const resultsEl = this.container.querySelector('#xpath-results');
    resultsEl.innerHTML = `
      <div class="xpath-error bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
        <div class="flex items-center text-red-800 dark:text-red-200">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <strong>XPath Error</strong>
        </div>
        <div class="mt-2 text-sm text-red-700 dark:text-red-300">
          ${this.escapeHTML(message)}
        </div>
        <div class="mt-3 text-xs text-red-600 dark:text-red-400">
          <p><strong>Common XPath patterns:</strong></p>
          <ul class="list-disc list-inside space-y-1 mt-1">
            <li><code>//book</code> - All book elements</li>
            <li><code>//book[@id='bk101']</code> - Book with specific ID</li>
            <li><code>//book/title</code> - All title elements inside book elements</li>
            <li><code>/catalog/book[1]</code> - First book element</li>
            <li><code>//book[position()>1]</code> - All books except the first</li>
          </ul>
        </div>
      </div>
    `;
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
    const text = this.outputArea.value;
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
    this.outputArea.value = '';
    this.validationResult.hidden = true;
    this.container.querySelector('#xml-tree').hidden = true;
    this.container.querySelector('#xpath-tester').hidden = true;
    this.updateStats();
  }
}