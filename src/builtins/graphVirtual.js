import DefaultPages from "../framework/DefaultPages.js";
import meta from "./meta.js";

/**
 * Wrap the indicated graph as a virtual app.
 *
 * @this {Explorable}
 * @param {Explorable} [variant]
 */
export default async function graphVirtual(variant) {
  const graph = await meta.call(this, variant);
  const result = new DefaultPages(graph);
  return result;
}

graphVirtual.usage = `graphVirtual <graph>\tWrap the indicatedd graph as a virtual app`;
graphVirtual.documentation =
  "https://explorablegraph.org/cli/builtins.html#graphVirtual";
