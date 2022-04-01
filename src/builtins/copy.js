import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function copy(source, target) {
  // const start = performance.now();
  const sourceGraph = ExplorableGraph.from(source);
  /** @type {any} */ const targetGraph = ExplorableGraph.from(target);
  await targetGraph.set(sourceGraph);
  // const end = performance.now();
  // console.log(`copy time in ms: ${end - start}`);
}

copy.usage = `copy <source>, <target>\tCopies the source graph to the target`;
copy.documentation = "https://explorablegraph.org/cli/builtins.html#copy";
