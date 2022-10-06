import MergeGraph from "../common/MergeGraph.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import DefaultPages from "./DefaultPages.js";

/**
 * @this {Explorable}
 */
export default async function defaultScope() {
  // Force use of default index.html page.
  const scope = /** @type {any} */ (this).scope;
  const graph = new MergeGraph(
    {
      "index.html": () => defaultIndexHtml.call(scope),
    },
    scope
  );
  return new DefaultPages(graph);
}
