import { constants, fetch, Graph } from "../exfn/exports.js";

let iteratorPromise;

export default class ExplorableSiteGraph extends Graph {
  constructor(url) {
    super();
    this.url = url;
  }

  async *[Symbol.asyncIterator]() {
    if (!iteratorPromise) {
      const href = new URL(`/${constants.asyncIteratorStringKey}`, this.url)
        .href;
      iteratorPromise = fetch(href);
    }
    // TODO: If page doesn't exist, then yield empty array.
    const data = await iteratorPromise;
    const keys = JSON.parse(String(data));
    yield* keys;
  }

  async get(key) {
    const href = new URL(`/${key}`, this.url).href;
    return await fetch(href);
  }
}
