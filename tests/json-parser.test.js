/**
 * Tests for JSONParser
 */

describe('JSONParser', () => {
  describe('parse() - Valid JSON', () => {
    it('should parse a simple JSON object', () => {
      const input = '{"name": "John", "age": 30}';
      const result = JSONParser.parse(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should parse a JSON array', () => {
      const input = '[1, 2, 3, 4, 5]';
      const result = JSONParser.parse(input);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should parse nested JSON objects', () => {
      const input = '{"user": {"name": "Jane", "email": "jane@example.com"}}';
      const result = JSONParser.parse(input);
      expect(result).toEqual({
        user: {
          name: 'Jane',
          email: 'jane@example.com'
        }
      });
    });

    it('should parse nested JSON arrays', () => {
      const input = '[[1, 2], [3, 4], [5, 6]]';
      const result = JSONParser.parse(input);
      expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it('should parse JSON with mixed types', () => {
      const input = '{"string": "text", "number": 42, "boolean": true, "null": null, "array": [1, 2]}';
      const result = JSONParser.parse(input);
      expect(result).toEqual({
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2]
      });
    });

    it('should parse empty JSON object', () => {
      const input = '{}';
      const result = JSONParser.parse(input);
      expect(result).toEqual({});
    });

    it('should parse empty JSON array', () => {
      const input = '[]';
      const result = JSONParser.parse(input);
      expect(result).toEqual([]);
    });

    it('should parse JSON with special characters in strings', () => {
      const input = '{"message": "Hello\\nWorld", "path": "C:\\\\Users\\\\test"}';
      const result = JSONParser.parse(input);
      expect(result.message).toBe('Hello\nWorld');
      expect(result.path).toBe('C:\\Users\\test');
    });

    it('should parse JSON with unicode characters', () => {
      const input = '{"emoji": "😀", "spanish": "Niño"}';
      const result = JSONParser.parse(input);
      expect(result.emoji).toBe('😀');
      expect(result.spanish).toBe('Niño');
    });

    it('should parse JSON number values', () => {
      const input = '{"int": 42, "float": 3.14, "negative": -10, "exponential": 1e5}';
      const result = JSONParser.parse(input);
      expect(result.int).toBe(42);
      expect(result.float).toBe(3.14);
      expect(result.negative).toBe(-10);
      expect(result.exponential).toBe(100000);
    });
  });

  describe('parse() - Invalid JSON', () => {
    it('should return null for invalid JSON syntax', () => {
      const input = '{invalid json}';
      const result = JSONParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for unclosed braces', () => {
      const input = '{"name": "John"';
      const result = JSONParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for single quotes instead of double quotes', () => {
      const input = "{'name': 'John'}";
      const result = JSONParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for trailing commas', () => {
      const input = '{"name": "John",}';
      const result = JSONParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for unquoted keys', () => {
      const input = '{name: "John"}';
      const result = JSONParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const input = '';
      const result = JSONParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const input = 'undefined';
      const result = JSONParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for plain text', () => {
      const input = 'This is just plain text';
      const result = JSONParser.parse(input);
      expect(result).toBeNull();
    });
  });

  describe('parse() - Edge Cases', () => {
    it('should parse JSON with whitespace', () => {
      const input = '  { "name" : "John" }  ';
      const result = JSONParser.parse(input);
      expect(result).toEqual({ name: 'John' });
    });

    it('should parse JSON null value', () => {
      const input = 'null';
      const result = JSONParser.parse(input);
      expect(result).toBeNull();
    });

    it('should parse JSON boolean values', () => {
      const trueResult = JSONParser.parse('true');
      const falseResult = JSONParser.parse('false');
      expect(trueResult).toBe(true);
      expect(falseResult).toBe(false);
    });

    it('should parse JSON string primitives', () => {
      const input = '"Hello World"';
      const result = JSONParser.parse(input);
      expect(result).toBe('Hello World');
    });

    it('should parse JSON number primitives', () => {
      const input = '42';
      const result = JSONParser.parse(input);
      expect(result).toBe(42);
    });

    it('should handle deeply nested structures', () => {
      const input = '{"a":{"b":{"c":{"d":{"e":"value"}}}}}';
      const result = JSONParser.parse(input);
      expect(result.a.b.c.d.e).toBe('value');
    });
  });
});
