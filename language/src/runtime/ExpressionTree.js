import { DeepObjectTree } from "@weborigami/async-tree";
import InvokeFunctionsTransform from "./InvokeFunctionsTransform.js";

export default class ExpressionTree extends InvokeFunctionsTransform(
  DeepObjectTree
) {}
