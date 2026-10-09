# Render Selected Text - Chrome Extension

A powerful Chrome extension that renders selected text as beautifully formatted HTML or interactive JSON trees. Perfect for developers working with API responses, debugging data structures, or viewing formatted content.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## ✨ Features

### 🎨 **Beautiful JSON Tree Viewer**
- Interactive expandable/collapsible tree structure
- VS Code-inspired syntax highlighting
- Auto-expanded root for immediate visibility
- Clean icons (▶/▼) instead of cluttered text
- Color-coded values:
  - 🟣 Purple keys
  - 🔴 Red strings
  - 🟢 Green numbers
  - 🔵 Blue booleans/null

### 🔄 **Multi-Format Support**
Automatically detects and parses:
- **JSON** - Standard JSON objects and arrays
- **Ruby** - Ruby hashes with symbols (`:key=>value`)
- **PHP** - PHP arrays (`array('key' => 'value')`)
- **TOON** - [Token-Oriented Object Notation](https://github.com/toon-format/spec) (`users[2]{id,name}:`), shown as a JSON tree
- **Markdown** - Headings, lists, tables, code blocks and more (raw HTML inside is shown as text)
- **HTML** - Raw HTML content

### 🖥️ **Terminal-Style Popup**
- Monospace, console-like window with dark and light themes
- Pick **Dark**, **Light**, **Match system** or **Unicorn** (the original purple gradient look) in the extension options (Extensions menu → Render Selected Text → Options)

### 🚀 **Smart Parsing**
- Nested structures of any depth
- Mixed data types
- Empty containers (inline display)
- Associative vs indexed arrays (PHP)

## 📥 Installation

### Method 1: Install from Chrome Web Store
*Coming soon - Not yet published*

### Method 2: Install Manually (Developer Mode)

1. **Download the extension**
   ```bash
   git clone https://github.com/m1k3lm/render-selected-text-chrome-extension.git
   cd render-selected-text-chrome-extension
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - Or click: Menu (⋮) → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the extension directory
   - The extension icon should appear in your toolbar

## 🎯 How to Use

### Basic Usage

1. **Select text** on any webpage
2. **Right-click** to open the context menu
3. **Click "Render selected text"**
4. A popup overlay will display your formatted content

### Examples

#### Example 1: JSON Object
Select this text:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "active": true
}
```

**Result:** Beautiful interactive tree with collapsible sections

#### Example 2: Ruby Hash
Select this text:
```ruby
{:user=>{:name=>"Alice", :role=>"admin"}, :active=>true}
```

**Result:** Automatically converted to JSON and displayed as an interactive tree

#### Example 3: PHP Array
Select this text:
```php
array('product' => 'Laptop', 'price' => 999.99, 'items' => array('item1', 'item2'))
```

**Result:** Parsed and displayed with proper nested structure

#### Example 4: HTML Content
Select this text:
```html
<h1>Hello World</h1>
<p>This is <strong>formatted</strong> HTML.</p>
```

**Result:** Rendered HTML with proper formatting

## 🎨 JSON Tree Features

### Interactive Controls
- **Click ▶ icon** to expand collapsed sections
- **Click ▼ icon** to collapse expanded sections
- **Hover over icons** for visual feedback
- **Root starts expanded** for immediate visibility

### Visual Elements
- **Guide lines** show nesting hierarchy
- **Commas** separate array/object items
- **Brackets/Braces** show structure (`[]` for arrays, `{}` for objects)
- **Monospace font** for consistent alignment

### Smart Previews
When collapsed, see at a glance:
- **Objects:** Show key count or first key name
  - `▶ { 5 … }` (5 keys)
  - `▶ { "name" … }` (single key)
- **Arrays:** Show item count
  - `▶ [ 10 … ]` (10 items)
- **Empty containers:** Display inline
  - `{}` or `[]`

## 🔧 Supported Formats

### JSON
```json
{
  "string": "value",
  "number": 42,
  "boolean": true,
  "null": null,
  "array": [1, 2, 3],
  "object": {"nested": "data"}
}
```

### Ruby Hashes
```ruby
# Symbol keys
{:name=>"John", :age=>30}

# String keys
{"name"=>"Jane", "email"=>"jane@example.com"}

# Nested structures
{:user=>{:profile=>{:name=>"Alice"}}}

# Ruby special values
{:active=>true, :deleted=>false, :middle=>nil}
```

### PHP Arrays
```php
// Associative arrays
array('name' => 'Product', 'price' => 29.99)

// Indexed arrays
array(1, 2, 3, 4, 5)

// Nested arrays
array('items' => array('item1', 'item2'))

// stdClass objects
stdClass Object('id' => 123, 'name' => 'Test')
```

### HTML
Any valid HTML content will be rendered with proper formatting.

## ⚙️ Technical Details

### Architecture
- **Manifest Version:** V3 (latest Chrome extension standard)
- **Background:** Service worker for context menu management
- **Content Script:** Injected into all pages for rendering
- **Parsers:** Modular parser system for different formats

### File Structure
```
render-selected-text-chrome-extension/
├── manifest.json           # Extension configuration
├── background.js           # Service worker
├── content.js             # Main rendering logic
├── parsers/               # Format parsers
│   ├── json-parser.js    # JSON parser
│   ├── ruby-parser.js    # Ruby parser
│   └── php-parser.js     # PHP parser
├── icon16.png            # Extension icons
├── icon48.png
├── icon128.png
├── tests/                # Test suite
│   ├── test-runner.html  # Browser-based test runner
│   ├── test-framework.js # Testing framework
│   └── *.test.js         # Parser tests
└── README.md             # This file
```

## 🧪 Testing

The extension includes a comprehensive test suite with 102 tests.

### Running Tests

1. Open `tests/test-runner.html` in your browser
2. Click "Run Tests"
3. View results in the browser console

### Test Coverage
- ✅ **JSONParser:** 25 tests
- ✅ **RubyParser:** 35 tests
- ✅ **PHPParser:** 42 tests

## 🎨 Color Scheme

The JSON tree uses a professional VS Code-inspired color palette:

| Element | Color | Hex Code |
|---------|-------|----------|
| Keys | Purple | `#881391` |
| Strings | Red | `#D14` |
| Numbers | Green | `#098658` |
| Booleans/Null | Blue | `#0451A5` |
| Brackets | Gray | `#666` |
| Commas | Light Gray | `#999` |

## 🚀 Development

### Prerequisites
- Google Chrome (latest version)
- Basic knowledge of Chrome extensions
- Text editor

### Making Changes

1. **Edit the code** in your favorite editor
2. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Click the refresh icon on the extension card
3. **Reload any pages** where you want to test
4. **Test your changes** by selecting text and using the context menu

### Adding New Parsers

Create a new parser in `parsers/` directory:

```javascript
const MyParser = {
  parse(text) {
    try {
      // Your parsing logic here
      return parsedObject;
    } catch (e) {
      return null;
    }
  }
};
```

Then add it to `manifest.json` content_scripts and use it in `content.js`.

## 📝 Changelog

### Version 2.0 (Current)
- 📝 Markdown rendering: headings, task and nested lists, tables, code blocks, links
- 🎒 TOON (Token-Oriented Object Notation) decoding, shown as a JSON tree
- 🖥️ Terminal-style popup with Dark, Light, Match system and Unicorn themes
- ⚙️ Options page to pick the theme, synced with `chrome.storage`
- 🌳 JSON trees open two levels deep by default
- 🧪 168 tests, plus the official TOON spec decode fixtures

### Version 1.0
- ✨ Initial release
- 🎨 Beautiful JSON tree viewer
- 🔄 Support for JSON, Ruby, PHP, and HTML
- 📱 Manifest V3 compliance
- 🧪 Comprehensive test suite (102 tests)
- 🎯 Auto-expand root level
- 💫 Interactive hover effects

## 🐛 Known Issues

None at this time. Please report issues on GitHub.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs** - Open an issue on GitHub
2. **Suggest features** - Share your ideas
3. **Submit PRs** - Fix bugs or add features
4. **Improve docs** - Help make documentation better
5. **Write tests** - Expand test coverage

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/render-selected-text-chrome-extension.git

# Open in your editor
cd render-selected-text-chrome-extension
code .

# Load extension in Chrome
# chrome://extensions/ → Enable Developer Mode → Load Unpacked
```

## 📄 License

MIT License - Feel free to use this extension in your projects!

## 💡 Use Cases

- **API Development** - Quickly visualize API responses
- **Debugging** - Inspect complex data structures
- **Log Analysis** - Format and view log entries
- **Code Review** - Examine data dumps
- **Learning** - Understand nested data structures
- **Documentation** - Generate visual examples

## 🔗 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Context Menus API](https://developer.chrome.com/docs/extensions/reference/contextMenus/)

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/render-selected-text-chrome-extension/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/render-selected-text-chrome-extension/discussions)

## 🙏 Acknowledgments

- Color scheme inspired by Visual Studio Code
- Tree structure inspired by Chrome DevTools
- Icon design using standard Unicode arrows

---

**Made with ❤️ by developers, for developers**

*If you find this extension useful, please consider giving it a ⭐ on GitHub!*
