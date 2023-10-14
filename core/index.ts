import type { AsyncDictionary } from "@graphorigami/types";
export * from "./main.js";

export type PlainObject = {
  [key: string]: any;
};

export type Treelike =
  any[] |
  AsyncDictionary |
  Function | 
  Map<any, any> | 
  PlainObject | 
  Set<any> | 
  { unpack(): Promise<Treelike> };
