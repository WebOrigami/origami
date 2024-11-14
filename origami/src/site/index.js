import getTreeArgument from "../common/getTreeArgument.js";
import { keySymbol } from "../common/utilities.js";

/**
 * Return a default index.html page for the current tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function index(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "site:index");
  const keys = Array.from(await tree.keys());

  // Skip system-ish files that start with a period. Also skip `index.html`.
  const filtered = keys.filter(
    (key) => !(key.startsWith?.(".") || key === "index.html")
  );

  const links = [];
  for (const key of filtered) {
    const keyText = String(key);
    // Simple key.
    const link = `      <li><a href="${keyText}">${keyText}</a></li>`;
    links.push(link);
  }

  const heading = tree[keySymbol] ?? "Index";
  const list = `    <ul>\n${links.join("\n")}\n    </ul>`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      li {
        margin-bottom: 0.20em;
      }

      a {
        text-decoration: none;
      }
      a:hover {
        text-decoration: revert;
      }
    </style>
  </head>
  <body>
    <h1>${heading.trim()}</h1>
${list}
  </body>
</html>
`;

  /** @type {any} */
  const result = new String(html);
  result.unpack = () => tree;
  return result;
}
