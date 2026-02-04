// Text we look for in an error stack to guess whether a given line represents a

import { trailingSlash, TraverseError, Tree } from "@weborigami/async-tree";
import path from "node:path";
import { fileURLToPath } from "node:url";
import codeFragment from "./codeFragment.js";
import { typos } from "./typos.js";

// function in the Origami source code.
const origamiSourceSignals = [
  "async-tree/src/",
  "language/src/",
  "origami/src/",
  "at Scope.execute",
];

export async function builtinReferenceError(tree, builtins, key) {
  // See if the key is in scope (but not as a builtin)
  const scope = await Tree.scope(tree);
  const value = await scope.get(key);
  let message;
  if (value === undefined) {
    const messages = [
      `"${key}" is being called as if it were a builtin function, but it's not.`,
    ];
    const typos = await formatScopeTypos(builtins, key);
    messages.push(typos);
    message = messages.join(" ");
  } else {
    const messages = [
      `To call a function like "${key}" that's not a builtin, include a slash: ${key}/( )`,
      `Details: https://weborigami.org/language/syntax.html#shorthand-for-builtin-functions`,
    ];
    message = messages.join("\n");
  }
  return new ReferenceError(message);
}

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

export async function formatScopeTypos(scope, key) {
  const keys = await scopeTypos(scope, key);
  // Don't match deprecated keys
  const filtered = keys.filter((key) => !key.startsWith("@"));
  if (filtered.length === 0) {
    return "";
  }
  const quoted = filtered.map((key) => `"${key}"`);
  const list = quoted.join(", ");
  return `Maybe you meant ${list}?`;
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

export async function scopeReferenceError(scope, key) {
  const messages = [
    `"${key}" is not in scope or is undefined.`,
    await formatScopeTypos(scope, key),
  ];
  const message = messages.join(" ");
  return new ReferenceError(message);
}

// Return all possible typos for `key` in scope
async function scopeTypos(scope, key) {
  const scopeKeys = [...(await scope.keys())];
  const normalizedScopeKeys = scopeKeys.map((key) => trailingSlash.remove(key));
  const normalizedKey = trailingSlash.remove(key);
  return typos(normalizedKey, normalizedScopeKeys);
}
