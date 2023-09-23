import type { AsyncDictionary } from "@graphorigami/types";
export * from "./main.js";

export type PlainObject = {
  [key: string]: any;
};

export interface HasGraphable {
  toGraphable(): Promise<Graphable>;
}

export type Graphable =
  Array<any> | 
  AsyncDictionary |
  Function | 
  HasGraphable | 
  Map<any, any> | 
  PlainObject | 
  Set<any> | 
  any[];
