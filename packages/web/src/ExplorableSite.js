import { asyncKeys } from "@explorablegraph/symbols";
import fetch from "node-fetch";

let keysPromise;

export default class ExplorableSite extends Graph {
  constructor(url) {
    super();
    this.url = url;
  }

  async *[asyncKeys]() {
    if (!keysPromise) {
      const href = new URL(`/.keys.json`, this.url).href;
      keysPromise = fetch(href);
    }
    const data = await keysPromise;
    const keys = data ? JSON.parse(String(data)) : [];
    yield* keys;
  }

  async get(...keys) {
    const route = keys.join("/");
    const href = new URL(route, this.url).href;
    return await fetch(href);
  }
}
