# Parser Test Suite

Comprehensive test suite for the JSON, Ruby, and PHP parsers used in the Render Selected Text Chrome Extension.

## Running the Tests

### Browser-Based Testing (Recommended)

1. Open `test-runner.html` in your browser:
   ```bash
   open test-runner.html
   # or
   # Open the file directly in Chrome/Firefox
   ```

2. Click the "Run Tests" button to execute all tests

3. View results in both:
   - The styled console on the page
   - Browser DevTools console (F12) for detailed output

### What's Tested

#### JSONParser Tests (json-parser.test.js)
- ✓ Valid JSON objects and arrays
- ✓ Nested structures
- ✓ Mixed data types
- ✓ Special characters and unicode
- ✓ Invalid JSON syntax
- ✓ Edge cases (null, booleans, primitives)

#### RubyParser Tests (ruby-parser.test.js)
- ✓ Ruby hashes with symbol keys (`:key=>value`)
- ✓ Ruby hashes with string keys (`"key"=>"value"`)
- ✓ Ruby arrays
- ✓ Ruby special values (`nil`, `true`, `false`)
- ✓ Nested structures
- ✓ Invalid Ruby syntax
- ✓ Real-world Rails output

#### PHPParser Tests (php-parser.test.js)
- ✓ PHP `array()` syntax
- ✓ PHP associative arrays
- ✓ PHP special values (`NULL`, `true`, `false`)
- ✓ `stdClass Object` syntax
- ✓ Nested arrays
- ✓ Invalid PHP syntax
- ✓ Real-world var_dump output

## Test Structure

```
tests/
├── test-framework.js      # Lightweight test framework
├── test-runner.html       # Browser-based test runner UI
├── json-parser.test.js    # JSONParser tests
├── ruby-parser.test.js    # RubyParser tests
├── php-parser.test.js     # PHPParser tests
└── README.md             # This file
```

## Test Framework

The test suite uses a custom lightweight test framework that provides:

- `describe(name, fn)` - Group related tests
- `it(description, fn)` - Define individual test cases
- `expect(actual)` - Assertion helper with matchers:
  - `.toBe(expected)` - Strict equality
  - `.toEqual(expected)` - Deep equality
  - `.toBeNull()` - Check for null
  - `.toBeUndefined()` - Check for undefined
  - `.toBeTruthy()` - Check for truthy value
  - `.toBeFalsy()` - Check for falsy value
  - `.toContain(item)` - Check array/string contains item
  - `.toHaveProperty(prop)` - Check object has property

## Adding New Tests

To add new test cases, edit the appropriate test file:

```javascript
describe('ParserName', () => {
  it('should do something', () => {
    const input = 'test input';
    const result = Parser.parse(input);
    expect(result).toEqual({ expected: 'value' });
  });
});
```

Then refresh `test-runner.html` to run the updated tests.

## Test Statistics

The test runner displays:
- Total number of test suites
- Total number of tests
- Passed tests count
- Failed tests count
- Individual test results with descriptions

## Continuous Testing

For development, keep `test-runner.html` open in a browser tab and refresh after making changes to:
- Parser implementations (`../parsers/*.js`)
- Test files (`*.test.js`)

## Browser Compatibility

Tests run in any modern browser that supports:
- ES6+ JavaScript
- DOM APIs
- Console API

Tested with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
