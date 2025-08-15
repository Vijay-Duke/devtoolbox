// Tool Interaction Enhancements
// Provides tooltips, enhanced buttons, and download functionality

export class ToolEnhancements {
  static addTooltip(element, content, link = null) {
    if (!element) return;
    
    // Create tooltip container
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-container';
    tooltip.innerHTML = `
      <div class="tooltip-content bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded px-2 py-1 absolute z-50 hidden whitespace-nowrap shadow-lg">
        ${content}
        ${link ? `<a href="${link}" target="_blank" rel="noopener" class="text-blue-300 dark:text-blue-600 underline ml-1">Learn more</a>` : ''}
      </div>
    `;
    
    element.style.position = 'relative';
    element.appendChild(tooltip);
    
    const tooltipContent = tooltip.querySelector('.tooltip-content');
    
    // Show/hide tooltip
    element.addEventListener('mouseenter', () => {
      tooltipContent.classList.remove('hidden');
      // Position tooltip
      const rect = element.getBoundingClientRect();
      const tooltipRect = tooltipContent.getBoundingClientRect();
      
      // Default position: below element
      tooltipContent.style.top = '100%';
      tooltipContent.style.left = '50%';
      tooltipContent.style.transform = 'translateX(-50%)';
      tooltipContent.style.marginTop = '4px';
      
      // Check if tooltip goes off screen and adjust
      setTimeout(() => {
        const newRect = tooltipContent.getBoundingClientRect();
        if (newRect.right > window.innerWidth) {
          tooltipContent.style.left = 'auto';
          tooltipContent.style.right = '0';
          tooltipContent.style.transform = 'none';
        }
        if (newRect.left < 0) {
          tooltipContent.style.left = '0';
          tooltipContent.style.right = 'auto';
          tooltipContent.style.transform = 'none';
        }
        // If tooltip goes below fold, position above
        if (newRect.bottom > window.innerHeight) {
          tooltipContent.style.top = 'auto';
          tooltipContent.style.bottom = '100%';
          tooltipContent.style.marginTop = '0';
          tooltipContent.style.marginBottom = '4px';
        }
      }, 1);
    });
    
    element.addEventListener('mouseleave', () => {
      tooltipContent.classList.add('hidden');
    });
    
    // Handle focus for accessibility
    element.addEventListener('focus', () => {
      tooltipContent.classList.remove('hidden');
    });
    
    element.addEventListener('blur', () => {
      tooltipContent.classList.add('hidden');
    });
  }
  
  static enhanceCopyButton(button, contentSelector, customLabel = null) {
    if (!button) return;
    
    // Update button text and styling
    const label = customLabel || 'Copy Result';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      ${label}
    `;
    
    // Add prominent styling
    button.className = 'inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';
    
    // Enhanced copy functionality
    button.addEventListener('click', async () => {
      try {
        const contentElement = typeof contentSelector === 'string' 
          ? document.querySelector(contentSelector) 
          : contentSelector;
        
        if (!contentElement) {
          throw new Error('Content not found');
        }
        
        const content = contentElement.value || contentElement.textContent || contentElement.innerText;
        if (!content.trim()) {
          throw new Error('No content to copy');
        }
        
        await navigator.clipboard.writeText(content);
        
        // Visual feedback
        const originalContent = button.innerHTML;
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied!
        `;
        button.className = 'inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors';
        
        setTimeout(() => {
          button.innerHTML = originalContent;
          button.className = 'inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';
        }, 2000);
        
      } catch (error) {
        // Error feedback
        const originalContent = button.innerHTML;
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Failed
        `;
        button.className = 'inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors';
        
        setTimeout(() => {
          button.innerHTML = originalContent;
          button.className = 'inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';
        }, 2000);
      }
    });
  }
  
  static createDownloadButton(content, filename, mimeType = 'text/plain', label = 'Download') {
    const button = document.createElement('button');
    button.className = 'inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ml-2';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      ${label}
    `;
    
    button.addEventListener('click', () => {
      try {
        const contentToDownload = typeof content === 'function' ? content() : content;
        const blob = new Blob([contentToDownload], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Visual feedback
        const originalContent = button.innerHTML;
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Downloaded!
        `;
        
        setTimeout(() => {
          button.innerHTML = originalContent;
        }, 2000);
        
      } catch (error) {
        console.error('Download failed:', error);
        
        // Error feedback
        const originalContent = button.innerHTML;
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Failed
        `;
        
        setTimeout(() => {
          button.innerHTML = originalContent;
        }, 2000);
      }
    });
    
    return button;
  }
  
  static addRatioTooltip(element, description = null) {
    if (!element) return;
    
    const defaultDescription = "Shows the size ratio between input and output data - useful for understanding compression/expansion effects";
    const content = description || defaultDescription;
    
    this.addTooltip(element, content, 'https://en.wikipedia.org/wiki/Data_compression_ratio');
  }
  
  static enhanceCheckbox(checkbox, description, helpLink = null) {
    if (!checkbox) return;
    
    const label = checkbox.closest('label') || checkbox.parentElement;
    if (!label) return;
    
    this.addTooltip(label, description, helpLink);
    
    // Add visual indicator that help is available
    const helpIcon = document.createElement('span');
    helpIcon.className = 'inline-block ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help';
    helpIcon.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <point cx="12" cy="17"/>
      </svg>
    `;
    
    label.appendChild(helpIcon);
  }
  
  // Common checkbox descriptions for reuse across tools
  static getCommonTooltips() {
    return {
      prettyPrint: {
        description: "Format output with proper indentation and line breaks for better readability",
        link: null
      },
      autoDetect: {
        description: "Automatically detect and convert data types (numbers, booleans, etc.) instead of treating everything as strings",
        link: null
      },
      urlSafe: {
        description: "Use URL-safe Base64 encoding (RFC 4648) which replaces + and / with - and _ respectively",
        link: "https://tools.ietf.org/html/rfc4648#section-5"
      },
      ignoreCase: {
        description: "Make pattern matching case-insensitive",
        link: null
      },
      multiline: {
        description: "Allow ^ and $ to match the start/end of lines, not just the entire string",
        link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags"
      },
      global: {
        description: "Find all matches in the text, not just the first one",
        link: null
      },
      uppercase: {
        description: "Include uppercase letters (A-Z) in generated passwords",
        link: null
      },
      lowercase: {
        description: "Include lowercase letters (a-z) in generated passwords",
        link: null
      },
      numbers: {
        description: "Include numeric digits (0-9) in generated passwords",
        link: null
      },
      symbols: {
        description: "Include special characters and symbols for stronger passwords",
        link: null
      },
      similarChars: {
        description: "Include visually similar characters like i, l, 1, L, o, 0, O. Disable to avoid confusion when typing passwords manually",
        link: null
      },
      beginWithLetter: {
        description: "Ensure the password starts with a letter, useful for systems that require this",
        link: null
      },
      noSequential: {
        description: "Prevent sequential characters (like 'abc' or '123') to improve security",
        link: null
      },
      noDuplicate: {
        description: "Ensure each character appears only once in the password",
        link: null
      }
    };
  }
  
  // Predefined download configurations for common formats
  static getDownloadConfigs() {
    return {
      json: {
        mimeType: 'application/json',
        extension: '.json'
      },
      csv: {
        mimeType: 'text/csv',
        extension: '.csv'
      },
      xml: {
        mimeType: 'application/xml',
        extension: '.xml'
      },
      yaml: {
        mimeType: 'application/x-yaml',
        extension: '.yaml'
      },
      sql: {
        mimeType: 'application/sql',
        extension: '.sql'
      },
      txt: {
        mimeType: 'text/plain',
        extension: '.txt'
      },
      html: {
        mimeType: 'text/html',
        extension: '.html'
      }
    };
  }
}

// Add CSS for tooltips
const tooltipStyles = document.createElement('style');
tooltipStyles.textContent = `
  .tooltip-container .tooltip-content {
    font-size: 0.75rem;
    line-height: 1.2;
    max-width: 250px;
    word-wrap: break-word;
    pointer-events: none;
  }
  
  .tooltip-container .tooltip-content::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #1f2937;
  }
  
  [data-theme="dark"] .tooltip-container .tooltip-content::before {
    border-bottom-color: #f3f4f6;
  }
  
  /* Position arrow correctly when tooltip is above */
  .tooltip-container .tooltip-content[style*="bottom: 100%"]::before {
    top: auto;
    bottom: -4px;
    border-bottom: none;
    border-top: 4px solid #1f2937;
  }
  
  [data-theme="dark"] .tooltip-container .tooltip-content[style*="bottom: 100%"]::before {
    border-top-color: #f3f4f6;
  }
`;
document.head.appendChild(tooltipStyles);