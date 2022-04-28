import ExplorableGraph from "../core/ExplorableGraph.js";
import DefaultPages from "../framework/DefaultPages.js";
import meta from "./meta.js";

/**
 * Wrap the indicated graph as a virtual app.
 *
 * @this {Explorable}
 * @param {Explorable} [variant]
 */
export default async function graphVirtual(variant) {
  // When running with native imports, `this` will be undefined if the caller
  // just invoked the function normally (without an explicit `call`). However,
  // it appears that when running with a bundler (such as the one StackBlitz
  // uses), `this` may end up being the Module defining the function. To avoid
  // incorporating that Module into scope, we check to make sure `this` is
  // actually explorable.
  const scope = ExplorableGraph.isExplorable(this) ? this : undefined;

  const graph = await meta.call(scope, variant);
  const result = new DefaultPages(graph);
  return result;
}

graphVirtual.usage = `graphVirtual <graph>\tWrap the indicatedd graph as a virtual app`;
graphVirtual.documentation =
  "https://explorablegraph.org/cli/builtins.html#graphVirtual";
