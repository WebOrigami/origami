import SiteGraph from "../core/SiteGraph.js";

export default async function siteHttp(domain, ...keys) {
  let url = [domain, ...keys].join("/");
  if (!url.startsWith("https") || !url.startsWith("http")) {
    if (!url.startsWith("//")) {
      url = `//${url}`;
    }
    if (!url.startsWith("http")) {
      url = `http:${url}`;
    }
  }
  if (!url.endsWith("/")) {
    url += "/";
  }
  return new SiteGraph(url);
}

siteHttp.usage = `siteHttp <domain>, <...keys>\tA web site graph via HTTP`;
siteHttp.documentation = "https://graphorigami.org/cli/builtins.html#siteHttp";
