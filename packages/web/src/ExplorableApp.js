import {
  DefaultValues,
  ExplorableGraph,
  WildcardKeysMixin,
} from "../../core/exports.js";
import {
  Files,
  VirtualKeysMixin,
  VirtualValuesMixin,
} from "../../node/exports.js";

class AppGraph extends WildcardKeysMixin(
  VirtualKeysMixin(VirtualValuesMixin(Files))
) {}

export default class ExplorableApp extends DefaultValues {
  constructor(dirname) {
    const main = new AppGraph(dirname);
    const defaults = {
      "index.html": defaultIndexHtml,
    };
    super(main, defaults);
  }
}

async function defaultIndexHtml() {
  const links = [];
  for await (const key of this) {
    // Skip keys that start with a "." (like .keys.json) or a ":" (wildcard
    // character). Also skip adding a link to the index.html page itself.
    if (!key.startsWith(".") && !key.startsWith(":") && key !== "index.html") {
      const value = await this.get(key);
      const href = value instanceof ExplorableGraph ? `${key}/` : key;
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
