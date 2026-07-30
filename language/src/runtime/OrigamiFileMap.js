import { FileMap, trailingSlash } from "@weborigami/async-tree";
import SyncCacheTransform from "../cache/SyncCacheTransform.js";
import EventTargetMixin from "./EventTargetMixin.js";
import HandleExtensionsTransform from "./HandleExtensionsTransform.js";
import ImportModulesMixin from "./ImportModulesMixin.js";
import WatchFilesMixin from "./WatchFilesMixin.js";
import { cachePathSymbol, noCacheSymbol } from "./symbols.js";

export default class OrigamiFileMap extends SyncCacheTransform(
  HandleExtensionsTransform(
    ImportModulesMixin(WatchFilesMixin(EventTargetMixin(FileMap))),
  ),
) {
  get [cachePathSymbol]() {
    return this.path;
  }

  // Workaround to register file paths in the system cache without trailing
  // slahes. This is so that if someone calls `get("site.ori/")`, the cache path
  // will be "site.ori". It's not clear whether this is the best solution, but
  // hopefully suffices for now.
  cachePathForKey(key) {
    const normalized = trailingSlash.remove(key);
    return super.cachePathForKey(normalized);
  }

  globals = null;

  // Don't cache files, just record their dependencies. The OS already caches
  // files, so caching them just consumes memory and may slow things down.
  [noCacheSymbol] = true;
}
