// Text we look for in an error stack to guess whether the error was raised by
// the Origami evaluate() function.
const evaluateStackSignal = "at Scope.evaluate";

/**
 * Format an error for display in the console.
 *
 * @param {Error} error
 */
export default function formatError(error) {
  let message;
  if (error.stack?.includes(evaluateStackSignal)) {
    // Error was raised by the Origami evaluate() function. Include the top of
    // error stack until we reach a line for that function.
    message = "";
    let lines = error.stack.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(evaluateStackSignal)) {
        break;
      }
      if (message) {
        message += "\n";
      }
      message += lines[i];
    }
  } else {
    message = error.toString();
  }

  // Add location
  let location = /** @type {any} */ (error).location;
  if (location) {
    let { source, start, end } = location;
    let fragment = source.text.slice(start.offset, end.offset);
    if (fragment.length === 0) {
      // Use entire source.
      fragment = source.text;
    }
    message += `\nevaluating: ${fragment}`;
    if (typeof source === "object" && source.url) {
      message += `\n    at ${source.url.href}:${start.line}:${start.column}`;
    } else if (source.text.includes("\n")) {
      message += `\n    at line ${start.line}, column ${start.column}`;
    } else {
      message += `\n    at column ${start.column}`;
    }
  }
  return message;
}
