import MetaGraph from "../../common/MetaGraph.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function graphReferences(links) {
  const meta = new MetaGraph(links, this);
  const plain = await ExplorableGraph.plain(meta);
  return plain;
}

graphReferences.usage = `graphReferences(data)\tExpand "$graph/" references in the data values`;
