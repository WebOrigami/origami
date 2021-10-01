import DefaultValues from "../../src/common/DefaultValues.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import FileLoadersMixin from "../../src/node/FileLoadersMixin.js";
// import WildcardKeysMixin from "./WildcardKeysMixin.js";
// import InvokeFunctionsMixin from "../common/InvokeFunctionsMixin.js";
import ModulesDefaultExportMixin from "../node/ModulesDefaultExportMixin.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import defaultKeysJson from "./defaultKeysJson.js";
// import VirtualValuesMixin from "./VirtualValuesMixin.js";
import FormulasMixin from "./FormulasMixin.js";
import HandlebarsHtmlMixin from "./HandlebarsHtmlMixin.js";
import ImplicitExportsMixin from "./ImplicitExportsMixin.js";
// import PlusKeysMixin from "./PlusKeysMixin.js";
// import SplatKeysMixin from "./SplatKeysMixin.js";
import VirtualKeysMixin from "./VirtualKeysMixin.js";
import WatchFilesMixin from "./WatchFilesMixin.js";

class AppGraph
  // InvokeFunctionsMixin
  // WildcardKeysMixin
  extends ImplicitExportsMixin(
    HandlebarsHtmlMixin(
      // PlusKeysMixin(
      // SplatKeysMixin(
      VirtualKeysMixin(
        FormulasMixin(
          FileLoadersMixin(
            ModulesDefaultExportMixin(WatchFilesMixin(ExplorableFiles))
          )
        )
      )
    )
  ) {}

export default class ExplorableApp extends DefaultValues {
  #main;

  constructor(dirname) {
    const main = new AppGraph(dirname);
    const defaults = {
      ".keys.json": defaultKeysJson,
      "index.html": defaultIndexHtml,
    };
    super(main, defaults);
    this.#main = main;
  }

  get scope() {
    return this.#main.scope;
  }
  set scope(scope) {
    this.#main.scope = scope;
  }
}
