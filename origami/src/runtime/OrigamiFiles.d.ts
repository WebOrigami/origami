import { FileTree } from "@graphorigami/core";
import ImportModulesMixin from "../common/ImportModulesMixin.js";
import EventTargetMixin from "./EventTargetMixin.js";
import OrigamiTransform from "./OrigamiTransform.js";
import WatchFilesMixin from "./WatchFilesMixin.js";

export default class OrigamiFiles extends OrigamiTransform(
  (
    ImportModulesMixin(WatchFilesMixin(EventTargetMixin(FileTree)))
  )
) {}
