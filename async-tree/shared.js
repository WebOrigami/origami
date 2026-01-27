// Exports for both Node.js and browser

import { default as ExplorableSiteMap } from "./src/drivers/ExplorableSiteMap.js";
import { default as FileMap } from "./src/drivers/FileMap.js";
import { default as FunctionMap } from "./src/drivers/FunctionMap.js";
import { default as ObjectMap } from "./src/drivers/ObjectMap.js";
import { default as SetMap } from "./src/drivers/SetMap.js";
import { default as SiteMap } from "./src/drivers/SiteMap.js";

export { default as AsyncMap } from "./src/drivers/AsyncMap.js";
export { default as CalendarMap } from "./src/drivers/CalendarMap.js";
export { default as ConstantMap } from "./src/drivers/ConstantMap.js";
export { default as SyncMap } from "./src/drivers/SyncMap.js";
export * as extension from "./src/extension.js";
export * as jsonKeys from "./src/jsonKeys.js";
export { default as reduce } from "./src/operations/reduce.js";
export { default as scope } from "./src/operations/scope.js";
export * as symbols from "./src/symbols.js";
export * as trailingSlash from "./src/trailingSlash.js";
export { default as TraverseError } from "./src/TraverseError.js";
export * as Tree from "./src/Tree.js";
export { default as box } from "./src/utilities/box.js";
export { default as castArraylike } from "./src/utilities/castArraylike.js";
export { default as getTreeArgument } from "./src/utilities/getMapArgument.js";
export { default as getParent } from "./src/utilities/getParent.js";
export { default as getRealmObjectPrototype } from "./src/utilities/getRealmObjectPrototype.js";
export { default as isPacked } from "./src/utilities/isPacked.js";
export { default as isPlainObject } from "./src/utilities/isPlainObject.js";
export { default as isPrimitive } from "./src/utilities/isPrimitive.js";
export { default as isStringlike } from "./src/utilities/isStringlike.js";
export { default as isUnpackable } from "./src/utilities/isUnpackable.js";
export { default as keysFromPath } from "./src/utilities/keysFromPath.js";
export { default as naturalOrder } from "./src/utilities/naturalOrder.js";
export { default as pathFromKeys } from "./src/utilities/pathFromKeys.js";
export { default as setParent } from "./src/utilities/setParent.js";
export { default as toPlainValue } from "./src/utilities/toPlainValue.js";
export { default as toString } from "./src/utilities/toString.js";

export { ExplorableSiteMap, FileMap, FunctionMap, ObjectMap, SetMap, SiteMap };

export class DeepObjectMap extends ObjectMap {
  constructor(object) {
    super(object, { deep: true });
    console.warn("DeepObjectMap is deprecated. Please use ObjectMap instead.");
  }
}

export class ObjectTree extends ObjectMap {
  constructor(...args) {
    super(...args);
    console.warn("ObjectTree is deprecated. Please use ObjectMap instead.");
  }
}

export class DeepObjectTree extends ObjectMap {
  constructor(object) {
    super(object, { deep: true });
    console.warn("DeepObjectTree is deprecated. Please use ObjectMap instead.");
  }
}

export class ExplorableSiteTree extends ExplorableSiteMap {
  constructor(href) {
    super(href);
    console.warn(
      "ExplorableSiteTree is deprecated. Please use ExplorableSiteMap instead.",
    );
  }
}

export class FileTree extends FileMap {
  constructor(...args) {
    super(...args);
    console.warn("FileTree is deprecated. Please use FileMap instead.");
  }
}

export class FunctionTree extends FunctionMap {
  constructor(...args) {
    super(...args);
    console.warn("FunctionTree is deprecated. Please use FunctionMap instead.");
  }
}

export class SetTree extends SetMap {
  constructor(set) {
    super(set);
    console.warn("SetTree is deprecated. Please use SetMap instead.");
  }
}

export class SiteTree extends SiteMap {
  constructor(...args) {
    super(...args);
    console.warn("SiteTree is deprecated. Please use SiteMap instead.");
  }
}
