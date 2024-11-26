// Generated tests -- do not edit directly
// @ts-nocheck

import assert from "node:assert";
import { describe } from "node:test";
import oriEval from "../generator/oriEval.js";

describe("nullishCoalescingExpression - JavaScript", () => {
  assert.strictEqual(null ?? 42, 42, "Left operand is null, returns right operand");
  assert.strictEqual(undefined ?? 42, 42, "Left operand is undefined, returns right operand");
  assert.strictEqual(0 ?? 42, 0, "Left operand is 0 (falsy but not nullish), returns left operand");
  assert.strictEqual('' ?? 'default', "", "Left operand is an empty string (falsy but not nullish), returns left operand");
  assert.strictEqual(false ?? true, false, "Left operand is false (falsy but not nullish), returns left operand");
  assert.strictEqual(42 ?? 0, 42, "Left operand is a non-nullish truthy value, returns left operand");
  assert.strictEqual(null ?? undefined, undefined, "Left operand is null, returns right operand which is undefined");
  assert.deepEqual(undefined ?? null, null, "Left operand is undefined, returns right operand which is null");
  assert.strictEqual(NaN ?? 42, NaN, "Left operand is NaN (not nullish), returns left operand");
  assert.deepEqual([] ?? 'default', [], "Left operand is an empty array (not nullish), returns left operand");
  assert.deepEqual({} ?? 'default', {}, "Left operand is an empty object (not nullish), returns left operand");
  assert.strictEqual((null ?? 42) ?? 50, 42, "Nested nullish coalescing, first nullish operand replaced, second ignored");
  assert.strictEqual((undefined ?? null) ?? 'fallback', "fallback", "Nested nullish coalescing");
  assert.strictEqual((0 ?? null) ?? 'fallback', 0, "Nested nullish coalescing with falsy but non-nullish value");
  assert.strictEqual(null ?? (undefined ?? 42), 42, "Nullish coalescing in the right operand");
  assert.strictEqual(null ?? null ?? null ?? 'fallback', "fallback", "Chained nullish coalescing, resolves to the last non-nullish value");
  assert.strictEqual(null ?? (false ?? 'default'), false, "Right operand evaluates to non-nullish falsy value");
  assert.strictEqual(null ?? (true ?? 'default'), true, "Right operand evaluates to truthy value");
  assert.strictEqual(42 ?? (null ?? 0), 42, "Left operand is not nullish, ignores right operand");
  assert.strictEqual(undefined ?? null ?? 'value', "value", "Chained nullish coalescing with undefined and null");
  assert.strictEqual((NaN ?? null) ?? 42, NaN, "Left operand is NaN, not nullish, returns NaN");
  assert.strictEqual((undefined ?? NaN) ?? 42, NaN, "Right operand resolves to NaN");
  assert.strictEqual(null ?? 'default' ?? 42, "default", "Chained nullish coalescing, resolves to first non-nullish value");
  assert.strictEqual('' ?? 'default' ?? 42, "", "Falsy but non-nullish value, returns left operand");
  assert.strictEqual(null ?? undefined ?? NaN, NaN, "Chained nullish coalescing, resolves to NaN as the first non-nullish value");
  assert.strictEqual((null ?? null) ?? undefined, undefined, "Nested nullish coalescing resolves to undefined");
});

describe("nullishCoalescingExpression - Origami", async() => {
  assert.strictEqual(await oriEval("null ?? 42"), 42, "Left operand is null, returns right operand");
  assert.strictEqual(await oriEval("undefined ?? 42"), 42, "Left operand is undefined, returns right operand");
  assert.strictEqual(await oriEval("0 ?? 42"), 0, "Left operand is 0 (falsy but not nullish), returns left operand");
  assert.strictEqual(await oriEval("'' ?? 'default'"), "", "Left operand is an empty string (falsy but not nullish), returns left operand");
  assert.strictEqual(await oriEval("false ?? true"), false, "Left operand is false (falsy but not nullish), returns left operand");
  assert.strictEqual(await oriEval("42 ?? 0"), 42, "Left operand is a non-nullish truthy value, returns left operand");
  assert.strictEqual(await oriEval("null ?? undefined"), undefined, "Left operand is null, returns right operand which is undefined");
  assert.deepEqual(await oriEval("undefined ?? null"), null, "Left operand is undefined, returns right operand which is null");
  assert.strictEqual(await oriEval("NaN ?? 42"), NaN, "Left operand is NaN (not nullish), returns left operand");
  assert.deepEqual(await oriEval("[] ?? 'default'"), [], "Left operand is an empty array (not nullish), returns left operand");
  assert.deepEqual(await oriEval("{} ?? 'default'"), {}, "Left operand is an empty object (not nullish), returns left operand");
  assert.strictEqual(await oriEval("(null ?? 42) ?? 50"), 42, "Nested nullish coalescing, first nullish operand replaced, second ignored");
  assert.strictEqual(await oriEval("(undefined ?? null) ?? 'fallback'"), "fallback", "Nested nullish coalescing");
  assert.strictEqual(await oriEval("(0 ?? null) ?? 'fallback'"), 0, "Nested nullish coalescing with falsy but non-nullish value");
  assert.strictEqual(await oriEval("null ?? (undefined ?? 42)"), 42, "Nullish coalescing in the right operand");
  assert.strictEqual(await oriEval("null ?? null ?? null ?? 'fallback'"), "fallback", "Chained nullish coalescing, resolves to the last non-nullish value");
  assert.strictEqual(await oriEval("null ?? (false ?? 'default')"), false, "Right operand evaluates to non-nullish falsy value");
  assert.strictEqual(await oriEval("null ?? (true ?? 'default')"), true, "Right operand evaluates to truthy value");
  assert.strictEqual(await oriEval("42 ?? (null ?? 0)"), 42, "Left operand is not nullish, ignores right operand");
  assert.strictEqual(await oriEval("undefined ?? null ?? 'value'"), "value", "Chained nullish coalescing with undefined and null");
  assert.strictEqual(await oriEval("(NaN ?? null) ?? 42"), NaN, "Left operand is NaN, not nullish, returns NaN");
  assert.strictEqual(await oriEval("(undefined ?? NaN) ?? 42"), NaN, "Right operand resolves to NaN");
  assert.strictEqual(await oriEval("null ?? 'default' ?? 42"), "default", "Chained nullish coalescing, resolves to first non-nullish value");
  assert.strictEqual(await oriEval("'' ?? 'default' ?? 42"), "", "Falsy but non-nullish value, returns left operand");
  assert.strictEqual(await oriEval("null ?? undefined ?? NaN"), NaN, "Chained nullish coalescing, resolves to NaN as the first non-nullish value");
  assert.strictEqual(await oriEval("(null ?? null) ?? undefined"), undefined, "Nested nullish coalescing resolves to undefined");
});