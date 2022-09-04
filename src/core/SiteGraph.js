import fetch from "node-fetch";

const keys = Symbol("keys");

export default class SiteGraph {
  constructor(url = window?.location.href) {
    if (url?.startsWith(".") && window?.location !== undefined) {
      // URL represents a relative path; concatenate with current location.
      this.url = new URL(url, window.location.href).href;
    } else {
      this.url = url;
    }
    this[keys] = null;
  }

  async *[Symbol.asyncIterator]() {
    if (!this[keys]) {
      const href = new URL(".keys.json", this.url).href;
      const response = await fetch(href);
      if (response.ok) {
        const text = await response.text();
        try {
          this[keys] = text ? JSON.parse(text) : [];
        } catch (error) {
          // Got a response, but it's not JSON. Most likely the site doesn't
          // actually have a .keys.json file, and is returning a Not Found page,
          // but hasn't set the correct 404 status code.
          this[keys] = [];
        }
      } else {
        this[keys] = [];
      }
    }
    yield* this[keys];
  }

  async get(key) {
    return this.traverse(key);
  }

  async traverse(...keys) {
    if (keys.length === 0) {
      return this;
    }
    const route = keys.join("/");
    const href = new URL(route, this.url).href;
    if (href.endsWith("/")) {
      // Explorable route
      return new SiteGraph(href);
    } else {
      // Fetch the data at the given endpoint.
      const response = await fetch(href);
      if (!response.ok) {
        return undefined;
      }

      if (response.redirected && response.url.endsWith("/")) {
        // Redirected to another explorable location.
        return Reflect.construct(this.constructor, [response.url]);
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
