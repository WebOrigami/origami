import fetch from "node-fetch";
import { ExplorableGraph } from "../../core/exports.js";

export default class ExplorableSite extends ExplorableGraph {
  constructor(url) {
    super();
    this.url = url;
    this.keysPromise = null;
  }

  async *[Symbol.asyncIterator]() {
    if (!this.keysPromise) {
      const href = new URL(".keys.json", this.url).href;
      this.keysPromise = fetch(href);
    }
    const response = await this.keysPromise;
    const text = await response.text();
    const keys = text ? JSON.parse(String(text)) : [];
    yield* keys;
  }

  async get(...keys) {
    const route = keys.join("/");
    const href = new URL(route, this.url).href;
    if (href.endsWith("/")) {
      // Explorable route
      return new ExplorableSite(href);
    } else {
      // Return the page contents.
      const response = await fetch(href);
      // TODO: More robust file extension handling
      const isText = href.endsWith(".html");
      if (isText) {
        return await response.text();
      } else {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
    }
  }
}
