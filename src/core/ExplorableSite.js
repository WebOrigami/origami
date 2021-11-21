import fetch from "node-fetch";
import { constructSubgraph } from "./utilities.js";

const keysPromise = Symbol("keysPromise");

export default class ExplorableSite {
  constructor(url = window?.location.href) {
    if (url?.startsWith(".") && window?.location !== undefined) {
      // URL represents a relative path; concatenate with current location.
      this.url = new URL(url, window.location.href).href;
    } else {
      this.url = url;
    }
    this[keysPromise] = null;
  }

  async *[Symbol.asyncIterator]() {
    if (!this[keysPromise]) {
      const href = new URL(".keys.json", this.url).href;
      this[keysPromise] = fetch(href);
    }
    const response = await this[keysPromise];
    if (response.ok) {
      const text = await response.text();
      const keys = text ? JSON.parse(text) : [];
      yield* keys;
    } else {
      yield* [];
    }
  }

  constructSubgraph(key, dictionary) {
    return constructSubgraph(this.constructor, dictionary);
  }

  async get(...keys) {
    if (keys.length === 0) {
      return this;
    }
    const route = keys.join("/");
    const href = new URL(route, this.url).href;
    if (href.endsWith("/")) {
      // Explorable route
      return new ExplorableSite(href);
    } else {
      // Fetch the data at the given endpoint.
      const response = await fetch(href);
      if (!response.ok) {
        return undefined;
      }

      if (response.redirected && response.url.endsWith("/")) {
        // Redirected to another explorable location.
        const key = keys[keys.length - 1];
        return this.constructSubgraph(key, { url: response.url });
      }

      let buffer = await response.arrayBuffer();
      // if (buffer instanceof ArrayBuffer) {
      //   // Patch the ArrayBuffer to give it more useful toString that decodes
      //   // the buffer as UTF-8, like Node's Buffer class does.
      //   buffer.toString = function () {
      //     return new TextDecoder().decode(this);
      //   };
      // }

      // HACK: Use Node Buffer everywhere for now.
      if (buffer instanceof ArrayBuffer) {
        buffer = Buffer.from(buffer);
      }

      return buffer;
    }
  }
}
