import { AsyncTree } from "@weborigami/types";
import { Packed, PlainObject, StringLike } from "../index.ts";

export function box(value: any): any;
export function castArrayLike(object: any): any;
export function getRealmObjectPrototype(object: any): any;
export const hiddenFileNames: string[];
export function isPacked(object: any): object is Packed;
export function isPlainObject(object: any): object is PlainObject;
export function isUnpackable(object): object is { unpack: () => any };
export function isStringLike(object: any): object is StringLike;
export function keysFromPath(path: string): string[];
export const naturalOrder: (a: string, b: string) => number;
export function pipeline(start: any, ...functions: Function[]): Promise<any>;
export function setParent(child: any, parent: AsyncTree): void;
export function toPlainValue(object: any): Promise<any>;
export function toString(object: any): string;
