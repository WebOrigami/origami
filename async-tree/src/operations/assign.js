import * as args from "../utilities/args.js";
import interop from "../utilities/interop.js";
import apply from "./apply.js";

export default async function assign(target, source) {
  interop.warn("Tree.assign is deprecated. Use Tree.apply instead.");
  const targetTree = await args.map(target, "Tree.assign", {
    position: 1,
  });
  const sourceTree = await args.map(source, "Tree.assign", {
    position: 2,
  });
  return apply(targetTree, sourceTree);
}
