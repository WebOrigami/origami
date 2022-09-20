import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function setDeep(target, source) {
  const targetGraph = ExplorableGraph.from(target);
  const sourceGraph = ExplorableGraph.from(source);
  await applyUpdates(sourceGraph, targetGraph);
}

// Apply all updates from the source to the target.
async function applyUpdates(source, target) {
  // Fire off requests to update all keys, then wait for all of them to finish.
  const promises = [];
  for await (const key of source) {
    const updateKeyPromise = applyUpdateForKey(source, target, key);
    promises.push(updateKeyPromise);
  }
  return Promise.all(promises);
}

// Copy the value for the given key from the source to the target.
async function applyUpdateForKey(source, target, key) {
  const sourceValue = await source.get(key);
  if (ExplorableGraph.isExplorable(sourceValue)) {
    const targetValue = await target.get(key);
    if (ExplorableGraph.isExplorable(targetValue)) {
      // Both source and target are explorable; recurse.
      await applyUpdates(sourceValue, targetValue);
      return;
    }
  }

  // Copy the value from the source to the target.
  await target.set(key, sourceValue);
}

setDeep.usage = `setDeep <target>, <source>\tApplies the source graph to the target`;
setDeep.documentation = "https://explorablegraph.org/cli/builtins.html#setDeep";
