/**
 * Tests for MarkdownParser
 */

describe('MarkdownParser.isMarkdown() - Detects Markdown', () => {
  it('should detect an ATX heading', () => {
    expect(MarkdownParser.isMarkdown('# Title\n\nSome text')).toBe(true);
  });

  it('should detect a fenced code block', () => {
    expect(MarkdownParser.isMarkdown('Run this:\n```bash\nnpm install\n```')).toBe(true);
  });

  it('should detect an inline link', () => {
    expect(MarkdownParser.isMarkdown('See [the docs](https://example.com) for more')).toBe(true);
  });

  it('should detect a table', () => {
    expect(MarkdownParser.isMarkdown('| a | b |\n|---|---|\n| 1 | 2 |')).toBe(true);
  });

  it('should detect a bullet list with several items', () => {
    expect(MarkdownParser.isMarkdown('- one\n- two\n- three')).toBe(true);
  });

  it('should detect combined bold and inline code', () => {
    expect(MarkdownParser.isMarkdown('Use **npm** to run `test`')).toBe(true);
  });

  it('should detect Markdown whose code fence contains HTML', () => {
    expect(MarkdownParser.isMarkdown('# Example\n```html\n<div>hi</div>\n```')).toBe(true);
  });

  it('should detect structured Markdown that embeds raw HTML', () => {
    expect(MarkdownParser.isMarkdown('# Title\n\n<details><summary>More</summary>hidden</details>')).toBe(true);
  });
});

describe('MarkdownParser.isMarkdown() - Rejects other formats', () => {
  it('should reject plain prose', () => {
    expect(MarkdownParser.isMarkdown('Just a normal sentence, nothing special.')).toBe(false);
  });

  it('should reject prose with a single emphasis marker', () => {
    expect(MarkdownParser.isMarkdown('This is **important** to know.')).toBe(false);
  });

  it('should reject HTML markup', () => {
    expect(MarkdownParser.isMarkdown('<h1>Hello</h1>\n<p>This is <strong>HTML</strong></p>')).toBe(false);
  });

  it('should reject an HTML list even though its lines look like list items', () => {
    expect(MarkdownParser.isMarkdown('<ul>\n- <li>one</li>\n- <li>two</li>\n</ul>')).toBe(false);
  });

  it('should reject a hashtag without a space', () => {
    expect(MarkdownParser.isMarkdown('#hashtag trending today')).toBe(false);
  });

  it('should reject empty and non-string input', () => {
    expect(MarkdownParser.isMarkdown('   ')).toBe(false);
    expect(MarkdownParser.isMarkdown(null)).toBe(false);
  });
});

describe('MarkdownParser.toHTML() - Blocks', () => {
  it('should render ATX headings of every level', () => {
    expect(MarkdownParser.toHTML('# One')).toBe('<h1>One</h1>');
    expect(MarkdownParser.toHTML('###### Six ##')).toBe('<h6>Six</h6>');
  });

  it('should render setext headings', () => {
    expect(MarkdownParser.toHTML('Title\n=====')).toBe('<h1>Title</h1>');
    expect(MarkdownParser.toHTML('Sub\n---')).toBe('<h2>Sub</h2>');
  });

  it('should join paragraph lines and split on blank lines', () => {
    expect(MarkdownParser.toHTML('a\nb\n\nc')).toBe('<p>a\nb</p>\n<p>c</p>');
  });

  it('should render a fenced code block with language and escaped content', () => {
    expect(MarkdownParser.toHTML('```js\nconst a = 1 < 2;\n```'))
      .toBe('<pre><code class="language-js">const a = 1 &lt; 2;</code></pre>');
  });

  it('should keep Markdown syntax literal inside code blocks', () => {
    expect(MarkdownParser.toHTML('~~~\n# not a heading\n**x**\n~~~'))
      .toBe('<pre><code># not a heading\n**x**</code></pre>');
  });

  it('should render horizontal rules', () => {
    expect(MarkdownParser.toHTML('a\n\n---\n\nb')).toBe('<p>a</p>\n<hr>\n<p>b</p>');
    expect(MarkdownParser.toHTML('* * *')).toBe('<hr>');
  });

  it('should render blockquotes with nested blocks', () => {
    expect(MarkdownParser.toHTML('> # Quote\n> text'))
      .toBe('<blockquote>\n<h1>Quote</h1>\n<p>text</p>\n</blockquote>');
  });

  it('should render a tight unordered list', () => {
    expect(MarkdownParser.toHTML('- a\n- b')).toBe('<ul>\n<li>a</li>\n<li>b</li>\n</ul>');
  });

  it('should render an ordered list with a custom start', () => {
    expect(MarkdownParser.toHTML('3. c\n4. d')).toBe('<ol start="3">\n<li>c</li>\n<li>d</li>\n</ol>');
  });

  it('should render nested lists', () => {
    expect(MarkdownParser.toHTML('- a\n  - a1\n  - a2\n- b'))
      .toBe('<ul>\n<li>a\n<ul>\n<li>a1</li>\n<li>a2</li>\n</ul></li>\n<li>b</li>\n</ul>');
  });

  it('should render an ordered list nested in a bullet list', () => {
    expect(MarkdownParser.toHTML('- a\n    1. x\n    2. y'))
      .toBe('<ul>\n<li>a\n<ol>\n<li>x</li>\n<li>y</li>\n</ol></li>\n</ul>');
  });

  it('should wrap loose list items in paragraphs', () => {
    expect(MarkdownParser.toHTML('- a\n\n- b')).toBe('<ul>\n<li><p>a</p></li>\n<li><p>b</p></li>\n</ul>');
  });

  it('should render task list items as disabled checkboxes', () => {
    expect(MarkdownParser.toHTML('- [ ] todo\n- [x] done')).toBe(
      '<ul>\n<li class="rst-task-item"><input type="checkbox" disabled> todo</li>\n' +
      '<li class="rst-task-item"><input type="checkbox" disabled checked> done</li>\n</ul>'
    );
  });

  it('should end a list at a following paragraph after a blank line', () => {
    expect(MarkdownParser.toHTML('- a\n\nafter')).toBe('<ul>\n<li>a</li>\n</ul>\n<p>after</p>');
  });

  it('should render a table with alignment', () => {
    expect(MarkdownParser.toHTML('| Name | Qty |\n|:-----|----:|\n| apple | 3 |')).toBe(
      '<table><thead><tr><th class="rst-align-left">Name</th><th class="rst-align-right">Qty</th></tr></thead>' +
      '<tbody><tr><td class="rst-align-left">apple</td><td class="rst-align-right">3</td></tr></tbody></table>'
    );
  });

  it('should keep escaped pipes inside table cells', () => {
    expect(MarkdownParser.toHTML('| a |\n|---|\n| x \\| y |')).toContain('<td>x | y</td>');
  });

  it('should render a document mixing several blocks', () => {
    const html = MarkdownParser.toHTML('# Title\n\nIntro text.\n\n- one\n- two\n\n```\ncode\n```');
    expect(html).toBe('<h1>Title</h1>\n<p>Intro text.</p>\n<ul>\n<li>one</li>\n<li>two</li>\n</ul>\n<pre><code>code</code></pre>');
  });
});

describe('MarkdownParser.toHTML() - Inline', () => {
  it('should render bold, italic, bold-italic and strikethrough', () => {
    expect(MarkdownParser.toHTML('**b** *i* ***bi*** ~~s~~'))
      .toBe('<p><strong>b</strong> <em>i</em> <strong><em>bi</em></strong> <del>s</del></p>');
  });

  it('should render underscore emphasis but not inside words', () => {
    expect(MarkdownParser.toHTML('__b__ _i_ snake_case_name'))
      .toBe('<p><strong>b</strong> <em>i</em> snake_case_name</p>');
  });

  it('should not treat spaced asterisks as emphasis', () => {
    expect(MarkdownParser.toHTML('2 * 3 * 4')).toBe('<p>2 * 3 * 4</p>');
  });

  it('should render inline code without applying emphasis inside it', () => {
    expect(MarkdownParser.toHTML('Use `a_b * c_d` here')).toBe('<p>Use <code>a_b * c_d</code> here</p>');
  });

  it('should render links with titles and emphasized labels', () => {
    expect(MarkdownParser.toHTML('[**Docs**](https://x.com/a_b_c "Help")'))
      .toBe('<p><a href="https://x.com/a_b_c" title="Help"><strong>Docs</strong></a></p>');
  });

  it('should render images', () => {
    expect(MarkdownParser.toHTML('![logo](img/logo.png)')).toBe('<p><img src="img/logo.png" alt="logo"></p>');
  });

  it('should autolink bare and angle-bracket URLs', () => {
    expect(MarkdownParser.toHTML('Visit https://example.com/a_b.'))
      .toBe('<p>Visit <a href="https://example.com/a_b">https://example.com/a_b</a>.</p>');
    expect(MarkdownParser.toHTML('<https://example.com>'))
      .toBe('<p><a href="https://example.com">https://example.com</a></p>');
  });

  it('should honour backslash escapes', () => {
    expect(MarkdownParser.toHTML('\\*not em\\*')).toBe('<p>*not em*</p>');
  });

  it('should render hard line breaks', () => {
    expect(MarkdownParser.toHTML('a  \nb')).toBe('<p>a<br>\nb</p>');
  });
});

describe('MarkdownParser.toHTML() - Safety', () => {
  it('should escape raw HTML instead of rendering it', () => {
    expect(MarkdownParser.toHTML('<script>alert(1)</script>'))
      .toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  });

  it('should escape HTML inside headings and list items', () => {
    expect(MarkdownParser.toHTML('# <img src=x onerror=alert(1)>')).toBe('<h1>&lt;img src=x onerror=alert(1)&gt;</h1>');
    expect(MarkdownParser.toHTML('- <b>x</b>')).toBe('<ul>\n<li>&lt;b&gt;x&lt;/b&gt;</li>\n</ul>');
  });

  it('should neutralize javascript: and data: URLs', () => {
    expect(MarkdownParser.toHTML('[x](javascript:alert(1))')).toContain('href="#"');
    expect(MarkdownParser.toHTML('[x](JaVaScRiPt:alert(1))')).toContain('href="#"');
    expect(MarkdownParser.toHTML('![x](data:image/svg+xml,abc)')).toContain('src="#"');
  });

  it('should not let link titles break out of the attribute', () => {
    const html = MarkdownParser.toHTML('[x](https://a.com "t\\" onmouseover=\\"alert(1)")');
    expect(html.includes('onmouseover="alert')).toBe(false);
  });
});
