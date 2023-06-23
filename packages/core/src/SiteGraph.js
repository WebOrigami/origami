/**
 * An HTTP/HTTPS site as a graph of ArrayBuffers.
 *
 * @typedef {import("@graphorigami/types").AsyncGraph} AsyncGraph
 * @implements {AsyncGraph}
 */
export default class SiteGraph {
  /**
   * @param {string} href
   */
  constructor(href = window?.location.href) {
    if (href?.startsWith(".") && window?.location !== undefined) {
      // URL represents a relative path; concatenate with current location.
      this.href = new URL(href, window.location.href).href;
    } else {
      this.href = href;
    }
    this.keysPromise = undefined;
  }

  async get(key) {
    return this.traverse(key);
  }

  async getKeys() {
    // We use a promise to ensure we only check for keys once.
    if (this.keysPromise) {
      return this.keysPromise;
    }

    const href = new URL(".keys.json", this.href).href;
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

  async hasKeysJson() {
    const keys = await this.getKeys();
    return keys !== null;
  }

  async keys() {
    return (await this.getKeys()) ?? [];
  }

  async traverse(...keys) {
    if (keys.length === 0) {
      return this;
    }

    // The route is a slash-separated concatenation of the keys. One case we may
    // see is the last key being `undefined`, which indicates a trailing slash.
    // As it happens, join() will correctly handle that case, treating undefined
    // as an empty string.
    let route = keys.join("/");

    // If there is only one key and it's undefined, and the site is explorable,
    // we take the route as "index.html". With this and subsequent checks, we
    // try to avoid sniffing the site to see if it's explorable, as that
    // necessitates an extra network request per SiteGraph instance. In many
    // cases, that can be avoided.
    if (route === "" && (await this.hasKeysJson())) {
      route = "index.html";
    }

    const href = new URL(route, this.href).href;

    // If the (possibly adjusted) route ends with a slash and the site is an
    // explorable site, we return a graph for the indicated route.
    if (href.endsWith("/") && (await this.hasKeysJson())) {
      return Reflect.construct(this.constructor, [href]);
    }

    // Fetch the data at the given route.
    const response = await fetch(href);
    if (!response.ok) {
      return undefined;
    }

    if (response.redirected && response.url.endsWith("/")) {
      // If the response is redirected to a route that ends with a slash, and
      // the site is an explorable site, we return a graph for the new route.
      if (await this.hasKeysJson()) {
        return Reflect.construct(this.constructor, [response.url]);
      }
    }

    const buffer = await response.arrayBuffer();
    if (buffer instanceof ArrayBuffer) {
      // Patch the ArrayBuffer to give it a more useful toString that decodes
      // the buffer as UTF-8, like Node's Buffer class does.
      buffer.toString = function () {
        return new TextDecoder().decode(this);
      };
    }

    return buffer;
  }
}
