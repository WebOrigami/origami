import DefaultValuesMixin from "../common/DefaultValuesMixin.js";
import GraphDelegate from "../core/GraphDelegate.js";
import { applyMixinToGraph } from "../core/utilities.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import defaultKeysJson from "./defaultKeysJson.js";
import MetaMixin from "./MetaMixin.js";

// Apply meta in app() command
// class AppGraph extends MetaMixin(ExplorableFiles) {}

export default class ExplorableApp extends GraphDelegate {
  constructor(graph) {
    const meta = applyMixinToGraph(MetaMixin, graph);
    const defaults = applyMixinToGraph(DefaultValuesMixin, meta);
    super(defaults);
    this.defaults = {
      ".index": defaultIndexHtml,
      ".keys.json": defaultKeysJson,
      "index.html": defaultIndexHtml,
    };
  }

  get context() {
    return this.graph.context;
  }
  set context(context) {
    this.graph.context = context;
  }

  get scope() {
    return this.graph.scope;
  }
  set scope(scope) {
    this.graph.scope = scope;
  }
}
