import { Graph } from "@graphorigami/core";
import TextDocument from "../common/TextDocument.js";
import { keySymbol } from "../common/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Return a default index.html page for the current graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [variant]
 */
export default async function index(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = Graph.from(variant);
  const keys = Array.from(await graph.keys());

  // Skip system-ish files that start with a period. Also skip `index.html`.
  const filtered = keys.filter(
    (key) => !(key.startsWith?.(".") || key === "index.html")
  );

  const links = [];
  for (const key of filtered) {
    const keyText = String(key);
    // Simple key.
    const link = `<li><a href="${keyText}">${keyText}</a></li>`;
    links.push(link);
  }

  const heading = graph[keySymbol] ?? "Index";
  const list = `
    <h1>${heading.trim()}</h1>
    <ul>\n${links.join("\n").trim()}\n</ul>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
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
        ${list.trim()}
      </body>
    </html>`;

  return new TextDocument(html.trim(), { contents: graph });
}

index.usage = `@index\tReturn a default index.html page for the current graph`;
index.documentation = "https://graphorigami.org/language/@index.html";
