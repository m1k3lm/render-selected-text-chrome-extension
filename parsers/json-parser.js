/**
 * JSONParser - Parses native JSON objects
 */
const JSONParser = {
  parse(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return null;
    }
  }
};
