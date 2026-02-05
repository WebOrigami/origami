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

  if (code[0] === ops.property) {
    // Might be a global+extension
    const explanation = await globalWithExtensionExplainer(code.source, state);
    return explanation;
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

  const explainers = [mathExplainer, typoExplainer];
  let explanation;
  for (const explainer of explainers) {
    explanation = await explainer(key, state);
    if (explanation) {
      message += "\n" + explanation;
      break;
    }
  }

  return message;
}

/**
 * If the key looks like `performance.html`, where the first part is a global
 * and the second part is an extension, suggest using angle brackets.
 */
function globalWithExtensionExplainer(key, state) {
  const parts = key.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const { globals } = state;
  if (!globals) {
    return null;
  }

  const globalKeys = Object.keys(globals);
  if (!globalKeys.includes(parts[0])) {
    return null;
  }

  const extensionHandlers = globalKeys.filter((globalKey) =>
    globalKey.endsWith("_handler"),
  );
  const extensions = extensionHandlers.map((handler) => handler.slice(0, -8));
  if (!extensions.includes(parts[1])) {
    return null;
  }

  return `"${parts[0]}" is a global, but "${parts[1]}" looks like a file extension.
If you intended to reference a file, use angle brackets: <${key}>`;
}

/**
 * If it looks like a math operation, suggest adding spaces around the operator.
 */
function mathExplainer(key, state) {
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
async function typoExplainer(key, state) {
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
