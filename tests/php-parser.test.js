/**
 * Tests for PHPParser
 */

describe('PHPParser', () => {
  describe('parse() - Valid PHP Arrays', () => {
    it('should parse simple PHP indexed array', () => {
      const input = 'array(1, 2, 3, 4, 5)';
      const result = PHPParser.parse(input);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should parse PHP associative array with string keys', () => {
      const input = "array('name' => 'John', 'age' => 30)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should parse empty PHP array', () => {
      const input = 'array()';
      const result = PHPParser.parse(input);
      expect(result).toEqual([]);
    });

    it('should parse PHP array with spaces around arrows', () => {
      const input = "array('name' => 'John', 'age' => 30)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should parse PHP array with numeric values', () => {
      const input = "array('count' => 42, 'price' => 3.14, 'negative' => -10)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ count: 42, price: 3.14, negative: -10 });
    });

    it('should parse PHP array with string values', () => {
      const input = "array('apple', 'banana', 'cherry')";
      const result = PHPParser.parse(input);
      expect(result).toEqual(['apple', 'banana', 'cherry']);
    });
  });

  describe('parse() - PHP NULL, true, false', () => {
    it('should convert NULL to null (uppercase)', () => {
      const input = "array('value' => NULL)";
      const result = PHPParser.parse(input);
      expect(result.value).toBeNull();
    });

    it('should convert null to null (lowercase)', () => {
      const input = "array('value' => null)";
      const result = PHPParser.parse(input);
      expect(result.value).toBeNull();
    });

    it('should handle true value (uppercase)', () => {
      const input = "array('active' => TRUE)";
      const result = PHPParser.parse(input);
      expect(result.active).toBe(true);
    });

    it('should handle true value (lowercase)', () => {
      const input = "array('active' => true)";
      const result = PHPParser.parse(input);
      expect(result.active).toBe(true);
    });

    it('should handle false value (uppercase)', () => {
      const input = "array('deleted' => FALSE)";
      const result = PHPParser.parse(input);
      expect(result.deleted).toBe(false);
    });

    it('should handle false value (lowercase)', () => {
      const input = "array('deleted' => false)";
      const result = PHPParser.parse(input);
      expect(result.deleted).toBe(false);
    });

    it('should handle mixed case boolean values', () => {
      const input = "array('a' => True, 'b' => False)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ a: true, b: false });
    });
  });

  describe('parse() - Nested PHP Arrays', () => {
    it('should parse nested PHP arrays', () => {
      const input = "array('numbers' => array(1, 2, 3), 'letters' => array('a', 'b'))";
      const result = PHPParser.parse(input);
      expect(result).toEqual({
        numbers: [1, 2, 3],
        letters: ['a', 'b']
      });
    });

    it('should parse multidimensional indexed arrays', () => {
      const input = 'array(array(1, 2), array(3, 4), array(5, 6))';
      const result = PHPParser.parse(input);
      expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it('should parse array of associative arrays', () => {
      const input = "array(array('name' => 'John'), array('name' => 'Jane'))";
      const result = PHPParser.parse(input);
      expect(result).toEqual([
        { name: 'John' },
        { name: 'Jane' }
      ]);
    });

    it('should parse deeply nested structures', () => {
      const input = "array('user' => array('profile' => array('name' => 'John')))";
      const result = PHPParser.parse(input);
      expect(result).toEqual({
        user: {
          profile: {
            name: 'John'
          }
        }
      });
    });
  });

  describe('parse() - PHP stdClass Objects', () => {
    it('should parse simple stdClass Object', () => {
      const input = "stdClass Object('name' => 'John', 'age' => 30)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should parse stdClass Object with newlines', () => {
      const input = "stdClass Object\n('name' => 'John', 'age' => 30)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should parse stdClass Object with multiple spaces', () => {
      const input = "stdClass Object  ('name' => 'John', 'age' => 30)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('parse() - Invalid PHP Syntax', () => {
    it('should return null for completely invalid syntax', () => {
      const input = 'invalid php code';
      const result = PHPParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for unclosed array', () => {
      const input = "array('name' => 'John'";
      const result = PHPParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const input = '';
      const result = PHPParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for plain text', () => {
      const input = 'This is just text';
      const result = PHPParser.parse(input);
      expect(result).toBeNull();
    });
  });

  describe('parse() - Edge Cases', () => {
    it('should parse PHP array with whitespace', () => {
      const input = "  array( 'name' => 'John' )  ";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ name: 'John' });
    });

    it('should parse PHP array with underscores in keys', () => {
      const input = "array('first_name' => 'John', 'last_name' => 'Doe')";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ first_name: 'John', last_name: 'Doe' });
    });

    it('should parse PHP array with numbers in keys', () => {
      const input = "array('key1' => 'value1', 'key2' => 'value2')";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should handle mixed spacing', () => {
      const input = "array('a'=>1,'b'=>2, 'c' => 3)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should parse array with all special values', () => {
      const input = "array('null' => null, 'true' => true, 'false' => false)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ null: null, true: true, false: false });
    });
  });

  describe('parse() - Real-world PHP Examples', () => {
    it('should parse typical var_dump output style', () => {
      const input = "array('id' => 123, 'name' => 'Product', 'price' => 29.99)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({
        id: 123,
        name: 'Product',
        price: 29.99
      });
    });

    it('should parse PHP array with mixed types', () => {
      const input = "array('string' => 'text', 'number' => 42, 'bool' => true, 'null' => null)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({
        string: 'text',
        number: 42,
        bool: true,
        null: null
      });
    });

    it('should parse complex nested structure', () => {
      const input = "array('users' => array(array('name' => 'John', 'active' => true), array('name' => 'Jane', 'active' => false)))";
      const result = PHPParser.parse(input);
      expect(result).toEqual({
        users: [
          { name: 'John', active: true },
          { name: 'Jane', active: false }
        ]
      });
    });

    it('should parse PHP config array', () => {
      const input = "array('database' => array('host' => 'localhost', 'port' => 3306), 'cache' => true)";
      const result = PHPParser.parse(input);
      expect(result).toEqual({
        database: {
          host: 'localhost',
          port: 3306
        },
        cache: true
      });
    });
  });

  describe('parse() - Quote Handling', () => {
    it('should convert single quotes to double quotes', () => {
      const input = "array('key' => 'value')";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ key: 'value' });
    });

    it('should handle already double-quoted strings', () => {
      const input = 'array("key" => "value")';
      const result = PHPParser.parse(input);
      expect(result).toEqual({ key: 'value' });
    });

    it('should handle mixed quotes in keys and values', () => {
      const input = "array('key1' => 'value1', \"key2\" => \"value2\")";
      const result = PHPParser.parse(input);
      expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });
  });
});
