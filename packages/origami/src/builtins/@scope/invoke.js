import { toFunction } from "../../common/utilities.js";

/**
 * Invokes the given function in the context of the current scope.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../../..").Invocable} Invocable
 *
 * @this {AsyncDictionary|null}
 * @param {AsyncDictionary} scope
 * @param {Invocable} invocable
 */
export default async function invoke(scope, invocable, ...args) {
  const fn = toFunction(invocable);
  const result = await fn.call(scope, ...args);
  return result;
}

invoke.usage = `@scope/invoke fn, <...args>\tInvoke the function in the current scope`;
invoke.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
