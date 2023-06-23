export function extname(path: string): string;
export function extractFrontMatter(s: StringLike): { frontBlock: string, bodyText: string, frontData: PlainObject };
export function getRealmObjectPrototype(obj: any): any;
export function getScope(graph: Explorable|null): Explorable;
export function graphInContext(graph: GraphVariant, context: Explorable|null): Explorable & { parent: Explorable };
export function isPlainObject(obj: any): boolean;
export function isTransformApplied(Transform: Function, obj: any): boolean;
export function keysFromPath(pathname: string): string[];
export const keySymbol: unique symbol;
export function outputWithGraph(obj: HasString, graph?: GraphVariant, emitFrontMatter?: boolean): string|(String & HasGraph);
export function parseYaml(text: string): PlainObject;
export function sortNatural(values: any[]): any[]
export function stringLike(value: any): boolean;
export function toFunction(obj: Invocable): Function;
export function toSerializable(obj: any): any;
export function transformObject(Transform: Function, obj: any): any;