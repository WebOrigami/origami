import { SiteGraph } from "@graphorigami/core";

export default async function graphHttp(host, ...keys) {
  let href = [host, ...keys].join("/");
  if (!href.startsWith("https") || !href.startsWith("http")) {
    if (!href.startsWith("//")) {
      href = `//${href}`;
    }
    if (!href.startsWith("http")) {
      href = `http:${href}`;
    }
  }
  if (!href.endsWith("/")) {
    href += "/";
  }
  return new SiteGraph(href);
}

graphHttp.usage = `@graphHttp <domain>, <...keys>\tA web site graph via HTTP`;
graphHttp.documentation = "https://graphorigami.org/language/@graphHttp.html";
