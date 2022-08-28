import ExplorableGraph from "../core/ExplorableGraph.js";
import DefaultPages from "../framework/DefaultPages.js";

/**
 * Add default pages to the indicated graph.
 *
 * @this {Explorable}
 * @param {Explorable} [variant]
 */
export default async function defaultPages(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return;
  }
  const graph = ExplorableGraph.from(variant);
  const result = new DefaultPages(graph);
  return result;
}

defaultPages.usage = `defaultPages <graph>\tAdd default pages like index.html to the graph`;
defaultPages.documentation =
  "https://explorablegraph.org/cli/builtins.html#defaultPages";
