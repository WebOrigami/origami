import { FileTree } from "@graphorigami/core";
import EventTargetMixin from "./EventTargetMixin.js";
import ImportModulesMixin from "./ImportModulesMixin.js";
import OrigamiTransform from "./OrigamiTransform.js";
import WatchFilesMixin from "./WatchFilesMixin.js";

export default class OrigamiFiles extends OrigamiTransform(
  (
    ImportModulesMixin(WatchFilesMixin(EventTargetMixin(FileTree)))
  )
) {}
