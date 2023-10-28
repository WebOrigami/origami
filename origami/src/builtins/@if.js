/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */
import { Tree } from "@graphorigami/async-tree";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * @this {AsyncTree|null}
 * @param {any} value
 * @param {any} trueResult
 * @param {any} [falseResult]
 */
export default async function ifCommand(value, trueResult, falseResult) {
  assertScopeIsDefined(this);
  let condition = await value;
  if (Tree.isAsyncTree(condition)) {
    const keys = Array.from(await condition.keys());
    condition = keys.length > 0;
  }

  let result = condition ? trueResult : falseResult;
  if (typeof result === "function") {
    result = await result.call(this);
  }
  return result;
}

ifCommand.usage = `@if <value>, <true>, [<false>]\tThe true or false result based on the value`;
ifCommand.documentation = "https://graphorigami.org/language/@if.html";
