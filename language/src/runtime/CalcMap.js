import { SyncMap } from "@weborigami/async-tree";
import CacheTransform from "./CacheTransform.js";
import InvokeFunctionsTransform from "./InvokeFunctionsTransform.js";

export default class CalcMap extends CacheTransform(
  InvokeFunctionsTransform(SyncMap),
) {}
