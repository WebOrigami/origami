import ExplorableGraph from "../../core/ExplorableGraph.js";
import ExplorableSite from "../../core/ExplorableSite.js";

export default async function https(domain, ...keys) {
  const site = new ExplorableSite(`https://${domain}`);
  return await ExplorableGraph.traverse(site, ...keys);
}

https.usage = `https(domain, ...keys)\tA web resource via HTTPS`;
