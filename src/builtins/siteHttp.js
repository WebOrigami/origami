import SiteGraph from "../core/SiteGraph.js";

export default async function siteHttp(host, ...keys) {
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

siteHttp.usage = `siteHttp <domain>, <...keys>\tA web site graph via HTTP`;
siteHttp.documentation = "https://graphorigami.org/cli/builtins.html#siteHttp";
