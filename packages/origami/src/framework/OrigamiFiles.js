import { FilesGraph } from "@graphorigami/core";
import EventTargetMixin from "./EventTargetMixin.js";
import FileTreeTransform from "./FileTreeTransform.js";
import ImportModulesMixin from "./ImportModulesMixin.js";
import WatchFilesMixin from "./WatchFilesMixin.js";

export default class OrigamiFiles extends FileTreeTransform(
  ImportModulesMixin(WatchFilesMixin(EventTargetMixin(FilesGraph)))
) {}
