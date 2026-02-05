import { TraverseError } from "@weborigami/async-tree";
import path from "node:path";
import { fileURLToPath } from "node:url";
import codeFragment from "./codeFragment.js";
import explainReferenceError from "./explainReferenceError.js";

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
export async function formatError(error) {
  // See if we can identify the Origami location that caused the error
  let location;
  let fragment;
  let fragmentInMessage = false;
  const context = /** @type {any} */ (error).context;
  let code = context?.code;
  if (code) {
    // Use the code being evaluated when the error occurred
    let position = /** @type {any} */ (error).position;
    code = position !== undefined ? context.code[position] : context.code;
    location = code.location;
    fragment = location ? codeFragment(location) : null;
  }

  // Construct the error message
  let message;
  // If the first line of the stack is just the error message, use that as the message
  let lines = error.stack?.split("\n") ?? [];
  if (!lines[0].startsWith("    at")) {
    message = lines[0];
    lines.shift();
  } else {
    message = error.message ?? error.toString();
  }

  // See if we can improve the error message
  if (error instanceof ReferenceError && code && context) {
    const explanation = await explainReferenceError(code, context.state);
    if (explanation) {
      message += "\n" + explanation;
    }
  } else if (
    error instanceof TraverseError &&
    error.message === "A null or undefined value can't be traversed"
  ) {
    // Provide more meaningful message for TraverseError
    message = `TraverseError: This part of the path is null or undefined: ${highlightError(
      fragment,
    )}`;
    fragmentInMessage = true;
  }

  // If the error has a stack trace, only include the portion until we reach
  // Origami source code.
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (maybeOrigamiSourceCode(line)) {
      break;
    }
    message += "\n" + line;
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
    let { url } = source;
    if (typeof url === "string") {
      url = new URL(url);
    }
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

export function maybeOrigamiSourceCode(text) {
  return origamiSourceSignals.some((signal) => text.includes(signal));
}
