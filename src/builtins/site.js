import SiteGraph from "../core/SiteGraph.js";

export default async function site(domain, ...keys) {
  let url = [domain, ...keys].join("/");
  if (!url.startsWith("https") || !url.startsWith("http")) {
    if (!url.startsWith("//")) {
      url = `//${url}`;
    }
    if (!url.startsWith("http")) {
      url = `https:${url}`;
    }
  }
  if (!url.endsWith("/")) {
    url += "/";
  }
  return new SiteGraph(url);
}

site.usage = `site <domain>, <...keys>\tA web site graph via HTTPS`;
site.documentation = "https://graphorigami.org/cli/builtins.html#site";
