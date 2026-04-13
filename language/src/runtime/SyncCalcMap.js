import { SyncMap } from "@weborigami/async-tree";
import InvokeFunctionsTransform from "./InvokeFunctionsTransform.js";
import SyncCacheTransform from "./SyncCacheTransform.js";

export default class SyncCalcMap extends SyncCacheTransform(
  InvokeFunctionsTransform(SyncMap),
) {}
