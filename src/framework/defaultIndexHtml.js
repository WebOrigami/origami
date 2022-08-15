import ExplorableGraph from "../core/ExplorableGraph.js";
import StringWithGraph from "./StringWithGraph.js";

/**
 * Return a default index.html page for the current graph.
 *
 * @this {Explorable}
 */
export default async function defaultIndexHtml(
  options = { showDiagnosticLinks: false }
) {
  const graph = this;
  const keys = await ExplorableGraph.keys(graph);
  const filtered = filterKeys(keys);
  const links = [];
  for (const key of filtered) {
    let link;
    const keyText = String(key);
    if (keyText.includes("=")) {
      const isWildcard = keyText.startsWith("{");
      if (isWildcard) {
        link = `<li class="formula wildcard"><a href="${keyText}">${keyText}</a></li>`;
      } else {
        // Split on first equals sign.
        const equalsIndex = keyText.indexOf("=");
        const lhs = keyText.substring(0, equalsIndex).trim();
        const rhs = keyText.substring(equalsIndex + 1);
        link = `<li><a href="${lhs}">${lhs}</a> <span class="formula rhs"><a href="${keyText}">= ${rhs}</a></span></li>`;
      }
    } else {
      // Simple key.
      link = `<li><a href="${keyText}">${keyText}</a></li>`;
    }
    links.push(link);
  }

  const parts = /** @type {any} */ (graph).path?.split("/");
  const heading = parts?.[parts.length - 1] ?? "Index";
  const list = `
    <h1>${heading.trim()}</h1>
    <ul>\n${links.join("\n").trim()}\n</ul>
  `;

  const diagnosticLinks = options.showDiagnosticLinks
    ? `<p>
  <a href=".dataflow">dataflow</a>
  <a href=".svg">svg</a>
  <a href=".yaml">yaml</a>
</p>`
    : "";

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
            font-family: monospace;
          }
          .formula a {
            color: inherit;
          }

          .rhs {
            margin-left: 1em;
          }
        </style>
      </head>
      <body>
        ${list.trim()}
        ${diagnosticLinks}
      </body>
    </html>`;
  return new StringWithGraph(html.trim(), graph);
}

function filterKeys(keys) {
  const filtered = [];
  let previous = null;
  for (const key of keys) {
    const keyText = key.toString();
    if (keyText.startsWith(".")) {
      // Skip "private" files.
      continue;
    }
    if (previous && keyText.includes("=")) {
      const sides = key.split("=");
      const lhs = sides[0].trim();
      if (lhs.trim() === previous) {
        // Formula for the previous key replaces it.
        filtered.pop();
      }
    }
    filtered.push(key);
    previous = keyText;
  }
  return filtered;
}
