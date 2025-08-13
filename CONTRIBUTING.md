# Contributing to DevToolbox

Thank you for your interest in contributing to DevToolbox! We welcome contributions from the community and are grateful for any help you can provide.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## How to Contribute

### Reporting Issues

- Check if the issue has already been reported
- Use the issue template when creating a new issue
- Provide as much detail as possible, including:
  - Browser version
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots if applicable

### Suggesting Features

- Check if the feature has already been suggested
- Open a discussion in the GitHub Discussions tab
- Explain the use case and how it benefits users
- Consider if it aligns with the project's philosophy (privacy-first, no dependencies, works offline)

### Code Contributions

#### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/devtoolbox.git
   cd devtoolbox
   ```
3. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

##### Core Principles
- **No External Dependencies**: Tools should work with vanilla JavaScript
- **Privacy First**: No tracking, analytics, or external API calls (except where explicitly necessary)
- **Offline Support**: All tools must work offline
- **Performance**: Use lazy loading and optimize for speed
- **Accessibility**: Follow WCAG guidelines

##### Code Style
- Use ES6+ features
- Follow the existing code structure
- Add JSDoc comments for public methods
- Use meaningful variable and function names
- Keep functions small and focused

##### Adding a New Tool

1. Create the tool module in `js/tools/your-tool.js`:
```javascript
export class YourTool {
  constructor() {
    this.container = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <!-- Your tool UI using Tailwind classes -->
      </div>
    `;
  }
  
  attachEventListeners() {
    // Add your event listeners
  }
}
```

2. Register in `js/router-lazy.js`:
```javascript
{ 
  path: 'your-tool', 
  name: 'Your Tool', 
  module: './tools/your-tool.js', 
  className: 'YourTool' 
}
```

3. Add to navigation in `index.html`
4. Add to search in `js/app.js`

##### Testing

- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test both light and dark themes
- Test on mobile devices
- Ensure offline functionality works
- Check for console errors
- Validate accessibility with screen readers

#### Commit Messages

Follow conventional commit format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add color picker tool
fix: correct password strength calculation
docs: update README with new features
```

#### Pull Request Process

1. Update the README.md if needed
2. Ensure all tests pass
3. Update the version number if applicable
4. Create a pull request with a clear title and description
5. Link any related issues
6. Wait for code review

### Documentation

- Update inline documentation
- Add JSDoc comments
- Update README for new features
- Create examples if needed

## Development Setup

### Prerequisites
- Modern web browser
- Basic HTTP server (Python, Node.js, PHP, etc.)
- Text editor or IDE

### Running Locally
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

## Questions?

Feel free to open an issue or start a discussion if you have questions about contributing.

## Recognition

Contributors will be recognized in the README and release notes. Thank you for helping make DevToolbox better!

## License

By contributing to DevToolbox, you agree that your contributions will be licensed under the MIT License.