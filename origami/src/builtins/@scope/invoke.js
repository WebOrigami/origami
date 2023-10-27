import { Scope } from "@graphorigami/language";
import { toFunction } from "../../common/utilities.js";

/**
 * Invokes the given function in the context of the current scope.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../..").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {AsyncTree} context
 * @param {Invocable} invocable
 */
export default async function invoke(context, invocable, ...args) {
  const scope = Scope.getScope(context);
  const fn = toFunction(invocable);
  const result = await fn.call(scope, ...args);
  return result;
}

invoke.usage = `@scope/invoke fn, <...args>\tInvoke the function in the current scope`;
invoke.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
