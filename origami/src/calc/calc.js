import { Tree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

export function add(...args) {
  console.warn(`Warning: "add" is deprecated. Use the "+" operator instead.`);
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc + val, 0);
}

export function and(...args) {
  console.warn(`Warning: "and" is deprecated. Use the "&&" operator instead.`);
  return args.every((arg) => arg);
}

export function divide(a, b) {
  console.warn(
    `Warning: "divide" is deprecated. Use the "/" operator instead.`
  );
  return Number(a) / Number(b);
}

export function equals(a, b) {
  console.warn(
    `Warning: "equals" is deprecated. Use the "===" operator instead.`
  );
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
    `Warning: "if" is deprecated. Use the conditional "a ? b : c" operator instead.`
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
  console.warn(
    `Warning: "multiply" is deprecated. Use the "*" operator instead.`
  );
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc * val, 1);
}

export function not(value) {
  console.warn(`Warning: "not" is deprecated. Use the "!" operator instead.`);
  return !value;
}

export function or(...args) {
  console.warn(`Warning: "or" is deprecated. Use the "||" operator instead.`);
  return args.find((arg) => arg);
}

export function subtract(a, b) {
  console.warn(
    `Warning: "subtract" is deprecated. Use the "-" operator instead.`
  );
  return Number(a) - Number(b);
}
