/**
 * Tests for RubyParser
 */

describe('RubyParser', () => {
  describe('parse() - Valid Ruby Hashes', () => {
    it('should parse Ruby hash with symbol keys', () => {
      const input = '{:name=>"John", :age=>30}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should parse Ruby hash with string keys', () => {
      const input = '{"name"=>"Jane", "email"=>"jane@example.com"}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ name: 'Jane', email: 'jane@example.com' });
    });

    it('should parse Ruby hash with mixed key types', () => {
      const input = '{:name=>"John", "age"=>30}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should parse Ruby hash with spaces around arrows', () => {
      const input = '{:name => "John", :age => 30}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should parse empty Ruby hash', () => {
      const input = '{}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({});
    });

    it('should parse Ruby hash with nil value', () => {
      const input = '{:name=>"John", :middle=>nil}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ name: 'John', middle: null });
    });

    it('should parse Ruby hash with boolean values', () => {
      const input = '{:active=>true, :deleted=>false}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ active: true, deleted: false });
    });

    it('should parse Ruby hash with numeric values', () => {
      const input = '{:count=>42, :price=>3.14, :negative=>-10}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ count: 42, price: 3.14, negative: -10 });
    });
  });

  describe('parse() - Valid Ruby Arrays', () => {
    it('should parse simple Ruby array', () => {
      const input = '[1, 2, 3, 4, 5]';
      const result = RubyParser.parse(input);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should parse Ruby array with strings', () => {
      const input = '["apple", "banana", "cherry"]';
      const result = RubyParser.parse(input);
      expect(result).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should parse empty Ruby array', () => {
      const input = '[]';
      const result = RubyParser.parse(input);
      expect(result).toEqual([]);
    });

    it('should parse Ruby array with nil', () => {
      const input = '[1, nil, 3]';
      const result = RubyParser.parse(input);
      expect(result).toEqual([1, null, 3]);
    });

    it('should parse Ruby array with booleans', () => {
      const input = '[true, false, true]';
      const result = RubyParser.parse(input);
      expect(result).toEqual([true, false, true]);
    });
  });

  describe('parse() - Nested Ruby Structures', () => {
    it('should parse Ruby hash with array values', () => {
      const input = '{:numbers=>[1, 2, 3], :letters=>["a", "b"]}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({
        numbers: [1, 2, 3],
        letters: ['a', 'b']
      });
    });

    it('should parse Ruby array with hash elements', () => {
      const input = '[{:name=>"John"}, {:name=>"Jane"}]';
      const result = RubyParser.parse(input);
      expect(result).toEqual([
        { name: 'John' },
        { name: 'Jane' }
      ]);
    });

    it('should parse nested Ruby hashes', () => {
      const input = '{:user=>{:name=>"John", :age=>30}}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({
        user: {
          name: 'John',
          age: 30
        }
      });
    });

    it('should parse nested Ruby arrays', () => {
      const input = '[[1, 2], [3, 4], [5, 6]]';
      const result = RubyParser.parse(input);
      expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
    });
  });

  describe('parse() - Ruby Special Values', () => {
    it('should convert nil to null', () => {
      const input = '{:value=>nil}';
      const result = RubyParser.parse(input);
      expect(result.value).toBeNull();
    });

    it('should handle true value', () => {
      const input = '{:active=>true}';
      const result = RubyParser.parse(input);
      expect(result.active).toBe(true);
    });

    it('should handle false value', () => {
      const input = '{:active=>false}';
      const result = RubyParser.parse(input);
      expect(result.active).toBe(false);
    });

    it('should handle multiple nil values', () => {
      const input = '[nil, nil, nil]';
      const result = RubyParser.parse(input);
      expect(result).toEqual([null, null, null]);
    });
  });

  describe('parse() - Invalid Ruby Syntax', () => {
    it('should return null for completely invalid syntax', () => {
      const input = 'invalid ruby code';
      const result = RubyParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for unclosed braces', () => {
      const input = '{:name=>"John"';
      const result = RubyParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const input = '';
      const result = RubyParser.parse(input);
      expect(result).toBeNull();
    });

    it('should return null for plain text', () => {
      const input = 'This is just text';
      const result = RubyParser.parse(input);
      expect(result).toBeNull();
    });
  });

  describe('parse() - Edge Cases', () => {
    it('should parse Ruby hash with whitespace', () => {
      const input = '  { :name => "John" }  ';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ name: 'John' });
    });

    it('should parse Ruby hash with underscore in symbol names', () => {
      const input = '{:first_name=>"John", :last_name=>"Doe"}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ first_name: 'John', last_name: 'Doe' });
    });

    it('should parse Ruby hash with numbers in symbol names', () => {
      const input = '{:key1=>"value1", :key2=>"value2"}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should handle mixed spacing', () => {
      const input = '{:a=>1,:b=>2, :c => 3}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should parse complex nested structure', () => {
      const input = '{:users=>[{:name=>"John", :active=>true}, {:name=>"Jane", :active=>false}]}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({
        users: [
          { name: 'John', active: true },
          { name: 'Jane', active: false }
        ]
      });
    });
  });

  describe('parse() - Real-world Ruby Examples', () => {
    it('should parse typical Rails params hash', () => {
      const input = '{:controller=>"users", :action=>"show", :id=>123}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({
        controller: 'users',
        action: 'show',
        id: 123
      });
    });

    it('should parse Ruby inspect output', () => {
      const input = '{:name=>"Product", :price=>29.99, :available=>true}';
      const result = RubyParser.parse(input);
      expect(result).toEqual({
        name: 'Product',
        price: 29.99,
        available: true
      });
    });
  });
});
