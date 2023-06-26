import { FilesGraph } from "@graphorigami/core";
import EventTargetMixin from "./EventTargetMixin.js";
import FileTreeTransform from "./FileTreeTransform.js";
import ImplicitModulesTransform from "./ImplicitModulesTransform.js";
import ImportModulesMixin from "./ImportModulesMixin.js";
import WatchFilesMixin from "./WatchFilesMixin.js";

export default class OrigamiFiles extends FileTreeTransform(
  ImplicitModulesTransform(
    ImportModulesMixin(WatchFilesMixin(EventTargetMixin(FilesGraph)))
  )
) {}
