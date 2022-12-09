import Cache from "../common/Cache.js";

export default async function cacheCommand(graph, cache, filter) {
  const result = new Cache(graph, cache, filter);
  result.scope = this;
  return result;
}

cacheCommand.usage = `cache <cache>, <...graphs>\tCaches graph values in a storable cache`;
cacheCommand.documentation = "https://graphorigami.org/cli/builtins.html#cache";
