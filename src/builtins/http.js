import ExplorableGraph from "../core/ExplorableGraph.js";
import SiteGraph from "../core/SiteGraph.js";

export default async function http(domain, ...keys) {
  const site = new SiteGraph(`http://${domain}`);
  return ExplorableGraph.traverse(site, ...keys);
}

http.usage = `http <domain>, <...keys>\tA web resource via HTTP`;
http.documentation = "https://explorablegraph.org/cli/builtins.html#http";
