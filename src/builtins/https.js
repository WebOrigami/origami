import fetch from "node-fetch";
import ExplorableGraph from "../core/ExplorableGraph.js";
import SiteGraph from "../core/SiteGraph.js";

export default async function https(domain, ...keys) {
  if (keys.length > 0 && keys[keys.length - 1] === undefined) {
    const site = new SiteGraph(`https://${domain}`);
    return ExplorableGraph.traverse(site, ...keys);
  } else {
    const url = ["https:/", domain, ...keys].join("/");
    const response = await fetch(url);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    }
  }
}

https.usage = `https <domain>, <...keys>\tA web resource via HTTPS`;
https.documentation = "https://explorablegraph.org/cli/builtins.html#https";
