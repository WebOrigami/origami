import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function defaultIndexHtml() {
  // @ts-ignore
  const graph = ExplorableGraph.from(this);
  const keys = await ExplorableGraph.keys(graph);
  const filtered = filterKeys(keys);
  const links = [];
  for (const key of filtered) {
    let link;
    const keyText = String(key);
    const isFormula = keyText.includes("=");
    const isWildcard = keyText.startsWith("{");
    if (isFormula) {
      if (isWildcard) {
        link = `<li class="formula wildcard"><a href="${keyText}">${keyText}</a></li>`;
      } else {
        const parts = keyText.split("=");
        const lhs = parts[0].trim();
        const rhs = parts[1].trim();
        link = `<li><a href="${lhs}">${lhs}</a> <span class="formula rhs"><a href="${keyText}">= ${rhs}</a></span></li>`;
      }
    } else {
      // Simple key.
      link = `<li><a href="${keyText}">${keyText}</a></li>`;
    }
    links.push(link);
  }

  const parts = graph.path?.split("/");
  const heading = parts?.[parts.length - 1] ?? "Index";
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
      </body>
    </html>`;
  return html.trim();
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
      const [lhs, rhs] = previous.split("=");
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
