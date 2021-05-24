import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function defaultIndexHtml() {
  // @ts-ignore
  const graph = this;
  const links = [];
  for await (const key of graph) {
    // Skip keys that start with a "." (like .keys.json) or a ":" (wildcard
    // character). Also skip adding a link to the index.html page itself.
    if (!key.startsWith(".") && !key.startsWith(":") && key !== "index.html") {
      const value = await graph.get(key);
      const href = value instanceof ExplorableGraph ? `${key}/` : key;
      const link = `<li><a href="${href}">${href}</a></li>`;
      links.push(link);
    }
  }
  const heading = graph.path ? `${graph.path}` : `Index`;
  const list = `
    <h1>${heading}</h1>
    <ul>\n${links.join("\n")}\n</ul>
  `;
  return list;
}
