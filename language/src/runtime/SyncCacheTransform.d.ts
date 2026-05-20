import { Mixin } from "../../index.ts";

declare const SyncCacheTransform: Mixin<{
  cachePath: string;
  cachePathForKey(key: string): string;
}>

export default SyncCacheTransform;
