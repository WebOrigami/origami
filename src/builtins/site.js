import SiteGraph from "../core/SiteGraph.js";

export default async function site(domain, ...keys) {
  let url = [domain, ...keys].join("/");
  if (!url.endsWith("/")) {
    url += "/";
  }
  return new SiteGraph(`https://${url}`);
}

site.usage = `site <domain>, <...keys>\tA web site graph`;
site.documentation = "https://explorablegraph.org/cli/builtins.html#site";
