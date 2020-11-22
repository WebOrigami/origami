import ArrowDeclaration from "./ArrowDeclaration.js";
import TransformGraph from "./TransformGraph.js";

export default class ArrowTransformGraph extends TransformGraph {
  async *[Symbol.asyncIterator]() {
    for await (const key of this.source) {
      if (!ArrowDeclaration.isArrowDeclaration(key)) {
        yield key;
      }
    }
  }

  // sourceKeyForVirtualKey(key) {
  //   return key >= "A" && key <= "Z" ? key.toLowerCase() : null;
  // }
  // virtualKeyForSourceKey(key) {
  //   return key >= "a" && key <= "z" ? key.toUpperCase() : null;
  // }
  // async transform(obj) {
  //   return obj.toUpperCase();
  // }
}
