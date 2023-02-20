import DefaultValues from "../common/DefaultValues.js";
import ObjectGraph from "../core/ObjectGraph.js";
// import defaultDataflow from "./defaultDataflow.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import defaultKeysJson from "./defaultKeysJson.js";
import OriCommandTransform from "./OriCommandTransform.js";
// import defaultSvg from "./defaultSvg.js";
// import scopeExplorer from "./scopeExplorer.js";

export default class DefaultPages extends DefaultValues {
  constructor(graph) {
    const defaults = new (OriCommandTransform(ObjectGraph))({
      // ".dataflow": defaultDataflow,
      // ".index": defaultIndexHtml,
      ".keys.json": defaultKeysJson,
      // ".scope": scopeExplorer,
      // ".svg": defaultSvg,
      // ".yaml": defaultYamlHtml,
      "index.html": defaultIndexHtml,
    });
    super(graph, defaults);
  }
}
