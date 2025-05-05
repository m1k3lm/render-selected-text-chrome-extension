
/**
 * Tries to parse a simple Ruby object (hash or array) into a JSON object.
 *
 * Detects simple cases like {"key"=>"value", :foo=>123, "arr"=>[1,2,3]}
 * and returns the equivalent JSON object or null if it fails.
 *
 * Does not cover all the complex cases (like nested objects or arrays).
 *
 * @param {string} text - The Ruby object to be parsed.
 * @returns {Object|Array|null} The JSON object or array if parsed successfully,
 *                              or null if the parsing fails.
 */

export default function php(text) {
    try {
        let ruby = text.trim();
        // Reemplaza símbolos :foo=> por "foo":
        ruby = ruby.replace(/:([a-zA-Z0-9_]+)\s*=>/g, '"$1":');
        // Reemplaza claves entre comillas "foo"=> por "foo":
        ruby = ruby.replace(/"([^"]+)"\s*=>/g, '"$1":');
        // Reemplaza nil por null
        ruby = ruby.replace(/\bnil\b/g, 'null');
        // Reemplaza true/false
        ruby = ruby.replace(/\btrue\b/g, 'true').replace(/\bfalse\b/g, 'false');
        // Reemplaza => por : (por si queda alguno)
        ruby = ruby.replace(/=>/g, ':');
        // Intenta parsear como JSON
        return JSON.parse(ruby);
    } catch (e) {
        return null;
    }
}
