import SiteGraph from "../core/SiteGraph.js";

export default async function site(domain, ...keys) {
  let url = [domain, ...keys].join("/");
  if (!url.startsWith("https")) {
    url = `https://${url}`;
  }
  if (!url.endsWith("/")) {
    url += "/";
  }
  return new SiteGraph(url);
}

site.usage = `site <domain>, <...keys>\tA web site graph`;
site.documentation = "https://graphorigami.org/cli/builtins.html#site";
