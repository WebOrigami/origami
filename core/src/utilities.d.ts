import { PlainObject, StringLike } from "..";

export function castArrayLike(object: any): any;
export function getRealmObjectPrototype(object: any): any;
export function isPlainObject(object: any): object is PlainObject;
export function isStringLike(obj: any): obj is StringLike;
export function keysFromPath(path: string): string[];