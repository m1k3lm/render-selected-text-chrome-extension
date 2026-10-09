/**
 * Tests for TOONParser
 */

describe('TOONParser.decode() - Objects and primitives', () => {
  it('should decode key-value lines with typed primitives', () => {
    expect(TOONParser.decode('id: 123\nname: Ada\nactive: true\nscore: -1.5e2\nmanager: null'))
      .toEqual({ id: 123, name: 'Ada', active: true, score: -150, manager: null });
  });

  it('should decode nested objects by indentation', () => {
    expect(TOONParser.decode('user:\n  name: Ada\n  address:\n    city: Paris'))
      .toEqual({ user: { name: 'Ada', address: { city: 'Paris' } } });
  });

  it('should decode a bare key as an empty object and "key: []" as an empty array', () => {
    expect(TOONParser.decode('meta:\ntags: []')).toEqual({ meta: {}, tags: [] });
  });

  it('should keep quoted values as strings and unescape them', () => {
    expect(TOONParser.decode('a: "42"\nb: "x, y: z"\nc: "line\\nnext \\"q\\""'))
      .toEqual({ a: '42', b: 'x, y: z', c: 'line\nnext "q"' });
  });

  it('should treat numbers outside the JSON grammar as strings', () => {
    expect(TOONParser.decode('a: 05\nb: 1.\nc: +5')).toEqual({ a: '05', b: '1.', c: '+5' });
  });

  it('should decode quoted keys and keep dotted keys literal', () => {
    expect(TOONParser.decode('"full name": Ada\nuser.id: 7')).toEqual({ 'full name': 'Ada', 'user.id': 7 });
  });

  it('should ignore full-line comments', () => {
    expect(TOONParser.decode('# config\na: 1\n  # indented comment\nb: 2')).toEqual({ a: 1, b: 2 });
  });
});

describe('TOONParser.decode() - Arrays', () => {
  it('should decode inline primitive arrays', () => {
    expect(TOONParser.decode('tags[3]: admin,ops,"a,b"')).toEqual({ tags: ['admin', 'ops', 'a,b'] });
  });

  it('should decode tabular arrays of objects', () => {
    expect(TOONParser.decode('users[2]{id,name,role}:\n  1,Alice,admin\n  2,Bob,user')).toEqual({
      users: [{ id: 1, name: 'Alice', role: 'admin' }, { id: 2, name: 'Bob', role: 'user' }]
    });
  });

  it('should decode tabular arrays with nested field groups', () => {
    expect(TOONParser.decode('orders[1]{id,customer{name,country}}:\n  7,Ada,UK'))
      .toEqual({ orders: [{ id: 7, customer: { name: 'Ada', country: 'UK' } }] });
  });

  it('should decode list arrays mixing primitives, objects and inner arrays', () => {
    expect(TOONParser.decode('items[3]:\n  - summary\n  - id: 1\n    name: Ada\n  - [2]: 1,2'))
      .toEqual({ items: ['summary', { id: 1, name: 'Ada' }, [1, 2]] });
  });

  it('should nest a tabular array as the first field of a list item', () => {
    expect(TOONParser.decode('teams[1]:\n  - members[2]{id}:\n      1\n      2\n    name: core'))
      .toEqual({ teams: [{ members: [{ id: 1 }, { id: 2 }], name: 'core' }] });
  });

  it('should decode keyed tabular objects', () => {
    expect(TOONParser.decode('scores[2:]{math,art}:\n  ada: 9,7\n  bob: 6,8'))
      .toEqual({ scores: { ada: { math: 9, art: 7 }, bob: { math: 6, art: 8 } } });
  });

  it('should decode root arrays', () => {
    expect(TOONParser.decode('[3]: x,y,true')).toEqual(['x', 'y', true]);
    expect(TOONParser.decode('[2]{id}:\n  1\n  2')).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should honour tab and pipe delimiters', () => {
    expect(TOONParser.decode('tags[2|]: a,b|c')).toEqual({ tags: ['a,b', 'c'] });
    expect(TOONParser.decode('rows[1\t]{a\tb}:\n  x,y\tz')).toEqual({ rows: [{ a: 'x,y', b: 'z' }] });
  });

  it('should decode empty arrays in legacy and list forms', () => {
    expect(TOONParser.decode('a[0]:\nb[2]:\n  - []\n  -')).toEqual({ a: [], b: [[], {}] });
  });
});

describe('TOONParser.decode() - Strict errors', () => {
  it('should reject declared lengths that do not match', () => {
    expect(() => TOONParser.decode('tags[2]: a,b,c')).toThrow();
    expect(() => TOONParser.decode('users[2]{id}:\n  1')).toThrow();
  });

  it('should reject rows whose width differs from the header', () => {
    expect(() => TOONParser.decode('users[1]{id,name}:\n  1')).toThrow();
  });

  it('should reject bad indentation, duplicate keys and invalid escapes', () => {
    expect(() => TOONParser.decode('a:\n   b: 1')).toThrow();
    expect(() => TOONParser.decode('a: 1\na: 2')).toThrow();
    expect(() => TOONParser.decode('a: "\\x"')).toThrow();
  });

  it('should reject blank lines inside an array scope', () => {
    expect(() => TOONParser.decode('items[2]:\n  - a\n\n  - b')).toThrow();
  });
});

describe('TOONParser.parse() - Selections', () => {
  it('should decode documents with array headers', () => {
    expect(TOONParser.parse('users[2]{id,name}:\n  1,Ada\n  2,Bob'))
      .toEqual({ users: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Bob' }] });
  });

  it('should decode nested objects without arrays', () => {
    expect(TOONParser.parse('server:\n  host: localhost\n  port: 8080'))
      .toEqual({ server: { host: 'localhost', port: 8080 } });
  });

  it('should strip common indentation and infer a four-space indent', () => {
    expect(TOONParser.parse('    app:\n        name: demo\n        tags[2]: a,b'))
      .toEqual({ app: { name: 'demo', tags: ['a', 'b'] } });
  });

  it('should accept Windows line endings', () => {
    expect(TOONParser.parse('tags[2]: a,b\r\nok: true')).toEqual({ tags: ['a', 'b'], ok: true });
  });
});

describe('TOONParser.parse() - Rejects other text', () => {
  it('should reject plain prose and single key-value lines', () => {
    expect(TOONParser.parse('Just a sentence.')).toBeNull();
    expect(TOONParser.parse('Note: this is important')).toBeNull();
  });

  it('should reject flat key-value lines such as email headers', () => {
    expect(TOONParser.parse('From: ada@example.com\nSubject: Hello')).toBeNull();
  });

  it('should reject YAML-style lists and Markdown documents', () => {
    expect(TOONParser.parse('fruits:\n  - apple\n  - pear')).toBeNull();
    expect(TOONParser.parse('# Title\n\n- one\n- two\n\nSome **bold** text.')).toBeNull();
  });

  it('should reject source code that only looks indented', () => {
    expect(TOONParser.parse('def greet(name):\n    return name')).toBeNull();
  });

  it('should reject invalid TOON instead of guessing', () => {
    expect(TOONParser.parse('tags[3]: a,b')).toBeNull();
    expect(TOONParser.parse('   ')).toBeNull();
    expect(TOONParser.parse(null)).toBeNull();
  });
});
