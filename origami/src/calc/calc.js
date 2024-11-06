import { Tree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

function add(...args) {
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc + val, 0);
}

function divide(a, b) {
  return Number(a) / Number(b);
}

function equals(a, b) {
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
async function ifCommand(value, trueResult, falseResult) {
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

function multiply(...args) {
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc * val, 1);
}

function not(value) {
  return !value;
}

function or(...args) {
  return args.find((arg) => arg);
}

function subtract(a, b) {
  return Number(a) - Number(b);
}

export default {
  add,
  divide,
  equals,
  if: ifCommand,
  multiply,
  not,
  or,
  subtract,
};
