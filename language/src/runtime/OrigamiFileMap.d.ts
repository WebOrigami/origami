import { FileMap } from "@weborigami/async-tree";
import SyncCacheTransform from "../cache/SyncCacheTransform.js";
import EventTargetMixin from "./EventTargetMixin.js";
import HandleExtensionsTransform from "./HandleExtensionsTransform.js";
import ImportModulesMixin from "./ImportModulesMixin.js";
import WatchFilesMixin from "./WatchFilesMixin.js";

export default class OrigamiFileMap extends SyncCacheTransform(HandleExtensionsTransform(
  ImportModulesMixin(WatchFilesMixin(EventTargetMixin(FileMap)))
)) {
  globals: any;
}
