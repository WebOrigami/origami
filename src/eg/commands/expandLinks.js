import MetaGraph from "../../common/MetaGraph.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function expandLinks(links) {
  const meta = new MetaGraph(links, this);
  const plain = await ExplorableGraph.plain(meta);
  return plain;
}

expandLinks.usage = `expandLinks(data)\tExpand "$graph/" links in the data values`;
