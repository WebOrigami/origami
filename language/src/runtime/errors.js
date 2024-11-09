// Text we look for in an error stack to guess whether a given line represents a

import { scope as scopeFn, trailingSlash } from "@weborigami/async-tree";
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
  const messages = [
    `"${key}" is being called like a builtin function but no such builtin exists.`,
  ];
  // See if the key is in scope (but not as a builtin)
  const scope = scopeFn(tree);
  const value = await scope.get(key);
  if (value === undefined) {
    const typos = await formatScopeTypos(builtins, key);
    messages.push(typos);
  } else {
    messages.push(
      `If you want to reference the key "${key}" that's in scope, use "scope:${key}".`
    );
  }
  const message = messages.join(" ");
  return new ReferenceError(message);
}

/**
 * Format an error for display in the console.
 *
 * @param {Error} error
 */
export function formatError(error) {
  let message;
  if (error.stack) {
    // Display the stack only until we reach the Origami source code.
    message = "";
    let lines = error.stack.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (maybeOrigamiSourceCode(line)) {
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
    const fragment = codeFragment(location);
    let { source, start } = location;

    message += `\nevaluating: ${fragment}`;
    if (typeof source === "object" && source.url) {
      message += `\n    at ${source.url.href}:${start.line}:${start.column}`;
    } else if (source.text.includes("\n")) {
      message += `\n    at line ${start.line}, column ${start.column}`;
    }
  }
  return message;
}

export async function formatScopeTypos(scope, key) {
  const keys = await scopeTypos(scope, key);
  if (keys.length === 0) {
    return "";
  }
  // Don't match deprecated keys
  const filtered = keys.filter((key) => !key.startsWith("@"));
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
