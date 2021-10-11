import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function copy(source, target) {
  const sourceGraph = ExplorableGraph.from(source);
  await target.set(sourceGraph);
}

copy.usage = `copy(source, target)\tCopies the source graph to the target`;
