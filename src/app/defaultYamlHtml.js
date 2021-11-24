import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function defaultYamlHtml() {
  // @ts-ignore
  const graph = this;
  // const keys = await ExplorableGraph.keys(graph);
  // const filtered = filterKeys(keys);
  // const links = [];
  // for (const key of filtered) {
  //   let link;
  //   const keyText = String(key);
  //   if (Formula.isFormula(keyText)) {
  //     const isWildcard = keyText.startsWith("{");
  //     if (isWildcard) {
  //       link = `<li class="formula wildcard"><a href="${keyText}">${keyText}</a></li>`;
  //     } else {
  //       const parts = keyText.split("=");
  //       const lhs = parts[0].trim();
  //       const rhs = parts[1].trim();
  //       link = `<li><a href="${lhs}">${lhs}</a> <span class="formula rhs"><a href="${keyText}">= ${rhs}</a></span></li>`;
  //     }
  //   } else {
  //     // Simple key.
  //     link = `<li><a href="${keyText}">${keyText}</a></li>`;
  //   }
  //   links.push(link);
  // }

  // const parts = graph.path?.split("/");
  // const heading = parts?.[parts.length - 1] ?? "Index";
  // const list = `
  //   <h1>${heading.trim()}</h1>
  //   <ul>\n${links.join("\n").trim()}\n</ul>
  // `;
  const yaml = await ExplorableGraph.toYaml(graph);
  const escaped = escapeHtml(yaml);
  const keyRegex = /\s*"?(?<key>.+)"?:/g;
  const replaced = escaped.replace(
    keyRegex,
    (match, key) => `<a href="${key}">${match}</a>`
  );
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
        <pre>${replaced}</pre>
      </body>
    </html>`;
  return html.trim();
}

// From https://stackoverflow.com/a/6234804/76472
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
      const [lhs] = previous.split("=");
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
