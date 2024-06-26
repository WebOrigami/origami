import { Packed, PlainObject, StringLike } from "../index.ts";

export function castArrayLike(object: any): any;
export function getRealmObjectPrototype(object: any): any;
export const hiddenFileNames: string[];
export function isPacked(object: any): object is Packed;
export function isPlainObject(object: any): object is PlainObject;
export function isPrimitive(object: any): boolean;
export function isUnpackable(object): object is { unpack: () => any };
export function isStringLike(object: any): object is StringLike;
export function keysFromPath(path: string): string[];
export const naturalOrder: (a: string, b: string) => number;
export function pipeline(start: any, ...functions: Function[]): Promise<any>;
export function toPlainValue(object: any): Promise<any>;
export function toStringAsync(object: any): Promise<string>;
export function toString(object: any): string;