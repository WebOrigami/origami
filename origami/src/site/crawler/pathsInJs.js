/**
 * Find static module references in JavaScript code.
 *
 * Matches:
 *
 * * `import … from "x"`
 * * `import "x"`
 * * `export … from "x"`
 * * `export { … } from "x"`
 *
 * This does simple lexical analysis to avoid matching paths inside comments or
 * string literals.
 *
 * @param {string} js
 */
export default function pathsInJs(js) {
  return {
    crawlablePaths: modulePaths(js),
    resourcePaths: [],
  };
}

function modulePaths(src) {
  const tokens = Array.from(tokenize(src));
  const paths = new Set();

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    // static import
    if (t.type === "Identifier" && t.value === "import") {
      // look ahead for either:
      //   import "mod"
      //   import … from "mod"
      let j = i + 1;
      // skip any punctuation or identifiers until we hit 'from' or a StringLiteral
      while (
        j < tokens.length &&
        tokens[j].type !== "StringLiteral" &&
        !(tokens[j].type === "Identifier" && tokens[j].value === "from")
      ) {
        j++;
      }
      // import "mod"
      if (tokens[j]?.type === "StringLiteral") {
        paths.add(tokens[j].value);
      } else if (
        // import … from "mod"
        tokens[j]?.value === "from" &&
        tokens[j + 1]?.type === "StringLiteral"
      ) {
        paths.add(tokens[j + 1].value);
      }
    } else if (t.type === "Identifier" && t.value === "export") {
      // re-export or export‐from

      // find a 'from' token on the same statement
      let j = i + 1;
      while (
        j < tokens.length &&
        !(tokens[j].type === "Identifier" && tokens[j].value === "from")
      ) {
        // stop at semicolon so we don't run past the statement
        if (tokens[j].type === "Punctuator" && tokens[j].value === ";") {
          break;
        }
        j++;
      }

      if (
        tokens[j]?.value === "from" &&
        tokens[j + 1]?.type === "StringLiteral"
      ) {
        paths.add(tokens[j + 1].value);
      }
    }
  }

  return [...paths];
}

// Lexer emits Identifiers, StringLiterals, and Punctuators
function* tokenize(src) {
  let i = 0;
  while (i < src.length) {
    const c = src[i];

    // Skip single‐line comments
    if (c === "/" && src[i + 1] === "/") {
      i += 2;
      while (i < src.length && src[i] !== "\n") {
        i++;
      }
    } else if (c === "/" && src[i + 1] === "*") {
      // Skip multi‐line comments
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        i++;
      }
      i += 2;
      continue;
    } else if (c === '"' || c === "'" || c === "`") {
      // Skip string literals (but capture them)
      const quote = c;
      let start = i + 1;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") {
          i += 2;
          continue;
        }
        if (src[i] === quote) {
          break;
        }
        i++;
      }
      const str = src.slice(start, i);
      i++;
      yield { type: "StringLiteral", value: str };
      continue;
    } else if (/[A-Za-z_$]/.test(c)) {
      // Identifier
      let start = i;
      i++;
      while (i < src.length && /[\w$]/.test(src[i])) {
        i++;
      }
      yield { type: "Identifier", value: src.slice(start, i) };
      continue;
    } else if (/[{}();,]/.test(c)) {
      // Punctuator (we still keep braces/semis for possible future use)
      yield { type: "Punctuator", value: c };
      i++;
      continue;
    } else {
      // Skip everything else (whitespace, operators, etc.)
      i++;
    }
  }
}
