// Import individual parsers
import ruby from './ruby.js';
import php from './php.js';

// Export a single parseText function
export function parseText(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return ruby(text) || php(text);
  }
}