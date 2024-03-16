import getTreeArgument from "../misc/getTreeArgument.js";
import builtins from "./@builtins.js";
import paths from "./@paths.js";
import fileTypeOrigami from "./ori.handler.js";

const templateText = `=\`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\${ @map(=\`
  <url>
    <loc>\${ _ }</loc>
  </url>
\`)(_) }
</urlset>
\`
`;

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {string} [baseHref ]
 */
export default async function sitemap(treelike, baseHref = "") {
  const tree = await getTreeArgument(this, arguments, treelike, "@sitemap");

  // We're only interested in keys that end in .html or with no extension.
  function test(key) {
    return key.endsWith?.(".html") || !key.includes?.(".");
  }
  const filterTree = {
    async keys() {
      const keys = Array.from(await tree.keys());
      return keys.filter((key) => test(key));
    },

    async get(key) {
      return test(key) ? tree.get(key) : undefined;
    },
  };

  const treePaths = await paths.call(this, filterTree, baseHref);

  // For simplicity, we assume that HTML pages will end in .html.
  // If the page is named index.html, we remove index.html from
  // the path.
  const htmlPaths = treePaths
    .filter((path) => path.endsWith(".html"))
    .map((path) => (path.endsWith("index.html") ? path.slice(0, -10) : path));

  const templateFn = await fileTypeOrigami.unpack(templateText);
  const templateResult = await templateFn.call(builtins, htmlPaths);
  return String(templateResult);
}

sitemap.usage = `@sitemap <tree>\tGenerate a sitemap for a tree`;
sitemap.documentation = "https://weborigami.org/cli/builtins.html#@sitemap";
