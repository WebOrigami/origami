import GlobGraph from "../common/GlobGraph.js";

export default async function globs(graph) {
  const result = new GlobGraph(graph);
  result.scope = this;
  return result;
}

globs.usage = `globs <patterns>\tDefine a graph whose keys are globs`;
globs.documentation = "https://graphorigami.org/cli/builtins.html#globs";
