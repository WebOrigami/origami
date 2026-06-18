import { Mixin } from "../../index.ts";

declare const AsyncCacheTransform: Mixin<{
  cachePathForKey(key: string): string;
  onKeysChange(key: string): void;
  onValueChange(key: string): void;
}>

export default AsyncCacheTransform;
