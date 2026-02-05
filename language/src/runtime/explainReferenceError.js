import { scope, trailingSlash, Tree } from "@weborigami/async-tree";
import { ops } from "./internal.js";
import { typos } from "./typos.js";

/**
 * Try to provide a more helpful message for a ReferenceError by analyzing the
 * code and suggesting possible typos.
 *
 * @param {import("../../index.ts").AnnotatedCode} code
 * @param {import("../../index.ts").RuntimeState} state
 */
export default async function explainReferenceError(code, state) {
  // See if the code looks like an external scope reference that failed
  if (code[0] !== ops.cache) {
    // Generic reference error, can't offer help
    return null;
  }

  const { globals, parent, object } = state;
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

  let message = `It looks like "${key}" is not in scope.`;

  const fullTypos = typos(key, allKeys);
  const allTypos = [...new Set([...firstPartTypos, ...fullTypos])];
  allTypos.sort();
  if (allTypos.length > 0) {
    const list = allTypos.join(", ");
    message += `\nPerhaps you intended`;
    if (allTypos.length > 1) {
      message += " one of these";
    }
    message += `: ${list}`;
  }

  return message;
}
