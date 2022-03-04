import ExplorableGraph from "../../core/ExplorableGraph.js";
import ExplorableSite from "../../core/ExplorableSite.js";

export default async function http(domain, ...keys) {
  const site = new ExplorableSite(`http://${domain}`);
  return await ExplorableGraph.traverse(site, ...keys);
}

http.usage = `http <domain>, <...keys>\tA web resource via HTTP`;
http.documentation = "https://explorablegraph.org/pika/builtins.html#http";
