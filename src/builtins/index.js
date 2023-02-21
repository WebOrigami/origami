import StringWithGraph from "../common/StringWithGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { getScope } from "../framework/scopeUtilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Return a default index.html page for the current graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function index(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const keys = await ExplorableGraph.keys(graph);

  // Skip system-ish files that start with a period.
  const filtered = keys.filter((key) => !key.startsWith?.("."));

  const links = [];
  for (const key of filtered) {
    const keyText = String(key);
    // Simple key.
    const link = `<li><a href="${keyText}">${keyText}</a></li>`;
    links.push(link);
  }

  const scope = getScope(graph);
  const graphKey = await scope.get("@key");
  const heading = graphKey ?? "Index";
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

          .formula {
            color: #888;
          }
          .formula a {
            color: inherit;
          }
        </style>
      </head>
      <body>
        ${list.trim()}
      </body>
    </html>`;
  return new StringWithGraph(html.trim(), graph);
}
