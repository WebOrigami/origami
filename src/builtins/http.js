import fetch from "node-fetch";
import ExplorableGraph from "../core/ExplorableGraph.js";
import SiteGraph from "../core/SiteGraph.js";

export default async function http(domain, ...keys) {
  if (keys.length > 0 && keys[keys.length - 1] === undefined) {
    const site = new SiteGraph(`http://${domain}`);
    return ExplorableGraph.traverse(site, ...keys);
  } else {
    const url = ["http:/", domain, ...keys].join("/");
    const response = await fetch(url);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    }
  }
}

http.usage = `http <domain>, <...keys>\tA web resource via HTTP`;
http.documentation = "http://explorablegraph.org/cli/builtins.html#http";
