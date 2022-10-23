import Scope from "../common/Scope.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import DefaultPages from "./DefaultPages.js";

/**
 * @this {Explorable}
 */
export default async function defaultScope() {
  // Force use of default index.html page.
  const baseScope = /** @type {any} */ (this).scope ?? this;
  const scope = new Scope(
    {
      "@defaultGraph": this,
      "index.html": () => defaultIndexHtml.call(baseScope),
    },
    baseScope
  );
  const graph = new DefaultPages(scope);
  // Graph will be its own scope.
  /** @type {any} */ (graph).scope = scope;
  return graph;
}
