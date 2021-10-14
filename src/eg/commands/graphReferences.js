import MetaGraph from "../../common/MetaGraph.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function graphReferences(links) {
  const graph = ExplorableGraph.from(links);
  const meta = new MetaGraph(graph, this.graph);
  // TODO: Once the server can process explorable values with .json keys into
  // JSON, can just return the meta graph instead of having to put it in JSON
  // ourselves.
  const plain = await ExplorableGraph.plain(meta);
  return plain;
}

graphReferences.usage = `graphReferences(data)\tExpand "$graph/" references in the data values`;
