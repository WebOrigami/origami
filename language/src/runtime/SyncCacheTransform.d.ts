import { Mixin } from "../../index.ts";

declare const SyncCacheTransform: Mixin<{
  get cachePath(): string;
  cachePathForKey(key: string): string;
}>

export default SyncCacheTransform;
