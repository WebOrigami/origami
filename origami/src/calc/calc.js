import { Tree } from "@weborigami/async-tree";
import helpRegistry from "../common/helpRegistry.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

export function add(...args) {
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc + val, 0);
}
helpRegistry.set("calc:add", "(a, b, ...) - Add the numbers");

export function divide(a, b) {
  return Number(a) / Number(b);
}
helpRegistry.set("calc:divide", "(a, b) - Divide a by b");

export function equals(a, b) {
  return a === b;
}
helpRegistry.set("calc:equals", "(a, b) - Return true if a equals b");

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {any} value
 * @param {any} trueResult
 * @param {any} [falseResult]
 */
export async function ifBuiltin(value, trueResult, falseResult) {
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
helpRegistry.set("calc:if", "(a, b, c) - If a is true return b, otherwise c");

export function multiply(...args) {
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc * val, 1);
}
helpRegistry.set("calc:multiply", "(a, b, ...) - Multiply the numbers");

export function not(value) {
  return !value;
}
helpRegistry.set("calc:not", "(a) - Return true if a is false and vice versa");

export function or(...args) {
  return args.find((arg) => arg);
}
helpRegistry.set(
  "calc:or",
  "(a, b, ...) - Return true if any of the arguments are true"
);

export function subtract(a, b) {
  return Number(a) - Number(b);
}
helpRegistry.set("calc:subtract", "(a, b) - Subtract b from a");

helpRegistry.set("calc:", "Perform math and logical operations");
