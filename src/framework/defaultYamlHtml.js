import StringWithGraph from "../common/StringWithGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function defaultYamlHtml() {
  // @ts-ignore
  const graph = this;
  const yaml = await ExplorableGraph.toYaml(graph);
  const escaped = escapeHtml(yaml);
  const keyRegex = /\s*"?(?<key>.+)"?:/g;
  const replaced = escaped.replace(
    keyRegex,
    (match, key) => `<a href="${key}">${match}</a>`
  );
  const html = `<!DOCTYPE html>
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
  return new StringWithGraph(html, graph);
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
