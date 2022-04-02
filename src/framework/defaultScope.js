import Compose from "../common/Compose.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import DefaultPages from "./DefaultPages.js";

/**
 * @this {Explorable}
 */
export default async function defaultScope() {
  // Force use of default index.html page.
  const scope = this.scope;
  const graph = new Compose(
    {
      "index.html": () => defaultIndexHtml.call(scope),
    },
    scope
  );
  return new DefaultPages(graph);
}
