import SiteGraph from "../core/SiteGraph.js";

export default async function graphHttps(host, ...keys) {
  let href = [host, ...keys].join("/");
  if (!href.startsWith("https") || !href.startsWith("http")) {
    if (!href.startsWith("//")) {
      href = `//${href}`;
    }
    if (!href.startsWith("http")) {
      href = `https:${href}`;
    }
  }
  if (!href.endsWith("/")) {
    href += "/";
  }
  return new SiteGraph(href);
}

graphHttps.usage = `@graphHttps <domain>, <...keys>\tA web site graph via HTTPS`;
graphHttps.documentation = "https://graphorigami.org/language/@graphHttps.html";
