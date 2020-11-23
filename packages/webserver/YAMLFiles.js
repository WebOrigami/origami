import YAML from "yaml";
import FileGraph from "./FileGraph.js.js.js";

// NOTE: Concept only -- not tested
export default class YAMLFiles extends TransformGraph {
  constructor(options) {
    this.dirname = options.dirname;
    super(
      Object.assign({}, options, {
        source: options.source || new FileGraph(options.dirname),
      })
    );
  }

  async transform(obj) {
    const text = String(obj);
    const parsed = YAML.parse(text);
    return parsed;
  }
}
