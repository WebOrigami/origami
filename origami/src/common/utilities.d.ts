
export const keySymbol: unique symbol;
export const parentSymbol: unique symbol;
export function hasNonPrintableCharacters(text: string): boolean;
export function isTransformApplied(Transform: Function, object: any): boolean;
export function replaceExtension(key: string, sourceExtension: string, resultExtension: string): string;
export function toFunction(object: any): Function;
export function toString(object: any): string|null;
export function transformObject(Transform: Function, object: any): any;
