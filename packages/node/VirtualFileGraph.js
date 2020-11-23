import ExplorablePatternMap from "./ExplorablePatternMap.js.js";
import FileGraph from "./FileGraph.js";

export default class VirtualFileGraph extends ExplorablePatternMap {
  constructor(options) {
    super({
      source: new FileGraph(options.dirname),
      sourcePattern: options.sourcePattern,
      targetPattern: options.targetPattern,
      transform: options.transform,
    });
  }
}
