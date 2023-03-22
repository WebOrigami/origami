import ExplorableGraph from "../core/ExplorableGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Concatenate the text content of objects or graphs.
 *
 * @this {Explorable}
 * @param {any[]} args
 */
export default async function concat(...args) {
  assertScopeIsDefined(this);
  let graph;
  if (args.length === 0) {
    graph = await this.get("@defaultGraph");
    if (graph === undefined) {
      return undefined;
    }
  } else {
    graph = args.map((arg) =>
      // Strings are used as is, even if they have a .toGraph method
      arg instanceof String
        ? arg
        : ExplorableGraph.canCastToExplorable(arg)
        ? ExplorableGraph.from(arg)
        : arg
    );
  }

  // The core concat operation is a map-reduce: convert everything to strings,
  // then concatenate the strings.
  const scope = this;
  const mapFn = async (value) => {
    // The value may be a function (perhaps a lambda), in which case call it.
    if (typeof value === "function") {
      value = await value.call(scope);
    }
    // Things that aren't stringify-able will be mapped to the empty string.
    return value?.toString?.() ?? "";
  };
  const reduceFn = (values) => values.join("");
  return ExplorableGraph.mapReduce(graph, mapFn, reduceFn);
}

concat.usage = `concat <...objs>\tConcatenate text and/or graphs of text`;
concat.documentation = "https://graphorigami.org/cli/builtins.html#concat";
