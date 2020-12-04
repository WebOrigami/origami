import { asyncKeys, Transform } from "@explorablegraph/core";

export default class IndexPages extends Transform {
  async *[asyncKeys]() {
    // Add "index.html" to the inner's keys if not already there.
    const keys = [...(await super[asyncKeys]())];

    if (!keys.includes("index.html")) {
      // Inner doesn't define "index.html" yet; add it to the beginning.
      keys.push("index.html");
    }

    yield* keys;
  }

  // async [asyncGet](key, ...rest) {
  //   if (key === "index.html") {
  //     const indexPage = await this.inner[asyncGet]('index.html');
  //     if (indexPage) {
  //       // Inner already defines index.html, return that;

  //     }
  //     if (!indexPage) {
  //       // Inner doesn't define "index.html", so we'll define it.
  //       yield "index.html"
  //     }

  //   }
  //   const keys = await asyncOps.keys(graph);
  //   const links = keys.map((key) => `<li><a href="${key}">${key}</a></li>`);
  //   return links;
  // }
}
