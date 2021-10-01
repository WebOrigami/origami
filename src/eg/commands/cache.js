import Cache from "../../common/Cache.js";

export default async function cacheCommand(cache, ...graphs) {
  return new Cache(cache, ...graphs);
}

cacheCommand.usage = `cache(cache, ...graphs)\tCaches graph values in a storable cache`;
