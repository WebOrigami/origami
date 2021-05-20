import { isExplorable } from "../core/utilities.js";

export default async function defaultIndexHtml() {
  const links = [];
  for await (const key of this) {
    // Skip keys that start with a "." (like .keys.json) or a ":" (wildcard
    // character). Also skip adding a link to the index.html page itself.
    if (!key.startsWith(".") && !key.startsWith(":") && key !== "index.html") {
      const value = await this.get(key);
      const href = isExplorable(value) ? `${key}/` : key;
      const link = `<li><a href="${href}">${href}</a></li>`;
      links.push(link);
    }
  }
  const heading = this.path ? `${this.path}` : `Index`;
  const list = `
    <h1>${heading}</h1>
    <ul>\n${links.join("\n")}\n</ul>
  `;
  return list;
}
