import ExplorableGraph from "../core/ExplorableGraph.js";
import SiteGraph from "../core/SiteGraph.js";

export default async function https(domain, ...keys) {
  const site = new SiteGraph(`https://${domain}`);
  return ExplorableGraph.traverse(site, ...keys);
}

https.usage = `https <domain>, <...keys>\tA web resource via HTTPS`;
https.documentation = "https://explorablegraph.org/cli/builtins.html#https";
