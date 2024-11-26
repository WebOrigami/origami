// Generated tests -- do not edit directly
// @ts-nocheck

import assert from "node:assert";
import { describe } from "node:test";
import oriEval from "../generator/oriEval.js";

describe("logicalAndExpression - JavaScript", () => {
  assert.strictEqual(true && true, true, "Both operands are true");
  assert.strictEqual(true && false, false, "First operand is true, second is false");
  assert.strictEqual(false && true, false, "First operand is false, second is true");
  assert.strictEqual(false && false, false, "Both operands are false");
  assert.strictEqual(false && (1 / 0), false, "Short-circuit evaluation: first operand false, second not evaluated");
  assert.strictEqual(true && 42, 42, "Short-circuit evaluation: first operand true, evaluates second");
  assert.strictEqual(0 && true, 0, "Short-circuiting with falsy value (0)");
  assert.strictEqual(true && 'string', "string", "Truthy value with string");
  assert.strictEqual(false && 'string', false, "Falsy value with string");
  assert.strictEqual(1 && 0, 0, "Truthy numeric value with falsy numeric value");
  assert.strictEqual(0 && 1, 0, "Falsy numeric value with truthy numeric value");
  assert.strictEqual('' && 'non-empty string', "", "Falsy string value with truthy string");
  assert.strictEqual('non-empty string' && '', "", "Truthy string with falsy string");
  assert.strictEqual({} && true, true, "Empty object as first operand");
  assert.deepEqual(true && {}, {}, "Empty object as second operand");
  assert.strictEqual([] && true, true, "Array as first operand");
  assert.deepEqual(true && [], [], "Array as second operand");
  assert.deepEqual(null && true, null, "Null as first operand");
  assert.deepEqual(true && null, null, "Null as second operand");
  assert.strictEqual(undefined && true, undefined, "Undefined as first operand");
  assert.strictEqual(true && undefined, undefined, "Undefined as second operand");
  assert.strictEqual(NaN && true, NaN, "NaN as first operand");
  assert.strictEqual(true && NaN, NaN, "NaN as second operand");
  assert.strictEqual((true && false) && true, false, "Nested logical ANDs with a false in the middle");
  assert.strictEqual((true && true) && true, true, "Nested logical ANDs with all true");
  assert.strictEqual(true && (true && false), false, "Nested logical ANDs with false in inner");
  assert.strictEqual((true && (false && true)), false, "Complex nesting with false at inner-most");
  assert.strictEqual(true && (3 || 0), 3, "Logical AND with logical OR");
  assert.strictEqual(true && (0 || 3), 3, "Logical AND with logical OR and falsy values");
  assert.strictEqual('' && false, "", "Falsy string and false");
  assert.strictEqual(false && '', false, "False and falsy string");
  assert.strictEqual(undefined && null, undefined, "Undefined and null");
  assert.deepEqual(null && undefined, null, "Null and undefined");
  assert.strictEqual((false && true) && undefined, false, "Short-circuiting nested AND with undefined");
});

describe("logicalAndExpression - Origami", async() => {
  assert.strictEqual(await oriEval("true && true"), true, "Both operands are true");
  assert.strictEqual(await oriEval("true && false"), false, "First operand is true, second is false");
  assert.strictEqual(await oriEval("false && true"), false, "First operand is false, second is true");
  assert.strictEqual(await oriEval("false && false"), false, "Both operands are false");
  assert.strictEqual(await oriEval("false && (1 / 0)"), false, "Short-circuit evaluation: first operand false, second not evaluated");
  assert.strictEqual(await oriEval("true && 42"), 42, "Short-circuit evaluation: first operand true, evaluates second");
  assert.strictEqual(await oriEval("0 && true"), 0, "Short-circuiting with falsy value (0)");
  assert.strictEqual(await oriEval("true && 'string'"), "string", "Truthy value with string");
  assert.strictEqual(await oriEval("false && 'string'"), false, "Falsy value with string");
  assert.strictEqual(await oriEval("1 && 0"), 0, "Truthy numeric value with falsy numeric value");
  assert.strictEqual(await oriEval("0 && 1"), 0, "Falsy numeric value with truthy numeric value");
  assert.strictEqual(await oriEval("'' && 'non-empty string'"), "", "Falsy string value with truthy string");
  assert.strictEqual(await oriEval("'non-empty string' && ''"), "", "Truthy string with falsy string");
  assert.strictEqual(await oriEval("{} && true"), true, "Empty object as first operand");
  assert.deepEqual(await oriEval("true && {}"), {}, "Empty object as second operand");
  assert.strictEqual(await oriEval("[] && true"), true, "Array as first operand");
  assert.deepEqual(await oriEval("true && []"), [], "Array as second operand");
  assert.deepEqual(await oriEval("null && true"), null, "Null as first operand");
  assert.deepEqual(await oriEval("true && null"), null, "Null as second operand");
  assert.strictEqual(await oriEval("undefined && true"), undefined, "Undefined as first operand");
  assert.strictEqual(await oriEval("true && undefined"), undefined, "Undefined as second operand");
  assert.strictEqual(await oriEval("NaN && true"), NaN, "NaN as first operand");
  assert.strictEqual(await oriEval("true && NaN"), NaN, "NaN as second operand");
  assert.strictEqual(await oriEval("(true && false) && true"), false, "Nested logical ANDs with a false in the middle");
  assert.strictEqual(await oriEval("(true && true) && true"), true, "Nested logical ANDs with all true");
  assert.strictEqual(await oriEval("true && (true && false)"), false, "Nested logical ANDs with false in inner");
  assert.strictEqual(await oriEval("(true && (false && true))"), false, "Complex nesting with false at inner-most");
  assert.strictEqual(await oriEval("true && (3 || 0)"), 3, "Logical AND with logical OR");
  assert.strictEqual(await oriEval("true && (0 || 3)"), 3, "Logical AND with logical OR and falsy values");
  assert.strictEqual(await oriEval("'' && false"), "", "Falsy string and false");
  assert.strictEqual(await oriEval("false && ''"), false, "False and falsy string");
  assert.strictEqual(await oriEval("undefined && null"), undefined, "Undefined and null");
  assert.deepEqual(await oriEval("null && undefined"), null, "Null and undefined");
  assert.strictEqual(await oriEval("(false && true) && undefined"), false, "Short-circuiting nested AND with undefined");
});