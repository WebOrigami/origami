import ExplorableGraph from "../core/ExplorableGraph.js";
import OrigamiTemplate from "../framework/OrigamiTemplate.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import paths from "./@paths.js";

const templateText = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{{ map @input, =\`
  <url>
    <loc>{{ @value }}</loc>
  </url>
\`}}
</urlset>
`;

/**
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @param {string} [baseHref ]
 */
export default async function sitemap(variant, baseHref = "") {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  const graph = ExplorableGraph.from(variant);

  // Filter out `sitemap.xml` from the graph to avoid recursion.
  const sitemapKey = "sitemap.xml";
  const filterGraph = {
    async keys() {
      const keys = Array.from(await graph.keys());
      return keys.filter((key) => key !== sitemapKey);
    },

    async get(key) {
      return key === sitemapKey ? undefined : graph.get(key);
    },
  };

  const graphPaths = await paths.call(this, filterGraph, baseHref);

  // For simplicity, we assume that HTML pages will end in .html.
  // If the page is named index.html, we remove index.html from
  // the path.
  const htmlPaths = graphPaths
    .filter((path) => path.endsWith(".html"))
    .map((path) => (path.endsWith("index.html") ? path.slice(0, -10) : path));

  const template = new OrigamiTemplate(templateText);
  const resultWithGraph = await template.apply(htmlPaths);
  const resultText = resultWithGraph.toString();
  return resultText;
}
