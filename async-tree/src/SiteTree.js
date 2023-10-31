import * as Tree from "./Tree.js";
import * as keysJson from "./keysJson.js";

/**
 * An HTTP/HTTPS site as a tree of ArrayBuffers.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class SiteTree {
  /**
   * @param {string} href
   */
  constructor(href = window?.location.href) {
    if (href?.startsWith(".") && window?.location !== undefined) {
      // URL represents a relative path; concatenate with current location.
      href = new URL(href, window.location.href).href;
    }

    if (!href.endsWith("/")) {
      // Add trailing slash; the URL is expected to represent a directory.
      href += "/";
    }

    this.href = href;
    this.keysPromise = undefined;
    this.parent = null;
  }

  async get(key) {
    // If there is only one key and it's the empty string, and the site is
    // explorable, we take the route as "index.html". With this and subsequent
    // checks, we try to avoid sniffing the site to see if it's explorable, as
    // that necessitates an extra network request per SiteTree instance. In many
    // cases, that can be avoided.
    if (key === "" && (await this.hasKeysJson())) {
      key = "index.html";
    }

    const href = new URL(key, this.href).href;

    // If the (possibly adjusted) route ends with a slash and the site is an
    // explorable site, we return a tree for the indicated route.
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
      // the site is an explorable site, we return a tree for the new route.
      if (await this.hasKeysJson()) {
        return Reflect.construct(this.constructor, [response.url]);
      }
    }

    return response.arrayBuffer();
  }

  async getKeyDictionary() {
    // We use a promise to ensure we only check for keys once.
    const href = new URL(".keys.json", this.href).href;
    this.keysPromise ??= fetch(href)
      .then((response) => (response.ok ? response.text() : null))
      .then((text) => {
        try {
          return text ? keysJson.parse(text) : null;
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
    const keyDictionary = await this.getKeyDictionary();
    return keyDictionary !== null;
  }

  async isKeyForSubtree(key) {
    const keyDictionary = await this.getKeyDictionary();
    if (keyDictionary) {
      return keyDictionary[key];
    } else {
      // Expensive check, since this fetches the key's value.
      const value = await this.get(key);
      return Tree.isAsyncTree(value);
    }
  }

  async keys() {
    const keyDictionary = await this.getKeyDictionary();
    return keyDictionary ? Object.keys(keyDictionary) : [];
  }

  /**
   * Returns a new `SiteTree` for the given relative route.
   *
   * @param {string} path
   * @returns {SiteTree}
   */
  resolve(path) {
    const href = new URL(path, this.href).href;
    return Reflect.construct(this.constructor, [href]);
  }
}
