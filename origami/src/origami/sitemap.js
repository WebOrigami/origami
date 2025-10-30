import { getTreeArgument, Tree } from "@weborigami/async-tree";
import { ori_handler } from "@weborigami/language/src/handlers/handlers.js";

const templateText = `(urls) => \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\${ Tree.map(urls, (url) => \`  <url>
    <loc>\${ url }</loc>
  </url>
\`) }</urlset>
\`
`;

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {{ assumeSlashes?: boolean, base?: string }} options
 * @returns {Promise<string>}
 */
export default async function sitemap(maplike, options = {}) {
  const tree = await getTreeArgument(maplike, "sitemap");

  // We're only interested in keys that end in .html or with no extension.
  const filtered = await Tree.filter(
    tree,
    (value, key) => key.endsWith?.(".html") || !key.includes?.(".")
  );

  const treePaths = await Tree.paths(filtered, options);

  // For simplicity, we assume that HTML pages will end in .html.
  // If the page is named index.html, we remove index.html from
  // the path.
  const htmlPaths = treePaths
    .filter((path) => path.endsWith(".html"))
    .map((path) => (path.endsWith("index.html") ? path.slice(0, -10) : path));

  const templateFn = await ori_handler.unpack(templateText);
  const templateResult = await templateFn(htmlPaths);
  return String(templateResult);
}
