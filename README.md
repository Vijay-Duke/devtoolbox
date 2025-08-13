# DevToolbox 🚀

A fast, minimal, privacy-first collection of developer utilities in one place. No ads, no tracking, works offline.

## Features

### 🎯 Core Features
- **30+ Developer Tools** - All essential utilities in one place
- **100% Offline** - Works without internet connection
- **Zero Dependencies** - Pure vanilla JavaScript
- **Privacy First** - No tracking, no analytics, no external requests
- **PWA Support** - Install as a desktop/mobile app
- **Dark/Light Theme** - Automatic or manual theme switching
- **Keyboard Navigation** - Comprehensive shortcuts for power users

### ⚡ Performance
- **Lazy Loading** - Tools load on-demand for instant startup
- **Service Worker** - Full offline caching and PWA capabilities
- **Web Workers** - Heavy computations run in background threads
- **Code Splitting** - Each tool is a separate module
- **Optimized Assets** - Minimal CSS and JavaScript bundles

### 🛠️ Available Tools

#### Text & Data
- JSON Formatter - Format, validate, and minify JSON
- JWT Decoder - Decode and verify JWT tokens
- Base64 Encode/Decode - Convert between text and Base64
- URL Encode/Decode - Encode/decode URL components
- Diff Tool - Compare text differences
- Markdown Preview - Live markdown rendering
- XML Formatter - Format and validate XML with XPath testing

#### Generators
- UUID Generator - Generate v4 UUIDs
- Hash Generator - MD5, SHA-1, SHA-256, SHA-512
- Fake Data Generator - Generate test data
- Password Generator - Secure passwords with entropy-based strength meter
- QR Code Generator - Generate QR codes for various data types
- ASCII Art Generator - Create ASCII art from text and images

#### Converters
- Unix Time Converter - Convert between Unix timestamps and dates
- CSV ↔ JSON Converter - Convert between CSV and JSON
- YAML ↔ JSON Converter - Convert between YAML and JSON
- Binary Converter - Convert between binary, decimal, hex, octal
- Image Converter - Convert, resize, and compress images

#### Developer Tools
- Regex Tester - Test regular expressions with live matching
- Cron Parser - Parse and explain cron expressions
- cURL Generator - Generate cURL commands from requests
- API Mock Generator - Generate mock API responses
- GraphQL Tester - Test GraphQL queries
- SQL Formatter - Format and analyze SQL queries
- Webhook Tester - Test and debug webhooks locally

#### Networking & Cloud
- IP Address Lookup - Real-time geolocation with ip-api.com
- CIDR Calculator - Subnet calculator and IP range tools
- DNS Lookup - Real DNS queries via Cloudflare DoH
- WHOIS Lookup - Domain and IP registration info
- S3 Pre-signed URL Generator - Generate AWS S3 URLs
- AWS IAM Policy Visualizer - Analyze and visualize IAM policies

### 🎨 User Experience

#### Keyboard Shortcuts
- `/` - Focus search
- `Esc` - Clear search/Close modals
- `t` - Toggle theme
- `?` - Show all shortcuts
- `Ctrl+K` - Quick tool search
- `Ctrl+D` - Add to favorites
- `Ctrl+B` - Show favorites
- `Alt+←/→` - Navigate between tools

#### Search Features
- **Fuzzy Search** - Find tools quickly with partial matches
- **Search Aliases** - Custom shortcuts (e.g., `j` for JSON, `b64` for Base64)
- **Category Filters** - Filter tools by category
- **Command Mode** - Use `:` prefix for commands

#### Advanced Features
- **History Persistence** - Auto-save and restore tool states
- **Shareable Links** - Share tool configurations via URL
- **Import/Export Settings** - Backup and restore all settings
- **Favorites** - Quick access to frequently used tools

## Installation

### Use Online
Visit [devtoolbox.app](https://devtoolbox.app) (example URL)

### Install as PWA
1. Open the app in Chrome/Edge/Safari
2. Click the install icon in the address bar
3. Or use browser menu: "Install DevToolbox"

### Self-Host
```bash
# Clone the repository
git clone https://github.com/yourusername/devtoolbox.git

# Navigate to project directory
cd devtoolbox

# Serve with any static server
npx serve .
# or
python -m http.server 8000
# or
php -S localhost:8000
```

## Development

### Project Structure
```
devtoolbox/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── css/
│   ├── base.css       # Base styles
│   └── tools.css      # Tool-specific styles
├── js/
│   ├── app.js         # Main application
│   ├── router-lazy.js # Lazy-loading router
│   ├── tools/         # Individual tool modules
│   └── workers/       # Web Workers
└── icons/             # PWA icons
```

### Adding a New Tool

1. Create a new tool file in `js/tools/`:
```javascript
// js/tools/my-tool.js
export class MyTool {
  constructor() {
    this.container = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1>My Tool</h1>
        </div>
        <!-- Tool UI -->
      </div>
    `;
  }
  
  attachEventListeners() {
    // Add event listeners
  }
}
```

2. Register the tool in `js/router-lazy.js`:
```javascript
{ 
  path: 'my-tool', 
  name: 'My Tool', 
  module: './tools/my-tool.js', 
  className: 'MyTool' 
}
```

3. Add navigation link in `index.html`:
```html
<li><a href="#my-tool" class="nav-link">My Tool</a></li>
```

### Building for Production

The project is production-ready as-is. For optimization:

1. Minify CSS and JavaScript files
2. Optimize images
3. Update cache version in Service Worker
4. Deploy to any static hosting service

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Keep tools dependency-free
4. Maintain the minimalist approach
5. Test across browsers
6. Submit a pull request

## Privacy

DevToolbox is designed with privacy in mind:
- ✅ No tracking or analytics
- ✅ No external API calls
- ✅ No cookies (except localStorage for settings)
- ✅ All processing happens locally
- ✅ Works completely offline

## License

MIT License - See LICENSE file for details

## Credits

Created with ❤️ by the DevToolbox team

### Acknowledgments
- Icons from Lucide Icons
- Inspired by various developer tool collections
- Built with vanilla JavaScript and modern web standards

## Support

- Report issues: [GitHub Issues](https://github.com/yourusername/devtoolbox/issues)
- Documentation: [Wiki](https://github.com/yourusername/devtoolbox/wiki)
- Discussions: [GitHub Discussions](https://github.com/yourusername/devtoolbox/discussions)

---

**Note:** This is a local development build. Some features like DNS Lookup and Webhook testing require server-side implementation for full functionality.