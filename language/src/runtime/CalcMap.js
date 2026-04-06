import { SyncMap } from "@weborigami/async-tree";
import CacheMixin from "./CacheMixin.js";
import InvokeFunctionsMixin from "./InvokeFunctionsMixin.js";

export default class CalcMap extends CacheMixin(
  InvokeFunctionsMixin(SyncMap),
) {}
