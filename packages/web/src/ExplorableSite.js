import { asyncGet, asyncKeys } from "@explorablegraph/symbols";
import fetch from "node-fetch";

export default class ExplorableSite {
  constructor(url) {
    this.url = url;
    this.keysPromise = null;
  }

  async *[asyncKeys]() {
    if (!this.keysPromise) {
      const href = new URL(".keys.json", this.url).href;
      this.keysPromise = fetch(href);
    }
    const response = await this.keysPromise;
    const text = await response.text();
    const keys = text ? JSON.parse(String(text)) : [];
    yield* keys;
  }

  async [asyncGet](...keys) {
    const route = keys.join("/");
    const href = new URL(route, this.url).href;
    if (href.endsWith("/")) {
      // Explorable route
      return new ExplorableSite(href);
    } else {
      // Return the page contents.
      const response = await fetch(href);
      const text = await response.text();
      return text;
    }
  }
}
