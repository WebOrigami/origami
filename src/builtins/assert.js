import assert from "assert/strict";
import builtins from "../cli/builtins.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Assert that the expected and actual values in the graph are equal.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function assertBuiltin(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }

  let graph = ExplorableGraph.from(variant);

  if ("parent" in graph && !graph.parent) {
    graph.parent = this ?? builtins;
  }

  const description = await graph.get("description");
  const expected = await graph.get("expected");

  let actual;
  try {
    actual = await graph.get("actual");
  } catch (/** @type {any} */ error) {
    return {
      description,
      exception: error.message,
    };
  }

  const expectedPlain = ExplorableGraph.canCastToExplorable(expected)
    ? await ExplorableGraph.plain(expected)
    : expected;
  const actualPlain = ExplorableGraph.canCastToExplorable(actual)
    ? await ExplorableGraph.plain(actual)
    : actual;

  try {
    assert.deepStrictEqual(actualPlain, expectedPlain);
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
  "https://graphorigami.org/cli/builtins.html#assert";
