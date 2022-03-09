import MapGraph from "../core/MapGraph.js";

/**
 * Return a new graph with all values equal to null.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default function nulls(variant) {
  variant = variant ?? this;
  return new MapGraph(variant, () => null);
}

nulls.usage = `nulls <graph>\tReturn a new graph with all values equal to null`;
nulls.documentation = "https://explorablegraph.org/cli/builtins.html#nulls";
