import {
  pathFromKeys,
  scope,
  trailingSlash,
  Tree,
} from "@weborigami/async-tree";
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
  const stateKeys = await getStateKeys(state);

  if (code[0] === ops.property) {
    // An inner property access returned undefined.
    // Might be a global+extension or local+extension.
    const explanation = await accidentalReferenceExplainer(
      code.source,
      stateKeys,
    );
    return explanation;
  }

  // See if the code looks like an external scope reference that failed
  if (code[0] !== ops.cache) {
    // Generic reference error, can't offer help
    return null;
  }

  // External scope reference -- what key was it looking for?
  const scopeCall = code[3].slice(1); // drop the ops.scope
  const keys = scopeCall.map((part) => part[1]);
  const path = pathFromKeys(keys);

  if (keys.length > 1) {
    return `This path returned undefined: ${path}`;
  }

  // Common case of a single key
  const key = keys[0];
  let message = `It looks like "${key}" is not in scope.`;

  const explainers = [mathExplainer, typoExplainer];
  let explanation;
  for (const explainer of explainers) {
    explanation = await explainer(key, stateKeys);
    if (explanation) {
      message += "\n" + explanation;
      break;
    }
  }

  return message;
}

/**
 * Handle a reference that worked but maybe shouldn't have:
 *
 * - a global + extension like `performance.html` (`performance` is a global)
 * - a local + extension like `posts.md` (where `posts` is a local variable)
 *
 * In either case, suggest using angle brackets.
 */
async function accidentalReferenceExplainer(key, stateKeys) {
  const parts = key.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const extensionHandlers = stateKeys.global.filter((globalKey) =>
    globalKey.endsWith("_handler"),
  );
  const extensions = extensionHandlers.map((handler) => handler.slice(0, -8));
  if (!extensions.includes(parts[1])) {
    return null;
  }

  if (stateKeys.global.includes(parts[0])) {
    return `"${parts[0]}" is a global, but "${parts[1]}" looks like a file extension.
If you intended to reference a file, use angle brackets: <${key}>`;
  }

  if (stateKeys.object.includes(parts[0])) {
    return `"${key}" looks like a file reference, but is matching the local object property "${parts[0]}".
If you intended to reference a file, use angle brackets: <${key}>`;
  }

  if (stateKeys.stack.includes(parts[0])) {
    return `"${key}" looks like a file reference, but is matching the local parameter "${parts[0]}".
If you intended to reference a file, use angle brackets: <${key}>`;
  }

  return null;
}

// Return global, local, and object keys in scope for the given state
async function getStateKeys(state) {
  const { globals, parent, object, stack } = state;
  const objectScope = object ? await scope(object) : null;
  const parentScope = parent ? await scope(parent) : null;

  const globalKeys = globals ? Object.keys(globals) : [];
  const objectKeys = objectScope ? await Tree.keys(objectScope) : [];
  const scopeKeys = parentScope ? await Tree.keys(parentScope) : [];
  const stackKeys = stack?.map((frame) => Object.keys(frame)).flat() ?? [];

  const normalizedGlobalKeys = globalKeys.map((key) =>
    trailingSlash.remove(key),
  );
  const normalizedObjectKeys = objectKeys.map((key) =>
    trailingSlash.remove(key),
  );
  const normalizedScopeKeys = scopeKeys.map((key) => trailingSlash.remove(key));
  const normalizedStackKeys = stackKeys.map((key) => trailingSlash.remove(key));

  return {
    global: normalizedGlobalKeys,
    object: normalizedObjectKeys,
    scope: normalizedScopeKeys,
    stack: normalizedStackKeys,
  };
}

/**
 * If it looks like a math operation, suggest adding spaces around the operator.
 */
function mathExplainer(key, stateKeys) {
  if (!binaryOperatorRegex.test(key)) {
    return null;
  }

  // Create a global version of the regex for replacing all operators
  const withSpaces = key.replace(binaryOperatorRegex, " $& ");
  return `If you intended a math operation, Origami requires spaces around the operator: "${withSpaces}"`;
}

/**
 * Suggest possible typos for the given key based on the keys in scope.
 */
async function typoExplainer(key, stateKeys) {
  const allKeys = [
    ...new Set([
      ...stateKeys.global,
      ...stateKeys.object,
      ...stateKeys.scope,
      ...stateKeys.stack,
    ]),
  ];

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
