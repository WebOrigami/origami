import { scope, trailingSlash, Tree } from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import { ops } from "./internal.js";
import { typos } from "./typos.js";

/**
 * Generate a ReferenceError for the given context of code + state.
 *
 * @param {import("../../index.ts").CodeContext} context
 */
export default async function createReferenceError(context) {
  // See if the code looks like an external scope reference. If so, the
  // reference failed.
  const { code } = context;
  if (code[0] !== ops.cache) {
    // Return a generic reference error
    /** @type {any} */
    const fragment = codeFragment(code);
    /** @type {any} */
    const error = ReferenceError(`${fragment} is not defined`);
    error.context = context; // For error formatting
    error.position = 0; // Position of the problematic instruction
    return error;
  }

  const { globals, parent, object } = context.state;
  const objectScope = object ? await scope(object) : null;
  const parentScope = parent ? await scope(parent) : null;

  const globalKeys = globals ? Object.keys(globals) : [];
  const objectKeys = objectScope ? await Tree.keys(objectScope) : [];
  const scopeKeys = parentScope ? await Tree.keys(parentScope) : [];
  const normalizedKeys = [...globalKeys, ...objectKeys, ...scopeKeys].map(
    (key) => trailingSlash.remove(key),
  );
  const allKeys = [...new Set(normalizedKeys)];

  // External scope reference -- what key was it looking for?
  const key = trailingSlash.remove(code[3][1][1]);

  let firstPartTypos;
  if (key.includes(".")) {
    // Split off first part
    const [firstPart] = key.split(".");
    firstPartTypos = typos(firstPart, allKeys);
  } else {
    firstPartTypos = [];
  }

  let message = `"${key}" is not in scope or is undefined.`;

  const fullTypos = typos(key, allKeys);
  const allTypos = [...new Set([...firstPartTypos, ...fullTypos])];
  allTypos.sort();
  if (allTypos.length > 0) {
    const quoted = allTypos.map((key) => `"${key}"`);
    const list = quoted.join(", ");

    message += `\nYou might have meant: ${list}`;
  }

  return ReferenceError(message);
}
