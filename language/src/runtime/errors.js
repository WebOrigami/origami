import { TraverseError } from "@weborigami/async-tree";
import path from "node:path";
import { fileURLToPath } from "node:url";
import codeFragment from "./codeFragment.js";

// Text we look for in an error stack to guess whether a given line represents a
// function in the Origami source code.
const origamiSourceSignals = [
  "async-tree/src/",
  "language/src/",
  "origami/src/",
  "at Scope.execute",
];

/**
 * Format an error for display in the console.
 *
 * @param {Error} error
 */
export function formatError(error) {
  let message;

  // See if we can identify the Origami location that caused the error
  let location;
  let fragment;
  let fragmentInMessage = false;
  const context = /** @type {any} */ (error).context;
  if (context?.code) {
    // Use the code being evaluated when the error occurred
    let position = /** @type {any} */ (error).position;
    const code = position ? context.code[position] : context.code;
    location = code.location;
    fragment = location ? codeFragment(location) : null;
  }

  if (error.stack) {
    // Display the stack only until we reach the Origami source code.
    message = "";
    let lines = error.stack.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (maybeOrigamiSourceCode(line)) {
        break;
      }
      if (
        error instanceof TraverseError &&
        error.message === "A null or undefined value can't be traversed"
      ) {
        // Provide more meaningful message for TraverseError
        line = `TraverseError: This part of the path is null or undefined: ${highlightError(
          fragment,
        )}`;
        fragmentInMessage = true;
      }
      if (message) {
        message += "\n";
      }
      message += line;
    }
  } else {
    message = error.toString();
  }

  // Add location
  if (location) {
    if (!fragmentInMessage) {
      message += `\nevaluating: ${highlightError(fragment)}`;
    }
    message += "\n" + lineInfo(location);
  }

  return message;
}

export function highlightError(text) {
  // ANSI escape sequence to highlight text in red
  return `\x1b[31m${text}\x1b[0m`;
}

export function maybeOrigamiSourceCode(text) {
  return origamiSourceSignals.some((signal) => text.includes(signal));
}

// Return user-friendly line information for the error location
export function lineInfo(location) {
  let { source, start } = location;

  let line;
  let column;
  if (source.offset && source.context) {
    // Account for source code that was offset within a larger document
    const offset = source.offset + start.offset;
    // Calculate line and column from offset
    const textUpToOffset = source.context.slice(0, offset);
    const lines = textUpToOffset.split("\n");
    line = lines.length;
    column = lines[lines.length - 1].length + 1;
  } else {
    // Use indicated start location as is
    line = start.line;
    column = start.column;
  }

  if (typeof source === "object" && source.url) {
    const { url } = source;
    let fileRef;
    // If URL is a file: URL, change to a relative path
    if (url.protocol === "file:") {
      fileRef = fileURLToPath(url);
      const relativePath = path.relative(process.cwd(), fileRef);
      if (!relativePath.startsWith("..")) {
        fileRef = relativePath;
      }
    } else {
      // Not a file: URL, use as is
      fileRef = url.href;
    }
    return `    at ${fileRef}:${line}:${column}`;
  } else if (source.text.includes("\n")) {
    // Don't know the URL, but has multiple lines so add line number
    return `    at line ${line}, column ${column}`;
  } else {
    return "";
  }
}
