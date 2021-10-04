import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function defaultIndexHtml() {
  // @ts-ignore
  const graph = this;
  const links = [];
  for await (const key of graph) {
    // Skip keys that start with a "." (like .keys.json). Also skip adding a
    // link to the index.html page itself.
    if (!key.startsWith(".") && key !== "index.html") {
      const value = await graph.get(key);
      const href = ExplorableGraph.isExplorable(value) ? `${key}/` : key;
      const link = `<li><a href="${href}">${href}</a></li>`;
      links.push(link);
    }
  }
  const heading = graph.path ? `${graph.path}` : `Index`;
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
      </head>
      <body>
        ${list.trim()}
      </body>
    </html>`;
  return html.trim();
}
