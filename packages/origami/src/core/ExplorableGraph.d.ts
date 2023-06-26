/// <reference path="explorable.ts"/>

export default class ExplorableGraph {
  static toTextForExtension(graph: GraphVariant | object, key: string): Promise<string>;
  static traverse(graph: GraphVariant, ...keys: any[]): Promise<any>;
  static traverseOrThrow(graph: GraphVariant, ...keys: any[]): Promise<any>;
  static traversePath(graph: GraphVariant, path: string): Promise<any>;
}
