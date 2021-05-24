import Cache from "../../common/Cache.js";

export default async function cacheCommand(cache, ...graphs) {
  return new Cache(cache, ...graphs);
}

cache.usage = `Cache(cache, ...graphs)\tCaches graph values in a storable cache`;
