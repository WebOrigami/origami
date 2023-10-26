import type { AsyncTree } from "@graphorigami/types";
export * from "./main.js";

export type PlainObject = {
  [key: string]: any;
};

export type Unpackable = {
  unpack(): Promise<any>
};

export type Treelike =
  any[] |
  AsyncTree |
  Function | 
  Map<any, any> | 
  PlainObject | 
  Set<any> | 
  Unpackable;
