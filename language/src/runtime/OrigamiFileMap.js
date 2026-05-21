import { FileMap, trailingSlash, Tree } from "@weborigami/async-tree";
import path from "node:path";
import EventTargetMixin from "./EventTargetMixin.js";
import HandleExtensionsTransform from "./HandleExtensionsTransform.js";
import ImportModulesMixin from "./ImportModulesMixin.js";
import SyncCacheTransform from "./SyncCacheTransform.js";
import WatchFilesMixin from "./WatchFilesMixin.js";

export default class OrigamiFileMap extends SyncCacheTransform(
  HandleExtensionsTransform(
    ImportModulesMixin(WatchFilesMixin(EventTargetMixin(FileMap))),
  ),
) {
  get cachePath() {
    const base = super.cachePath;
    if (base) {
      return base;
    }

    // If folder is within project, prefer path relative to root
    const root = Tree.root(this);
    const projectRootPath = root.path;
    const relativePath = path.relative(projectRootPath, this.path);
    let isPathWithinProjectRoot = !relativePath.startsWith("..");
    return isPathWithinProjectRoot ? relativePath : this.path;
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
