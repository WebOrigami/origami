import assert from "assert/strict";
import builtins from "../cli/builtins.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import MetaTransform from "../framework/MetaTransform.js";

/**
 * Assert that the expected and actual values in the graph are equal.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function assertBuiltin(variant) {
  variant = variant ?? (await this.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  let graph = ExplorableGraph.from(variant);

  // If the graph isn't already a MetaGraph, make it one.
  if (!("formulas" in graph) || !("parent" in graph)) {
    graph = transformObject(MetaTransform, graph);
  }
  if (!graph.parent) {
    graph.parent = this ?? builtins;
  }

  const description = await graph.get("description");
  const expected = await graph.get("expected");

  let actual;
  try {
    actual = await graph.get("actual");
  } catch (e) {
    return {
      description,
      exception: e.message,
    };
  }

  try {
    assert.deepStrictEqual(actual, expected);
    return undefined;
  } catch (e) {
    return {
      description,
      expected,
      actual,
    };
  }
}

assertBuiltin.usage = `assert <graph>\tAssert that a graph's expected and actual values are equal`;
assertBuiltin.documentation =
  "https://explorablegraph.org/cli/builtins.html#assert";
