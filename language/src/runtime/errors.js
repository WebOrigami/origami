import { TraverseError } from "@weborigami/async-tree";
import path from "node:path";
import { fileURLToPath } from "node:url";
import codeFragment from "./codeFragment.js";
import explainReferenceError from "./explainReferenceError.js";
import explainTraverseError from "./explainTraverseError.js";

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
  const context = /** @type {any} */ (error).context;
  let code = context?.code;
  if (code) {
    // Use the code being evaluated when the error occurred
    let position = /** @type {any} */ (error).position;
    code = position !== undefined ? context.code[position] : context.code;
    location = code.location;
    fragment = location ? codeFragment(location) : (code.source ?? code);
  }

  // Get the original error message
  let originalMessage;
  // If the first line of the stack is just the error message, use that as the message
  let lines = error.stack?.split("\n") ?? [];
  if (!lines[0].startsWith("    at")) {
    originalMessage = lines[0];
    lines.shift();
  } else {
    originalMessage = error.message ?? error.toString();
  }
  let message = originalMessage;

  // See if we can explain the error message
  if (error instanceof ReferenceError && code && context) {
    const explanation = await explainReferenceError(code, context.state);
    if (explanation) {
      message += "\n" + explanation;
    }
  } else if (error instanceof TraverseError) {
    const explanation = await explainTraverseError(error);
    if (explanation) {
      message += "\n" + explanation;
    }
  }

  // If the error's `message` starts with a qualified method name like `Tree.map`
  // and a colon, extract the method name and link to the docs.
  const match = error.message?.match(/^(?<namespace>\w+).(?<method>\w+):/);
  if (match) {
    /** @type {any} */
    const { namespace, method } = match.groups;
    if (["Dev", "Origami", "Tree"].includes(namespace)) {
      message += `\nFor documentation, see https://weborigami.org/builtins/${namespace}/${method}`;
    }
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

  message += `\nevaluating: ${highlightError(fragment)}`;

  // Add location
  if (location) {
    const lineInformation = lineInfo(location);
    if (lineInformation) {
      message += "\n" + lineInformation;
    }
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
    return null;
  }
}

export function maybeOrigamiSourceCode(text) {
  return origamiSourceSignals.some((signal) => text.includes(signal));
}
