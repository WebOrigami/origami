import ExplorableGraph from "../../core/ExplorableGraph.js";

/**
 * Returns the parent of the current graph.
 *
 * @this {Explorable}
 */
export default async function parent(variant) {
  const graph = variant ? ExplorableGraph.from(variant) : this;
  return /** @type {any} */ (graph).parent;
}

parent.usage = `parent\tThe parent of the current graph`;
