import type { AsyncTree } from "@graphorigami/types";

export * from "./main.js";

export type KeyFn = (key: any, innerTree: AsyncTree) => any;

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

export type PlainObject = {
  [key: string]: any;
};

export type StringLike = string | HasString;

export type Treelike =
  any[] |
  AsyncTree |
  Function | 
  Map<any, any> | 
  PlainObject | 
  Set<any> | 
  Unpackable;

export type TreeTransform = (tree: AsyncTree) => AsyncTree;

export type Unpackable = {
  unpack(): Promise<any>
};

export type ValueKeyFn = (value: any, key: any, innerTree: AsyncTree) => any;
