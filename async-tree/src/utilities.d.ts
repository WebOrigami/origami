import { AsyncTree } from "@weborigami/types";
import { Packed, PlainObject, StringLike } from "../index.ts";

export function box(value: any): any;
export function castArrayLike(object: any): any;
export function getRealmObjectPrototype(object: any): any;
export const hiddenFileNames: string[];
export function isPacked(obj: any): obj is Packed;
export function isPlainObject(obj: any): obj is PlainObject;
export function isStringLike(obj: any): obj is StringLike;
export function isUnpackable(obj): obj is { unpack: () => any };
export function keysFromPath(path: string): string[];
export const naturalOrder: (a: string, b: string) => number;
export function pipeline(start: any, ...functions: Function[]): Promise<any>;
export function setParent(child: any, parent: AsyncTree): void;
export function toPlainValue(object: any): Promise<any>;
export function toString(object: any): string;
