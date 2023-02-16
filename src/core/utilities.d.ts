export function extname(path: string): string;
export function extractFrontMatter(s: string): { frontBlock: string, bodyText: string, frontData: PlainObject };
export function isPlainObject(obj: any): boolean;
export const keySymbol: unique symbol;
export function outputWithGraph(obj: HasString, graph?: GraphVariant, emitFrontMatter?: boolean): string|(String & HasGraph);
export function parseYaml(text: string): PlainObject;
export function sortNatural(values: any[]): any[]
export function stringLike(value: any): boolean;
export function toFunction(obj: Invocable): Function;
export function toSerializable(obj: any): any;
export function transformObject(Transform: Function, obj: any): any;