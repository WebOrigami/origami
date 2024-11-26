// Generated tests -- do not edit directly
// @ts-nocheck

import assert from "node:assert";
import { describe } from "node:test";
import oriEval from "../generator/oriEval.js";

describe("logicalOrExpression - JavaScript", () => {
  assert.strictEqual(true || true, true, "Both operands are true");
  assert.strictEqual(true || false, true, "First operand is true, second is false");
  assert.strictEqual(false || true, true, "First operand is false, second is true");
  assert.strictEqual(false || false, false, "Both operands are false");
  assert.strictEqual(false || 42, 42, "Short-circuit evaluation: first operand false, evaluates second");
  assert.strictEqual(0 || true, true, "Falsy value (0) with truthy second operand");
  assert.strictEqual(true || 'string', true, "Truthy first operand, string second operand not evaluated");
  assert.strictEqual(false || 'string', "string", "Falsy first operand, evaluates string second operand");
  assert.strictEqual(1 || 0, 1, "Truthy numeric value with falsy numeric value");
  assert.strictEqual(0 || 1, 1, "Falsy numeric value with truthy numeric value");
  assert.strictEqual('' || 'non-empty string', "non-empty string", "Falsy string value with truthy string");
  assert.strictEqual('non-empty string' || '', "non-empty string", "Truthy string with falsy string");
  assert.deepEqual({} || true, {}, "Empty object as first operand");
  assert.strictEqual(true || {}, true, "True as first operand, object not evaluated");
  assert.deepEqual([] || true, [], "Array as first operand");
  assert.strictEqual(true || [], true, "True as first operand, array not evaluated");
  assert.strictEqual(null || true, true, "Null as first operand");
  assert.strictEqual(true || null, true, "True as first operand, null not evaluated");
  assert.strictEqual(undefined || true, true, "Undefined as first operand");
  assert.strictEqual(true || undefined, true, "True as first operand, undefined not evaluated");
  assert.strictEqual(NaN || true, true, "NaN as first operand");
  assert.strictEqual(true || NaN, true, "True as first operand, NaN not evaluated");
  assert.strictEqual((false || true) || false, true, "Nested logical ORs with a true in the middle");
  assert.strictEqual((false || false) || true, true, "Nested logical ORs with a true at the end");
  assert.strictEqual(false || (false || true), true, "Nested logical ORs with true in inner");
  assert.strictEqual((false || (true || false)), true, "Complex nesting with true at inner-most");
  assert.strictEqual(false || (3 && 0), 0, "Logical OR with logical AND and falsy result");
  assert.strictEqual(false || (0 && 3), 0, "Logical OR with logical AND and falsy first operand");
  assert.strictEqual('' || false, false, "Falsy string and false");
  assert.strictEqual(false || '', "", "False and falsy string");
  assert.deepEqual(undefined || null, null, "Undefined and null");
  assert.strictEqual(null || undefined, undefined, "Null and undefined");
  assert.strictEqual((true || false) || undefined, true, "Short-circuiting nested OR with undefined");
});

describe("logicalOrExpression - Origami", async() => {
  assert.strictEqual(await oriEval("true || true"), true, "Both operands are true");
  assert.strictEqual(await oriEval("true || false"), true, "First operand is true, second is false");
  assert.strictEqual(await oriEval("false || true"), true, "First operand is false, second is true");
  assert.strictEqual(await oriEval("false || false"), false, "Both operands are false");
  assert.strictEqual(await oriEval("false || 42"), 42, "Short-circuit evaluation: first operand false, evaluates second");
  assert.strictEqual(await oriEval("0 || true"), true, "Falsy value (0) with truthy second operand");
  assert.strictEqual(await oriEval("true || 'string'"), true, "Truthy first operand, string second operand not evaluated");
  assert.strictEqual(await oriEval("false || 'string'"), "string", "Falsy first operand, evaluates string second operand");
  assert.strictEqual(await oriEval("1 || 0"), 1, "Truthy numeric value with falsy numeric value");
  assert.strictEqual(await oriEval("0 || 1"), 1, "Falsy numeric value with truthy numeric value");
  assert.strictEqual(await oriEval("'' || 'non-empty string'"), "non-empty string", "Falsy string value with truthy string");
  assert.strictEqual(await oriEval("'non-empty string' || ''"), "non-empty string", "Truthy string with falsy string");
  assert.deepEqual(await oriEval("{} || true"), {}, "Empty object as first operand");
  assert.strictEqual(await oriEval("true || {}"), true, "True as first operand, object not evaluated");
  assert.deepEqual(await oriEval("[] || true"), [], "Array as first operand");
  assert.strictEqual(await oriEval("true || []"), true, "True as first operand, array not evaluated");
  assert.strictEqual(await oriEval("null || true"), true, "Null as first operand");
  assert.strictEqual(await oriEval("true || null"), true, "True as first operand, null not evaluated");
  assert.strictEqual(await oriEval("undefined || true"), true, "Undefined as first operand");
  assert.strictEqual(await oriEval("true || undefined"), true, "True as first operand, undefined not evaluated");
  assert.strictEqual(await oriEval("NaN || true"), true, "NaN as first operand");
  assert.strictEqual(await oriEval("true || NaN"), true, "True as first operand, NaN not evaluated");
  assert.strictEqual(await oriEval("(false || true) || false"), true, "Nested logical ORs with a true in the middle");
  assert.strictEqual(await oriEval("(false || false) || true"), true, "Nested logical ORs with a true at the end");
  assert.strictEqual(await oriEval("false || (false || true)"), true, "Nested logical ORs with true in inner");
  assert.strictEqual(await oriEval("(false || (true || false))"), true, "Complex nesting with true at inner-most");
  assert.strictEqual(await oriEval("false || (3 && 0)"), 0, "Logical OR with logical AND and falsy result");
  assert.strictEqual(await oriEval("false || (0 && 3)"), 0, "Logical OR with logical AND and falsy first operand");
  assert.strictEqual(await oriEval("'' || false"), false, "Falsy string and false");
  assert.strictEqual(await oriEval("false || ''"), "", "False and falsy string");
  assert.deepEqual(await oriEval("undefined || null"), null, "Undefined and null");
  assert.strictEqual(await oriEval("null || undefined"), undefined, "Null and undefined");
  assert.strictEqual(await oriEval("(true || false) || undefined"), true, "Short-circuiting nested OR with undefined");
});