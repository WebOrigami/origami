import ExplorableGraph from "../core/ExplorableGraph.js";
import { toSerializable } from "../core/utilities.js";

export default async function defaultYamlHtml() {
  // @ts-ignore
  const graph = this;
  const boxes = await box(graph);
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          pre {
            margin: 0;
          }
          
          .value {
            box-sizing: border-box;
            background: rgba(128,128,128,.05);
          }
        </style>
      </head>
      <body>
        ${boxes}
      </body>
    </html>`;
  return html.trim();
}

async function box(graph, prefix = "", indentation = 0) {
  let result = "";
  for await (const key of graph) {
    const path = prefix ? `${prefix}/${key}` : key;
    let value = await graph.get(key);
    if (ExplorableGraph.isExplorable(value)) {
      value = await box(value, path, indentation + 1);
    } else {
      value = escapeHtml(toSerializable(value));
      if (value.includes("\n")) {
        value = "|\n" + indentLines(value, 2);
      }
    }
    const keyLine = indentLine(
      `<a href="${path}">${key}</a>: `,
      indentation * 2
    );
    value = indentLines(value, indentation * 2);
    result += `<pre class="box">
${keyLine}
<pre class="value">${value}</pre>
</pre`;
  }
  return result;
}

function indentLine(line, indentation) {
  return " ".repeat(indentation) + line;
}

// Indent each line in the text by the indicated amount.
function indentLines(text, indentation) {
  return text
    .split("\n")
    .map((line) => indentLine(line, indentation))
    .join("\n");
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
