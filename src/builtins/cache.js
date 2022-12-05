import Cache from "../common/Cache.js";

export default async function cacheCommand(graph, cache, filter) {
  return new Cache(graph, cache, filter);
}

cacheCommand.usage = `cache <cache>, <...graphs>\tCaches graph values in a storable cache`;
cacheCommand.documentation = "https://graphorigami.org/cli/builtins.html#cache";
