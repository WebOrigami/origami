import { ExplorableGraph, WildcardKeysMixin } from "../../core/exports.js";
import {
  Files,
  VirtualKeysMixin,
  VirtualValuesMixin,
} from "../../node/exports.js";

const INDEX_HTML = "index.html";

// DefaultPagesMixin(Files) so that DefaultPagesMixin can respect real index.html

// DefaultPagesMixin(VirtualKeys(...)) so that VirtualKeys can provide keys to index.html

// WildcardKeysMixin(DefaultPagesMixin(...)) so that DefaultPagesMixin can provide index.html
// without triggering :notFound wildcard

// BUT
// DefaultPagesMixin(WildcardKeysMixin(...)) so that WildcardKeysMixin can
// define an wildcard like :products/index.html.

// DefaultPagesMixin(VirtualFiles(...)) so that VirtualFiles can generate a dynamic index.html

// WildcardKeysMixin(VirtualFiles(...)) so that VirtualFiles can generate a wildcard function
// that WildcardKeysMixin can resolve

export default class ExplorableApp extends ExplorableGraph {
  constructor(dirname) {
    super();
    class Graph extends WildcardKeysMixin(
      VirtualKeysMixin(VirtualValuesMixin(Files))
    ) {}
    this.graph = new Graph(dirname);
  }

  async *[Symbol.asyncIterator]() {
    // Add "index.html" to the inner's keys if not already there.
    let definesIndexHtmlKey = false;
    for await (const key of this.graph[Symbol.asyncIterator]()) {
      if (key === INDEX_HTML) {
        definesIndexHtmlKey = true;
      }
      yield key;
    }

    if (!definesIndexHtmlKey) {
      // Base class doesn't define "index.html" yet.
      yield INDEX_HTML;
    }
  }

  async get(...keys) {
    const value = await this.graph.get(...keys);

    if (value !== undefined) {
      return value;
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey === INDEX_HTML) {
      // Last key was explicitly "index.html", and that point in the graph
      // doesn't have an index. Generate one.
      const route = keys.slice(0, keys.length - 1);
      const graph =
        route.length === 0 ? this.graph : await this.graph.get(...route);
      return await defaultIndexHtml(graph);
    }

    return undefined;
  }
}

async function defaultIndexHtml(graph) {
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
