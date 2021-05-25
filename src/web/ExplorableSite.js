import fetch from "./fetch.js";

export default class ExplorableSite {
  #keysPromise;

  constructor(url) {
    this.url = url;
    this.#keysPromise = null;
  }

  async *[Symbol.asyncIterator]() {
    if (!this.#keysPromise) {
      const href = new URL(".keys.json", this.url).href;
      this.#keysPromise = fetch(href);
    }
    const buffer = await this.#keysPromise;
    const text = String(buffer);
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
      // Fetch the data at the given endpoint.
      const buffer = await fetch(href);
      return buffer;
    }
  }
}
