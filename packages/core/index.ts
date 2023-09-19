import type { AsyncDictionary } from "@graphorigami/types";
export * from "./main.js";

export type PlainObject = {
  [key: string]: any;
};

export interface HasGraph {
  toGraph(): AsyncDictionary;
}

export type Graphable =
  Array<any> | 
  AsyncDictionary |
  Function | 
  HasGraph | 
  Map<any, any> | 
  PlainObject | 
  Set<any> | 
  any[];
