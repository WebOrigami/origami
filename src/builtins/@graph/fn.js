import FunctionGraph from "../../core/FunctionGraph.js";
import { graphInContext } from "../../core/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Create a graph from a function and a set of keys.
 *
 * @this {Explorable}
 * @param {Invocable} [invocable]
 */
export default async function fn(invocable, keys = []) {
  assertScopeIsDefined(this);
  invocable = invocable ?? (await this?.get("@current"));
  if (invocable === undefined) {
    return undefined;
  }
  const invocableFn =
    typeof invocable === "function" ? invocable : invocable.toFunction();

  /** @this {Explorable} */
  async function extendedFn(key) {
    const scope = this;
    const ambientsGraph = graphInContext(
      {
        "@key": key,
      },
      scope
    );
    return invocableFn.call(ambientsGraph, key);
  }

  return new FunctionGraph(extendedFn, keys);
}

fn.usage = `fn <fn>, [<keys>]\tCreate a graph from a function and a set of keys`;
fn.documentation = "https://graphorigami.org/cli/graph.html#fn";