import { Tree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";
import getTreeArgument from "../misc/getTreeArgument.js";
import { builtins, oriHandler } from "./internal.js";

const templateText = `(urls) => \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\${ @map(urls, (url) => \`  <url>
    <loc>\${ url }</loc>
  </url>
\`) }</urlset>
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
  assertTreeIsDefined(this, "sitemap");
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

  const treePaths = await Tree.paths(filterTree, baseHref);

  // For simplicity, we assume that HTML pages will end in .html.
  // If the page is named index.html, we remove index.html from
  // the path.
  const htmlPaths = treePaths
    .filter((path) => path.endsWith(".html"))
    .map((path) => (path.endsWith("index.html") ? path.slice(0, -10) : path));

  const templateFn = await oriHandler.unpack(templateText);
  const target = this ?? builtins;
  const templateResult = await templateFn.call(target, htmlPaths);
  return String(templateResult);
}

sitemap.usage = `@sitemap <tree>\tGenerate a sitemap for a tree`;
sitemap.documentation = "https://weborigami.org/cli/builtins.html#@sitemap";
