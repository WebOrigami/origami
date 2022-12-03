import MergeDeepGraph from "../common/MergeDeepGraph.js";

export default async function mergeDeep(...graphs) {
  return new MergeDeepGraph(...graphs);
}

mergeDeep.usage = `mergeDeep <...graphs>\tMerge the given graphs deeply`;
mergeDeep.documentation =
  "https://graphorigami.org/cli/builtins.html#mergeDeep";
