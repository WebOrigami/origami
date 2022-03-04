import Cache from "../../common/Cache.js";

export default async function cacheCommand(cache, graph, filter) {
  return new Cache(cache, graph, filter);
}

cacheCommand.usage = `cache <cache>, <...graphs>\tCaches graph values in a storable cache`;
cacheCommand.documentation =
  "https://explorablegraph.org/pika/builtins.html#cache";
