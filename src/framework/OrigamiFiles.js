import FilesGraph from "../core/FilesGraph.js";
import EventTargetMixin from "./EventTargetMixin.js";
import FileTreeTransform from "./FileTreeTransform.js";
import ImplicitModulesTransform from "./ImplicitModulesTransform.js";
import ImportModulesMixin from "./ImportModulesMixin.js";

export default class OrigamiFiles extends FileTreeTransform(
  ImplicitModulesTransform(ImportModulesMixin(EventTargetMixin(FilesGraph)))
) {}
