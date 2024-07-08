/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { Tree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * @this {AsyncTree|null}
 * @param {any} value
 * @param {any} trueResult
 * @param {any} [falseResult]
 */
export default async function ifCommand(value, trueResult, falseResult) {
  assertTreeIsDefined(this, "if");
  let condition = await value;
  if (Tree.isAsyncTree(condition)) {
    const keys = Array.from(await condition.keys());
    condition = keys.length > 0;
  }

  // 0 is true, null/undefined/false is false
  let result = condition || condition === 0 ? trueResult : falseResult;
  if (typeof result === "function") {
    result = await result.call(this);
  }
  return result;
}

ifCommand.usage = `@if <value>, <true>, [<false>]\tThe true or false result based on the value`;
ifCommand.documentation = "https://weborigami.org/language/@if.html";
