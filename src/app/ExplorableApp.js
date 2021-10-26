import DefaultValues from "../common/DefaultValues.js";
import ExplorableFiles from "../node/ExplorableFiles.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import defaultKeysJson from "./defaultKeysJson.js";
import MetaMixin from "./MetaMixin.js";

class AppGraph extends MetaMixin(ExplorableFiles) {}

export default class ExplorableApp extends DefaultValues {
  #main;

  constructor(dirname) {
    const main = new AppGraph(dirname);
    const defaults = {
      ".index": defaultIndexHtml,
      ".keys.json": defaultKeysJson,
      "index.html": defaultIndexHtml,
    };
    super(main, defaults);
    this.#main = main;
  }

  get context() {
    return this.#main.context;
  }
  set context(context) {
    this.#main.context = context;
  }

  get scope() {
    return this.#main.scope;
  }
  set scope(scope) {
    this.#main.scope = scope;
  }
}
