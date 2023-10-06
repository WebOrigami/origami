import type { AsyncDictionary } from "@graphorigami/types";
export * from "./main.js";

export type PlainObject = {
  [key: string]: any;
};

export interface HasContents {
  unpack(): Promise<any>;
}

export type Graphable =
  Array<any> | 
  AsyncDictionary |
  Function | 
  HasContents | 
  Map<any, any> | 
  PlainObject | 
  Set<any> | 
  any[];
