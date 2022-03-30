import MapGraph from "../core/MapGraph.js";

/**
 * Return a new graph with all values equal to null.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function nulls(variant) {
  variant = variant ?? (await this.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  return new MapGraph(variant, () => null);
}

nulls.usage = `nulls <graph>\tReturn a new graph with all values equal to null`;
nulls.documentation = "https://explorablegraph.org/cli/builtins.html#nulls";
