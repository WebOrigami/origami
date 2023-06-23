import type { AsyncDictionary } from "@graphorigami/types";

export type PlainObject = {
  [key: string]: any;
};

export interface HasGraph {
  toGraph(): AsyncDictionary;
}

export type GraphVariant =
  Array<any> | 
  AsyncDictionary |
  Function | 
  HasGraph | 
  Map<any, any> | 
  PlainObject | 
  Set<any> | 
  any[];
