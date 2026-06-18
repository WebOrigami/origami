import { Mixin } from "../../index.ts";

declare const SyncCacheTransform: Mixin<{
  cachePathForKey(key: string): string;
  onKeysChange(key: string): void;
  onValueChange(key: string): void;
}>

export default SyncCacheTransform;
