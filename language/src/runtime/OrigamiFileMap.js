import { FileMap } from "@weborigami/async-tree";
import CacheMixin from "./CacheMixin.js";
import EventTargetMixin from "./EventTargetMixin.js";
import HandleExtensionsTransform from "./HandleExtensionsTransform.js";
import ImportModulesMixin from "./ImportModulesMixin.js";
import WatchFilesMixin from "./WatchFilesMixin.js";

export default class OrigamiFileMap extends CacheMixin(
  HandleExtensionsTransform(
    ImportModulesMixin(WatchFilesMixin(EventTargetMixin(FileMap))),
  ),
) {}
