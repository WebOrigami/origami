import { ExplorableGraph } from "../../core/exports.js";

const INDEX_HTML = "index.html";
const KEYS_JSON = ".keys.json";

export default function DefaultPagesMixin(Base) {
  return class DefaultPages extends Base {
    async *[Symbol.asyncIterator]() {
      // Add "index.html" to the inner's keys if not already there.
      let definesIndexHtmlKey = false;
      for await (const key of super[Symbol.asyncIterator]()) {
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
      const value = await super.get(...keys);

      if (value instanceof ExplorableGraph) {
        return value;
      }

      const lastKey = keys[keys.length - 1];
      if (value === undefined && lastKey === INDEX_HTML) {
        // Last key was explicitly "index.html", and that point in the graph
        // doesn't have an index. Generate one.
        const route = keys.slice(0, keys.length - 1);
        const graph =
          route.length === 0 ? this : await super.get(...route);
        return await defaultIndexHtml(graph);
      }

      // if (lastKey === KEYS_JSON && value === undefined) {
      //   // Return default .keys.json page.
      //   const route = keys.slice(0, keys.length - 1);
      //   const parent =
      //     route.length === 0 ? super : await super.get(...route);
      //   return await defaultKeysJson(parent);
      // }

      // No work for us to do.
      return value;
    }

    static isDefaultPage(key) {
      return key === INDEX_HTML || key === KEYS_JSON;
    }
  };
}

// TODO: This and default index.html both need to get each key, which is too
// inefficient for real use.
async function defaultKeysJson(graph) {
  const keys = [];
  for await (const key of graph) {
    const value = await graph.get(key);
    const text = value instanceof ExplorableGraph ? `${key}/` : key;
    keys.push(text);
  }
  if (!keys.includes(INDEX_HTML)) {
    // Since we're going to define it, we include index.html in the keys.
    keys.unshift(INDEX_HTML);
  }
  return JSON.stringify(keys, null, 2);
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
