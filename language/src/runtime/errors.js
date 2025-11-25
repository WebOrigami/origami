// Text we look for in an error stack to guess whether a given line represents a

import {
  box,
  trailingSlash,
  TraverseError,
  Tree,
} from "@weborigami/async-tree";
import path from "node:path";
import { fileURLToPath } from "node:url";
import codeFragment from "./codeFragment.js";
import * as symbols from "./symbols.js";
import { typos } from "./typos.js";

// function in the Origami source code.
const origamiSourceSignals = [
  "async-tree/src/",
  "language/src/",
  "origami/src/",
  "at Scope.evaluate",
];

const displayedWarnings = new Set();

export function attachWarning(value, message) {
  if (value == null) {
    return value;
  }

  if (typeof value === "object" && value?.[symbols.warningSymbol]) {
    // Already has a warning, don't overwrite it
    return value;
  }

  const boxed = box(value);
  boxed[symbols.warningSymbol] = message;
  return boxed;
}

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

// Display a warning message in the console, but only once for each unique
// message and location.
export function displayWarning(message, location) {
  const warning = "Warning: " + message + lineInfo(location);
  if (!displayedWarnings.has(warning)) {
    displayedWarnings.add(warning);
    console.warn(warning);
  }
}

/**
 * Format an error for display in the console.
 *
 * @param {Error} error
 */
export function formatError(error) {
  let message;

  let location = /** @type {any} */ (error).location;
  const fragment = location ? codeFragment(location) : null;
  let fragmentInMessage = false;

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
        line = `TraverseError: This part of the path is null or undefined: ${fragment}`;
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
    message += lineInfo(location);
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
function lineInfo(location) {
  let { source, start } = location;
  // Adjust line number with offset if present (for example, if the code is in
  // an Origami template document with front matter that was stripped)
  let line = start.line + (source.offset ?? 0);

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
    return `\n    at ${fileRef}:${line}:${start.column}`;
  } else if (source.text.includes("\n")) {
    // Don't know the URL, but has multiple lines so add line number
    return `\n    at line ${line}, column ${start.column}`;
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
