# Chrome Web Store listing — v2.0

## Summary (124 / 132 characters)

View selected JSON, TOON, Markdown, Ruby, PHP or HTML as an interactive tree or rendered page. Dark, light & unicorn themes.

## Description

Render Selected Text turns raw data you find on any web page into something you can actually read. Select it, right-click, choose "Render selected text" — done.

🆕 NEW IN 2.0:
• Markdown rendering — headings, task lists, nested lists, tables, code blocks, quotes and links
• TOON support — Token-Oriented Object Notation, the compact JSON format used in LLM prompts, decoded into an interactive tree
• Terminal-style popup — monospace, high-contrast and easy on the eyes
• Themes — Dark, Light, Match system or 🦄 Unicorn (the original purple look). Choose one in the extension Options; open popups switch instantly
• Smarter trees — the first two levels of JSON and TOON open automatically

🎯 KEY FEATURES:
• Interactive tree viewer for JSON, TOON, Ruby hashes and PHP arrays — expand/collapse with ▶/▼
• Automatic format detection — JSON, Ruby, PHP, TOON, Markdown or HTML
• Color-coded values — strings, numbers, booleans and null at a glance
• Works with text selected on the page and inside text areas
• Keyboard friendly — press ESC to close
• Zero configuration — works right out of the box

📖 HOW TO USE:
1. Select text on any web page
2. Right-click and choose "Render selected text"
3. Explore the result — click ▶/▼ to expand or collapse
4. Press ESC or the close button to dismiss
5. Pick a theme in the extension Options (Extensions menu → Render Selected Text → Options)

📝 SUPPORTED FORMATS:
• JSON: {"user": {"name": "Ada", "roles": ["admin"]}}
• TOON: users[2]{id,name}: followed by rows such as 1,Ada and 2,Bob
• Ruby: {:key => "value"}
• PHP: array('key' => 'value') and stdClass objects
• Markdown: # headings, - [x] task lists, | tables |, code blocks
• HTML: any HTML markup, rendered live

💡 PERFECT FOR:
• Developers debugging API responses and webhook payloads
• Reading LLM prompts and outputs written in TOON or Markdown
• Previewing READMEs, release notes and docs
• Inspecting Rails and PHP debug output
• Reviewing JSON configuration files and log lines

🔒 PRIVACY:
Everything runs locally in your browser — nothing you select is ever sent anywhere. The extension requests no host permissions: it only acts on the tab where you use the menu. The only thing it stores is your theme choice, synced through your Chrome profile. Markdown is rendered safely: raw HTML inside it is shown as text, never executed.

⌨️ KEYBOARD SHORTCUTS:
• ESC — close the popup

Open source and free.

## Privacy practices — permission justifications

| Permission | Justification |
|---|---|
| contextMenus | Adds the "Render selected text" item to the right-click menu for selected text. |
| activeTab | Grants temporary access to the current tab only when the user clicks the menu item, so the selection can be rendered there. |
| scripting | Injects the renderer and its stylesheet into the current tab after the user clicks the menu item. |
| storage | **New in 2.0.** Saves the popup theme chosen in Options (Dark, Light, Match system or Unicorn). No page content is stored. |

**Single purpose:** Render text the user selects on a web page (JSON, TOON, Markdown, Ruby, PHP or HTML) in a readable, interactive overlay.

## Promo video

`render-selected-text-v2.0-demo.mp4` — 1:44, 1280×800, H.264 + AAC, with a generated ambient soundtrack (no third-party music). The store only accepts a YouTube link, so upload it to YouTube (public or unlisted) and paste the URL into the listing's promo video field.
