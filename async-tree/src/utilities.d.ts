import { Packed, PlainObject, StringLike } from "../index.ts";

export function castArrayLike(object: any): any;
export function getRealmObjectPrototype(object: any): any;
export const hiddenFileNames: string[];
export function isPacked(object: any): object is Packed;
export function isPlainObject(object: any): object is PlainObject;
export function isStringLike(obj: any): obj is StringLike;
export function keysFromPath(path: string): string[];
export const naturalSortCompareFn: (a: string, b: string) => number;
export function sortNatural(array: string[]): void;