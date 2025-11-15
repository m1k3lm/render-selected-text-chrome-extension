/**
 * RubyParser - Parses Ruby objects (hashes and arrays) into JSON
 * Supports symbols (:symbol), nested structures, nil, true, false
 */
if (typeof RubyParser === 'undefined') {
  window.RubyParser = {
    parse(text) {
      try {
        let ruby = text.trim();

        // Convert symbols used as hash keys (:key => value) to JSON keys ("key": value)
        ruby = ruby.replace(/:([a-zA-Z0-9_]+)\s*=>/g, '"$1":');

        // Convert string keys ("key" => value) to JSON format ("key": value)
        ruby = ruby.replace(/"([^"]+)"\s*=>/g, '"$1":');

        // Convert any remaining => to :
        ruby = ruby.replace(/=>/g, ':');

        // Convert bare symbols to strings (only when preceded by [, {, comma, or space)
        // This avoids matching the : in JSON keys like "key":
        ruby = ruby.replace(/([\[\{,\s]):([a-zA-Z0-9_]+)/g, '$1"$2"');

        // Convert Ruby keywords to JSON
        ruby = ruby.replace(/\bnil\b/g, 'null');
        ruby = ruby.replace(/\btrue\b/g, 'true').replace(/\bfalse\b/g, 'false');

        return JSON.parse(ruby);
      } catch (e) {
        return null;
      }
    }
  };
}
