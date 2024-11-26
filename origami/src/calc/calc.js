import { Tree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

export function add(...args) {
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc + val, 0);
}

export function and(...args) {
  return args.every((arg) => arg);
}

export function divide(a, b) {
  return Number(a) / Number(b);
}

export function equals(a, b) {
  return a === b;
}

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {any} value
 * @param {any} trueResult
 * @param {any} [falseResult]
 */
export async function ifBuiltin(value, trueResult, falseResult) {
  console.warn(
    `warning: "if" is deprecated. Use the conditional "a ? b : c" operator instead.`
  );

  assertTreeIsDefined(this, "calc:if");
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
ifBuiltin.key = "if";

export function multiply(...args) {
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc * val, 1);
}

export function not(value) {
  return !value;
}

export function or(...args) {
  return args.find((arg) => arg);
}

export function subtract(a, b) {
  return Number(a) - Number(b);
}
