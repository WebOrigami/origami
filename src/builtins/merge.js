import MergeGraph from "../common/MergeGraph.js";

export default async function merge(...graphs) {
  return new MergeGraph(...graphs);
}

merge.usage = `merge <...graphs>\tMerge the given graphs`;
merge.documentation = "https://graphorigami.org/cli/builtins.html#merge";
