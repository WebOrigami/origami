import { Tree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

function add(...args) {
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc + val, 0);
}
add.description = "add(a, b, ...) - Add the numbers";

function divide(a, b) {
  return Number(a) / Number(b);
}
divide.description = "divide(a, b) - Divide a by b";

function equals(a, b) {
  return a === b;
}
equals.description = "equals(a, b) - Return true if a equals b";

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
ifCommand.description = "if(a, b, c) - If a is true return b, otherwise c";

function multiply(...args) {
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc * val, 1);
}
multiply.description = "multiply(a, b, ...) - Multiply the numbers";

function not(value) {
  return !value;
}
not.description = "not(a) - Return true if a is false and vice versa";

function or(...args) {
  return args.find((arg) => arg);
}
or.description = "or(a, b, ...) - Return true if any of the arguments are true";

function subtract(a, b) {
  return Number(a) - Number(b);
}
subtract.description = "subtract(a, b) - Subtract b from a";

const commands = {
  add,
  divide,
  equals,
  if: ifCommand,
  multiply,
  not,
  or,
  subtract,
};

Object.defineProperty(commands, "description", {
  enumerable: false,
  value: "Perform math and logical operations",
});

export default commands;