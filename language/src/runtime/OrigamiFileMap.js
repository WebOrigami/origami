import { FileMap, trailingSlash } from "@weborigami/async-tree";
import EventTargetMixin from "./EventTargetMixin.js";
import HandleExtensionsTransform from "./HandleExtensionsTransform.js";
import ImportModulesMixin from "./ImportModulesMixin.js";
import SyncDependenciesTransform from "./SyncDependenciesTransform.js";
import WatchFilesMixin from "./WatchFilesMixin.js";

export default class OrigamiFileMap extends SyncDependenciesTransform(
  HandleExtensionsTransform(
    ImportModulesMixin(WatchFilesMixin(EventTargetMixin(FileMap))),
  ),
) {
  get cachePath() {
    return super.cachePath ?? this.path;
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
}
