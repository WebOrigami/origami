// Generated tests -- do not edit directly
// @ts-nocheck

import assert from "node:assert";
import { describe } from "node:test";
import oriEval from "../generator/oriEval.js";

describe("conditionalExpression - JavaScript", () => {
  assert.strictEqual(true ? 42 : 0, 42, "Condition is true, evaluates and returns the first operand");
  assert.strictEqual(false ? 42 : 0, 0, "Condition is false, evaluates and returns the second operand");
  assert.strictEqual(1 ? 'yes' : 'no', "yes", "Truthy condition with string operands");
  assert.strictEqual(0 ? 'yes' : 'no', "no", "Falsy condition with string operands");
  assert.strictEqual('non-empty' ? 1 : 2, 1, "Truthy string condition with numeric operands");
  assert.strictEqual('' ? 1 : 2, 2, "Falsy string condition with numeric operands");
  assert.strictEqual(null ? 'a' : 'b', "b", "Falsy null condition");
  assert.strictEqual(undefined ? 'a' : 'b', "b", "Falsy undefined condition");
  assert.strictEqual(NaN ? 'a' : 'b', "b", "Falsy NaN condition");
  assert.strictEqual(42 ? true : false, true, "Truthy numeric condition with boolean operands");
  assert.strictEqual(0 ? true : false, false, "Falsy numeric condition with boolean operands");
  assert.strictEqual([] ? 'array' : 'no array', "array", "Truthy array condition");
  assert.strictEqual({} ? 'object' : 'no object', "object", "Truthy object condition");
  assert.strictEqual(false ? null : undefined, undefined, "Condition is false, returns undefined");
  assert.deepEqual(null ? null : null, null, "Condition is falsy, returns null");
  assert.strictEqual(true ? NaN : 42, NaN, "Condition is true, evaluates and returns NaN");
  assert.strictEqual((true ? 1 : 2) ? 3 : 4, 3, "Nested ternary where first expression evaluates to 1, which is truthy");
  assert.strictEqual((false ? 1 : 2) ? 3 : 4, 3, "Nested ternary where first expression evaluates to 2, which is truthy");
  assert.strictEqual((false ? 1 : 0) ? 3 : 4, 4, "Nested ternary where first expression evaluates to 0, which is falsy");
  assert.strictEqual(true ? (false ? 10 : 20) : 30, 20, "Nested ternary in the true branch of outer ternary");
  assert.strictEqual(false ? (false ? 10 : 20) : 30, 30, "Nested ternary in the false branch of outer ternary");
  assert.deepEqual(undefined ? undefined : null, null, "Condition is falsy, returns null");
  assert.strictEqual(null ? undefined : undefined, undefined, "Condition is falsy, returns undefined");
});

describe("conditionalExpression - Origami", async() => {
  assert.strictEqual(await oriEval("true ? 42 : 0"), 42, "Condition is true, evaluates and returns the first operand");
  assert.strictEqual(await oriEval("false ? 42 : 0"), 0, "Condition is false, evaluates and returns the second operand");
  assert.strictEqual(await oriEval("1 ? 'yes' : 'no'"), "yes", "Truthy condition with string operands");
  assert.strictEqual(await oriEval("0 ? 'yes' : 'no'"), "no", "Falsy condition with string operands");
  assert.strictEqual(await oriEval("'non-empty' ? 1 : 2"), 1, "Truthy string condition with numeric operands");
  assert.strictEqual(await oriEval("'' ? 1 : 2"), 2, "Falsy string condition with numeric operands");
  assert.strictEqual(await oriEval("null ? 'a' : 'b'"), "b", "Falsy null condition");
  assert.strictEqual(await oriEval("undefined ? 'a' : 'b'"), "b", "Falsy undefined condition");
  assert.strictEqual(await oriEval("NaN ? 'a' : 'b'"), "b", "Falsy NaN condition");
  assert.strictEqual(await oriEval("42 ? true : false"), true, "Truthy numeric condition with boolean operands");
  assert.strictEqual(await oriEval("0 ? true : false"), false, "Falsy numeric condition with boolean operands");
  assert.strictEqual(await oriEval("[] ? 'array' : 'no array'"), "array", "Truthy array condition");
  assert.strictEqual(await oriEval("{} ? 'object' : 'no object'"), "object", "Truthy object condition");
  assert.strictEqual(await oriEval("false ? null : undefined"), undefined, "Condition is false, returns undefined");
  assert.deepEqual(await oriEval("null ? null : null"), null, "Condition is falsy, returns null");
  assert.strictEqual(await oriEval("true ? NaN : 42"), NaN, "Condition is true, evaluates and returns NaN");
  assert.strictEqual(await oriEval("(true ? 1 : 2) ? 3 : 4"), 3, "Nested ternary where first expression evaluates to 1, which is truthy");
  assert.strictEqual(await oriEval("(false ? 1 : 2) ? 3 : 4"), 3, "Nested ternary where first expression evaluates to 2, which is truthy");
  assert.strictEqual(await oriEval("(false ? 1 : 0) ? 3 : 4"), 4, "Nested ternary where first expression evaluates to 0, which is falsy");
  assert.strictEqual(await oriEval("true ? (false ? 10 : 20) : 30"), 20, "Nested ternary in the true branch of outer ternary");
  assert.strictEqual(await oriEval("false ? (false ? 10 : 20) : 30"), 30, "Nested ternary in the false branch of outer ternary");
  assert.deepEqual(await oriEval("undefined ? undefined : null"), null, "Condition is falsy, returns null");
  assert.strictEqual(await oriEval("null ? undefined : undefined"), undefined, "Condition is falsy, returns undefined");
});