import fetch from "node-fetch";

export default class SiteGraph {
  constructor(url = window?.location.href) {
    if (url?.startsWith(".") && window?.location !== undefined) {
      // URL represents a relative path; concatenate with current location.
      this.url = new URL(url, window.location.href).href;
    } else {
      this.url = url;
    }
    this.keysPromise = undefined;
  }

  async *[Symbol.asyncIterator]() {
    const keys = await this.getKeys();
    yield* keys ?? [];
  }

  async get(key) {
    return this.traverse(key);
  }

  async getKeys() {
    // We use a promise to ensure we only check for keys once.
    if (this.keysPromise) {
      return this.keysPromise;
    }

    const href = new URL(".keys.json", this.url).href;
    this.keysPromise = fetch(href)
      .then((response) => (response.ok ? response.text() : null))
      .then((text) => {
        try {
          return text ? JSON.parse(text) : null;
        } catch (error) {
          // Got a response, but it's not JSON. Most likely the site doesn't
          // actually have a .keys.json file, and is returning a Not Found page,
          // but hasn't set the correct 404 status code.
          return null;
        }
      });

    return this.keysPromise;
  }

  async isExplorableSite() {
    const keys = await this.getKeys();
    return keys !== null;
  }

  async traverse(...keys) {
    if (keys.length === 0) {
      return this;
    }

    // The route is a slash-separated concatenation of the keys. One case we may
    // see is the last key being `undefined`, which indicates a trailing slash.
    // As it happens, join() will correctly handle that case, treating undefined
    // as an empty string.
    const route = keys.join("/");
    const href = new URL(route, this.url).href;

    if (href.endsWith("/")) {
      // If the site is an explorable site, and the route ends with a slash, we
      // return a graph for the indicated route.
      if (await this.isExplorableSite()) {
        return Reflect.construct(this.constructor, [href]);
      }
    }

    // Fetch the data at the given route.
    const response = await fetch(href);
    if (!response.ok) {
      return undefined;
    }

    if (response.redirected && response.url.endsWith("/")) {
      // If the response is redirected to a route that ends with a slash, and
      // the site is an explorable site, we return a graph for the new route.
      if (await this.isExplorableSite()) {
        return Reflect.construct(this.constructor, [response.url]);
      }
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
