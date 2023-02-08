import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function fromJson(text) {
  return text ? ExplorableGraph.fromJson(text) : undefined;
}

fromJson.usage = `fromJson <text>\tParse text as JSON`;
fromJson.documentation = "https://graphorigami.org/cli/builtins.html#fromJson";
