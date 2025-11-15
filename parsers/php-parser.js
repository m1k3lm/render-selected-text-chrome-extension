/**
 * PHPParser - Parses PHP objects (arrays and stdClass) into JSON
 * Uses a stack-based approach to handle nested structures
 */
if (typeof PHPParser === 'undefined') {
  window.PHPParser = {
    parse(text) {
      try {
        let php = text.trim();

        php = php.replace(/'([^']+)'\s*=>/g, '"$1":');
        php = php.replace(/=>/g, ':');
        php = php.replace(/\bNULL\b/gi, 'null');
        php = php.replace(/\btrue\b/gi, 'true');
        php = php.replace(/\bfalse\b/gi, 'false');
        php = php.replace(/'/g, '"');

        let result = '';
        let stack = [];
        let i = 0;

        while (i < php.length) {
          if (php.substr(i, 15) === 'stdClass Object' || php.substr(i, 20).match(/^stdClass\s+Object/i)) {
            while (i < php.length && php[i] !== '(') {
              i++;
            }
            if (i < php.length && php[i] === '(') {
              result += '{';
              stack.push('object');
              i++;
            }
          }
          else if (php.substr(i).match(/^array\s*\(/i)) {
            let match = php.substr(i).match(/^array\s*\(/i);

            let depth = 0;
            let j = i + match[0].length;
            let hasColon = false;
            let inString = false;

            while (j < php.length) {
              if (php[j] === '"' && php[j-1] !== '\\') {
                inString = !inString;
              }
              if (!inString) {
                if (php[j] === '(') depth++;
                else if (php[j] === ')') {
                  if (depth === 0) break;
                  depth--;
                }
                else if (php[j] === ':' && depth === 0) {
                  hasColon = true;
                }
              }
              j++;
            }

            if (hasColon) {
              result += '{';
              stack.push('assoc');
            } else {
              result += '[';
              stack.push('array');
            }
            i += match[0].length;
          }
          else if (php[i] === ')') {
            if (stack.length > 0) {
              const type = stack.pop();
              if (type === 'array') {
                result += ']';
              } else if (type === 'object' || type === 'assoc') {
                result += '}';
              } else {
                result += ')';
              }
            } else {
              result += ')';
            }
            i++;
          }
          else {
            result += php[i];
            i++;
          }
        }

        php = result;
        return JSON.parse(php);
      } catch (e) {
        return null;
      }
    }
  };
}
