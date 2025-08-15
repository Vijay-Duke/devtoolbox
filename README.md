# DevToolbox 🚀

A fast, minimal, privacy-first collection of developer utilities in one place. No ads, no tracking, works offline.

## Features

### 🎯 Core Features
- **25+ Developer Tools** - All essential utilities in one place
- **100% Offline** - Works without internet connection after first load
- **Optimized Performance** - 62KB CSS bundle, system fonts, prefetched tools
- **Privacy First** - No tracking, no analytics, minimal external requests
- **PWA Support** - Install as a desktop/mobile app
- **Dark/Light Theme** - Automatic system detection or manual switching
- **Responsive Design** - Collapsible sidebar, mobile-optimized interface

### ⚡ Performance Optimizations
- **Tailwind CSS Build** - Optimized 62KB bundle vs 300KB CDN
- **System UI Fonts** - Zero external font requests for instant loading
- **Service Worker** - Stale-while-revalidate caching with offline support
- **Tool Prefetching** - Popular tools pre-cached for instant access
- **Lazy Loading** - Tools load on-demand with dynamic imports
- **Code Splitting** - Each tool is a separate ES module

### 🛠️ Available Tools

#### Formatters
- **JSON Formatter** - Format, validate, and minify JSON with syntax highlighting
- **SQL Formatter** - Format and beautify SQL queries with syntax highlighting
- **XML Formatter** - Format and validate XML with XPath testing
- **Cron Parser** - Parse and explain cron expressions with next run times
- **Markdown Preview** - Live markdown rendering with GitHub-flavored support

#### Generators
- **UUID Generator** - Generate v4 UUIDs with batch generation
- **Hash Generator** - MD5, SHA-1, SHA-256, SHA-512 with file upload support
- **Password Generator** - Secure passwords with entropy-based strength meter
- **QR Code Generator** - Generate QR codes for text, URLs, WiFi, contacts
- **ASCII Art Generator** - Create ASCII art from text with multiple fonts
- **Fake Data Generator** - Generate realistic test data (names, addresses, etc.)
- **cURL Generator** - Generate cURL commands from HTTP requests
- **API Mock Generator** - Generate mock API responses and servers
- **S3 Pre-signed URL Generator** - Generate AWS S3 signed URLs

#### Converters
- **Base64 Encode/Decode** - Convert between text and Base64 encoding
- **URL Encode/Decode** - Encode/decode URL components and query strings
- **Unix Time Converter** - Convert between Unix timestamps and human dates
- **CSV ↔ JSON Converter** - Bidirectional conversion with column mapping
- **YAML ↔ JSON Converter** - Bidirectional conversion with validation
- **Binary Converter** - Convert between binary, decimal, hex, octal
- **Image Converter** - Convert, resize, and compress images client-side

#### Text & Data Tools
- **JWT Decoder** - Decode and verify JWT tokens with header/payload analysis
- **Diff Tool** - Compare text differences with side-by-side view
- **Regex Tester** - Test regular expressions with live matching and flags

#### Developer Tools
- **GraphQL Tester** - Test GraphQL queries with variables and introspection
- **Webhook Tester** - Test and debug webhooks with local server
- **Temporary Email** - Disposable email addresses with real-time inbox

#### Networking & Cloud Tools
- **IP Address Lookup** - Geolocation lookup with ISP and organization data
- **DNS Lookup** - Real DNS queries for A, AAAA, MX, TXT, CNAME records
- **CIDR Calculator** - Subnet calculator with IP range and host calculations
- **WHOIS Lookup** - Domain and IP registration information
- **AWS IAM Policy Visualizer** - Analyze and visualize IAM policies

### 🎨 User Experience

#### Enhanced Search
- **Fuzzy Search** - Find tools quickly with partial matches and typos
- **Smart Abbreviations** - Quick access with shortcuts (e.g., `json`, `b64`, `uuid`)
- **Category Filters** - Filter tools by category
- **Auto-navigation** - Single exact matches navigate automatically
- **Keyword Highlighting** - Search terms highlighted in results

#### Keyboard Shortcuts
- `/` - Focus search
- `Esc` - Clear search/escape current context
- `t` - Toggle theme
- `Ctrl/Cmd + Enter` - Execute in supported tools
- Arrow keys - Navigate search results

#### Responsive Design
- **Collapsible Sidebar** - Desktop sidebar can be collapsed for more space
- **Mobile Menu** - Slide-out navigation on mobile devices
- **Touch Gestures** - Swipe navigation on touch devices
- **Accessibility** - ARIA labels, skip links, keyboard navigation

#### Advanced Features
- **History Persistence** - Auto-save and restore tool states across sessions
- **Shareable Links** - Share tool configurations via URL parameters
- **Settings Management** - Import/export all settings and preferences
- **Tool Prefetching** - Popular tools cached for instant loading

## Installation

### Use Online
The app is optimized for direct browser use - no installation required.

### Install as PWA
1. Open the app in Chrome/Edge/Safari
2. Click the install icon in the address bar
3. Or use browser menu: "Install DevToolbox"

### Self-Host
```bash
# Clone the repository
git clone https://github.com/Vijay-Duke/devtoolbox.git

# Navigate to project directory
cd devtoolbox

# Install dependencies and build optimized CSS
npm install
npm run build-css

# Serve with any static server
npx serve .
# or use Node.js built-in server (Node 18+)
npx http-server .
```

## Development

### Project Structure
```
devtoolbox/
├── index.html              # Main HTML file with optimized structure
├── manifest.json           # PWA manifest with proper icons
├── sw.js                   # Service Worker with multi-cache strategy
├── build-css.js            # Tailwind CSS build script
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── package.json            # Dependencies and build scripts
├── src/
│   └── input.css           # Tailwind CSS source
├── css/
│   └── styles.css          # Generated optimized CSS (~62KB)
├── js/
│   ├── app.js              # Main application with tool categorization
│   ├── router-lazy.js      # Lazy-loading router
│   ├── fuzzy-search.js     # Enhanced search functionality
│   ├── tools/              # Individual tool modules (ToolTemplate based)
│   ├── utils/              # Shared utilities
│   └── workers/            # Web Workers for heavy computations
├── icons/
│   └── favicon_io/         # Complete favicon set
└── server/                 # Optional backend for advanced features
    ├── index.js            # Hono.js server for temporary email
    ├── deploy.sh           # VPS deployment script
    └── ecosystem.config.cjs # PM2 configuration
```

### Adding a New Tool

All tools now extend the `ToolTemplate` base class for consistency:

```javascript
// js/tools/my-tool.js
import { ToolTemplate } from './tool-template.js';

export class MyTool extends ToolTemplate {
  constructor() {
    super();
    this.config = {
      name: 'My Tool',
      description: 'Description of what this tool does',
      version: '1.0.0',
      author: 'DevToolbox',
      category: 'Generators', // or Formatters, Converters, etc.
      keywords: ['keyword1', 'keyword2', 'search', 'terms']
    };
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">${this.config.name}</h1>
          <p class="text-gray-600 dark:text-gray-400">${this.config.description}</p>
        </div>
        <div class="tool-body bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <!-- Tool content here -->
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Add event listeners and tool logic
  }
}
```

Then add to the tools array in `js/app.js`:
```javascript
{ 
  name: 'My Tool', 
  href: '#my-tool', 
  category: 'Generators',
  keywords: ['keyword1', 'keyword2']
}
```

### Building for Production

```bash
# Install dependencies
npm install

# Build optimized CSS (required)
npm run build-css

# Optional: Run tests
npm test

# The project is now production-ready
# Deploy the entire directory to any static hosting service
```

The build process:
1. **Tailwind CSS Compilation** - Compiles `src/input.css` to optimized `css/styles.css`
2. **CSS Purging** - Removes unused classes for minimal file size (~62KB vs 300KB CDN)
3. **System Font Stack** - Uses system UI fonts for zero external requests
4. **Service Worker** - Implements stale-while-revalidate caching strategy
5. **Content Security Policy** - Includes CSP headers for security

### Performance Features
- **Tool Prefetching** - Popular tools are pre-cached during idle time
- **Multiple Cache Buckets** - Static, dynamic, and tools caches with different strategies
- **Optimized Images** - Favicon.io generated icon set with multiple sizes
- **ES Modules** - Native ES module loading with dynamic imports

## Server Features (Optional)

For advanced features, deploy the optional Hono.js server:

### Temporary Email Service
- Real-time email reception with Server-Sent Events
- ForwardEmail.net webhook integration
- Automatic inbox cleanup and TTL management
- CORS-enabled for frontend integration

### Deployment
```bash
# VPS deployment with automated script
cd server
chmod +x deploy.sh
./deploy.sh

# Or manual deployment
npm install
node index.js
```

## Browser Support

- **Chrome/Edge 90+** - Full feature support
- **Firefox 88+** - Full feature support  
- **Safari 14+** - Full feature support
- **Mobile browsers** - iOS Safari, Chrome Mobile with touch gestures

## Performance Benchmarks

- **CSS Bundle Size**: 62KB (vs 300KB CDN Tailwind)
- **Zero External Fonts**: System UI font stack
- **Tool Load Time**: ~50ms for cached tools
- **First Contentful Paint**: <500ms
- **Offline Support**: 100% functional offline after first visit

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork and create feature branch**
2. **Use ToolTemplate** - Extend the base class for consistency
3. **Follow categorization** - Group similar tools together
4. **Maintain performance** - Keep tools lightweight and fast
5. **Test across browsers** - Ensure compatibility
6. **Update documentation** - Include tool in README and keywords

## Privacy & Security

DevToolbox is designed with privacy and security in mind:
- ✅ **No tracking or analytics** - Zero data collection
- ✅ **Minimal external requests** - Only for essential networking tools
- ✅ **No cookies** - Uses localStorage for settings only
- ✅ **Local processing** - All computations happen client-side
- ✅ **Content Security Policy** - Prevents XSS and injection attacks
- ✅ **HTTPS ready** - Secure deployment configuration

## License

MIT License - See LICENSE file for details

## Credits

Created with ❤️ by [Vijay Iyengar](mailto:Mail@VijayIyengar.com)

### Acknowledgments
- **Icons**: Lucide Icons for consistent iconography
- **Framework**: Vanilla JavaScript with modern web standards
- **Styling**: Tailwind CSS with custom optimizations
- **Hosting**: Optimized for static hosting services

## Support

- **Issues**: [GitHub Issues](https://github.com/Vijay-Duke/devtoolbox/issues)
- **Source Code**: [GitHub Repository](https://github.com/Vijay-Duke/devtoolbox)
- **Email**: [Mail@VijayIyengar.com](mailto:Mail@VijayIyengar.com)

---

**Performance Note**: This build is optimized for production with 95%+ smaller CSS bundle, zero external dependencies, and comprehensive offline support.