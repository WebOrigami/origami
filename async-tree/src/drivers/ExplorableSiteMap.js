import SiteMap from "./SiteMap.js";

/**
 * A [SiteMap](SiteMap.html) that implements the [JSON Keys](jsonKeys.html)
 * protocol. This enables a `keys()` method that can return the keys of a site
 * route even though such a mechanism is not built into the HTTP protocol.
 */
export default class ExplorableSiteMap extends SiteMap {
  /**
   * @param {string} href
   */
  constructor(href) {
    super(href);
    this.serverKeysPromise = undefined;
  }

  /**
   * @returns {Promise<string[]>}
   */
  async getServerKeys() {
    // We use a promise to ensure we only check for keys once.
    const href = new URL(".keys.json", this.href).href;
    this.serverKeysPromise ??= fetch(href)
      .then((response) => (response.ok ? response.text() : null))
      .then((text) => {
        try {
          return text ? JSON.parse(text) : [];
        } catch (error) {
          // Got a response, but it's not JSON. Most likely the site doesn't
          // actually have a .keys.json file, and is returning a Not Found page,
          // but hasn't set the correct 404 status code.
          return [];
        }
      });
    return this.serverKeysPromise;
  }

  /**
   * Returns the keys of the site route. For this to work, the route must have a
   * `.keys.json` file that contains a JSON array of string keys.
   */
  async keys() {
    const serverKeys = await this.getServerKeys();
    return serverKeys[Symbol.iterator]();
  }

  processResponse(response) {
    // If the response was redirected to a route that ends with a slash, and the
    // site is an explorable site, we return a tree for the new route.
    if (response.ok && response.redirected && response.url.endsWith("/")) {
      return Reflect.construct(this.constructor, [response.url]);
    }

    return super.processResponse(response);
  }
}
