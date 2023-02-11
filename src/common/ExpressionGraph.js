import ObjectGraph from "../core/ObjectGraph.js";
import InvokeFunctionsTransform from "./InvokeFunctionsTransform.js";

export default class ExpressionGraph extends InvokeFunctionsTransform(
  ObjectGraph
) {}
