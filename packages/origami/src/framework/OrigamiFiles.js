import { FilesGraph } from "@graphorigami/core";
import ImportModulesMixin from "../common/ImportModulesMixin.js";
import EventTargetMixin from "./EventTargetMixin.js";
import FileTreeTransform from "./FileTreeTransform.js";
import WatchFilesMixin from "./WatchFilesMixin.js";

export default class OrigamiFiles extends FileTreeTransform(
  ImportModulesMixin(WatchFilesMixin(EventTargetMixin(FilesGraph)))
) {}
