/**
 * Return true if the given text is Origami front matter
 *
 * Our heurstic is to see skip any initial alphanumeric or underscore
 * characters, then see if the next character is a parenthesis, dot, slash, or
 * curly brace. If so, we assume this is an Origami expression.
 *
 * The goal is to identify Origami front matter like:
 *
 * ```
 *   fn(x)              function call
 *   index.ori()        file extension
 *   src/data.json      file path
 *   // Hello           comment
 *   { a: 1 }           object literal
 * ```
 *
 * These are generally invalid ways to start YAML. The last is valid YAML, but
 * Origami supports the same syntax for basic object literals so interpreting as
 * Origami should generally be acceptable.
 *
 * @param {string} text
 */
export default function isOrigamiFrontMatter(text) {
  return /^[ \t\r\n]*[A-Za-z0-9_]*[\(\.\/\{]/.test(text);
}
