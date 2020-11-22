import path from "path";
import ArrowDeclaration from "./ArrowDeclaration.js";
import VirtualFileGraph from "./VirtualFileGraph.js";

export default class loadArrowFile {
  static load(filePath) {
    const dirname = path.dirname(filePath);
    const basename = path.basename(filePath);
    const arrowDeclaration = new ArrowDeclaration(basename);
    const graph = new VirtualFileGraph({
      dirname,
      sourcePattern: arrowDeclaration.sourcePattern,
      transform: (obj) => obj,
      targetPattern: arrowDeclaration.targetPattern,
    });
    return graph;
  }
}
