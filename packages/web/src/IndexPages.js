import {
  AsyncExplorable,
  asyncGet,
  asyncKeys,
  asyncOps,
} from "@explorablegraph/core";

export default class IndexPages extends AsyncExplorable {
  constructor(inner) {
    super();
    this.inner = new AsyncExplorable(inner);
  }

  async *[asyncKeys]() {
    // Add "index.html" to the inner's keys if not already there.
    const base = await asyncOps.keys(this.inner);
    const keys = [...base];

    if (!keys.includes("index.html")) {
      // Inner doesn't define "index.html" yet; add it to the beginning.
      keys.unshift("index.html");
    }

    yield* keys;
  }

  async [asyncGet](...keys) {
    const value = await this.inner[asyncGet](...keys);

    let indexParent;
    if (value instanceof AsyncExplorable) {
      // Value is explorable, implicitly return an index for it.
      indexParent = value;
    } else if (keys[keys.length - 1] === "index.html" && value === undefined) {
      // Last key was explicitly "index.html", and the inner graph doesn't have a value
      // for it, return an index for the parent.
      const route = keys.slice(0, keys.length - 1);
      indexParent =
        route.length === 0 ? this.inner : await this.inner[asyncGet](...route);
    }

    // In either of the above cases, return an index.
    if (indexParent) {
      return await defaultIndexPage(indexParent);
    }

    // No work for us to do.
    return value;
  }
}

async function defaultIndexPage(graph) {
  const links = [];
  for await (const key of graph) {
    const value = await graph[asyncGet](key);
    const href = value instanceof AsyncExplorable ? `${key}/` : key;
    const link = `<li><a href="${href}">${href}</a></li>`;
    links.push(link);
  }
  const list = `<ul>\n${links.join("\n")}\n</ul>`;
  return list;
}
