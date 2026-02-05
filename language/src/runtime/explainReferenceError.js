import { scope, trailingSlash, Tree } from "@weborigami/async-tree";
import { ops } from "./internal.js";
import { typos } from "./typos.js";

// Doesn't include `/` because that would have been handled as a path separator
const binaryOperatorRegex =
  /!==|!=|%|&&|&|\*\*|\*|\+|-|\/|<<|<|<=|===|==|>>>|>>|>=|>|\^|\|\||\|/g;

/**
 * Try to provide a more helpful message for a ReferenceError by analyzing the
 * code and suggesting possible typos.
 *
 * @param {import("../../index.ts").AnnotatedCode} code
 * @param {import("../../index.ts").RuntimeState} state
 */
export default async function explainReferenceError(code, state) {
  // If the code is a property access, get the target of the access
  if (code[0] === ops.property) {
    code = code[1];
  }

  // See if the code looks like an external scope reference that failed
  if (code[0] !== ops.cache) {
    // Generic reference error, can't offer help
    return null;
  }

  // External scope reference -- what key was it looking for?
  const key = trailingSlash.remove(code[3][1][1]);

  // Base message
  let message = `It looks like "${key}" is not in scope.`;

  let explanation;
  if (binaryOperatorRegex.test(key)) {
    explanation = mathExplanation(key);
  } else {
    explanation = await typoExplanation(key, state);
  }
  if (explanation) {
    message += "\n" + explanation;
  }

  return message;
}

function mathExplanation(key) {
  // Create a global version of the regex for replacing all operators
  const withSpaces = key.replace(binaryOperatorRegex, " $& ");
  return `If you intended a math operation, Origami requires spaces around the operator: "${withSpaces}"`;
}

async function typoExplanation(key, state) {
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

  let firstPartTypos;
  if (key.includes(".")) {
    // Split off first part
    const [firstPart] = key.split(".");
    firstPartTypos = typos(firstPart, allKeys);
  } else {
    firstPartTypos = [];
  }

  const fullTypos = typos(key, allKeys);
  const allTypos = [...new Set([...firstPartTypos, ...fullTypos])];
  allTypos.sort();

  if (allTypos.length === 0) {
    return null;
  }

  let message = `Perhaps you intended`;
  const list = allTypos.join(", ");
  if (allTypos.length > 1) {
    message += " one of these";
  }
  message += `: ${list}`;

  return message;
}
