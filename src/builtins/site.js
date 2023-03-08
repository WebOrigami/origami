import SiteGraph from "../core/SiteGraph.js";

export default async function site(host, ...keys) {
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

site.usage = `site <domain>, <...keys>\tA web site graph via HTTPS`;
site.documentation = "https://graphorigami.org/cli/builtins.html#site";
