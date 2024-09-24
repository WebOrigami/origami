import SiteTree from "./SiteTree.js";

export default class OpenSiteTree extends SiteTree {
  constructor(...args) {
    super(...args);
    this.serverKeysPromise = undefined;
  }

  async getServerKeys() {
    // We use a promise to ensure we only check for keys once.
    const href = new URL(".keys.json", this.href).href;
    this.serverKeysPromise ??= fetch(href)
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
    return this.serverKeysPromise;
  }

  async keys() {
    const serverKeys = await this.getServerKeys();
    return serverKeys ?? [];
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
