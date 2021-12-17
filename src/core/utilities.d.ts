export function transformObject(Transform: Function, obj: any): any;
export function extractFrontMatter(s: string): { frontBlock: string, bodyText: string, frontData: PlainObject };
export function isPlainObject(obj: any): boolean;
export function parse(text: string): PlainObject;
export function toFunction(obj: Invocable): Function;
export function toSerializable(obj: any): any;