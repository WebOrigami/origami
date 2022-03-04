import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function copy(source, target) {
  const sourceGraph = ExplorableGraph.from(source);
  /** @type {any} */ const targetGraph = ExplorableGraph.from(target);
  await targetGraph.set(sourceGraph);
}

copy.usage = `copy <source>, <target>\tCopies the source graph to the target`;
copy.documentation = "https://explorablegraph.org/pika/builtins.html#copy";
