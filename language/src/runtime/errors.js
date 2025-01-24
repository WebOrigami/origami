// Text we look for in an error stack to guess whether a given line represents a

import {
  scope as scopeFn,
  trailingSlash,
  TraverseError,
} from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import { typos } from "./typos.js";

// function in the Origami source code.
const origamiSourceSignals = [
  "async-tree/src/",
  "language/src/",
  "origami/src/",
  "at Scope.evaluate",
];

export async function builtinReferenceError(tree, builtins, key) {
  // See if the key is in scope (but not as a builtin)
  const scope = scopeFn(tree);
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
    let { source, start } = location;
    // Adjust line number with offset if present (for example, if the code is in
    // an Origami template document with front matter that was stripped)
    let line = start.line + (source.offset ?? 0);
    if (!fragmentInMessage) {
      message += `\nevaluating: ${fragment}`;
    }
    if (typeof source === "object" && source.url) {
      message += `\n    at ${source.url.href}:${line}:${start.column}`;
    } else if (source.text.includes("\n")) {
      message += `\n    at line ${line}, column ${start.column}`;
    }
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

export function maybeOrigamiSourceCode(text) {
  return origamiSourceSignals.some((signal) => text.includes(signal));
}

export async function scopeReferenceError(scope, key) {
  const messages = [
    `"${key}" is not in scope.`,
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
