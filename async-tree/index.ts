import type { AsyncTree } from "@graphorigami/types";

export * from "./main.js";

export type PlainObject = {
  [key: string]: any;
};

/**
 * An object with a non-trivial `toString` method.
 *
 * TODO: We want to deliberately exclude the base `Object` class because its
 * `toString` method return non-useful strings like `[object Object]`. How can
 * we declare that in TypeScript?
 */
export type HasString = {
  toString(): string;
};

export type StringLike = string | HasString;

export type TreeTransform = (tree: AsyncTree) => AsyncTree;

export type Treelike =
  any[] |
  AsyncTree |
  Function | 
  Map<any, any> | 
  PlainObject | 
  Set<any> | 
  Unpackable;

export type Unpackable = {
  unpack(): Promise<any>
};

export type ValueKeyFn = (innerValue: any, innerKey?: any) => any;
