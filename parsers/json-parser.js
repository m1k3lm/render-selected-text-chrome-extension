/**
 * JSONParser - Parses native JSON objects
 */
if (typeof JSONParser === 'undefined') {
  window.JSONParser = {
    parse(text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return null;
      }
    }
  };
}
