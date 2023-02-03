/// <reference path="explorable.ts"/>

export default class ExplorableGraph {
  static canCastToExplorable(obj: any): boolean;
  static from(graph: GraphVariant): Explorable;
  static isExplorable(obj: any): boolean;
  static isKeyExplorable(graph: Explorable, obj: any): Promise<boolean>;
  static keys(graph: GraphVariant): Promise<any[]>;
  static mapReduce(graph: GraphVariant, mapFn: null|((any) => any|null), reduceFn: (any) => any): Explorable;
  static plain(graph: GraphVariant): Promise<PlainObject>;
  static toFunction(graph: GraphVariant): Function;
  static toJson(graph: GraphVariant | object): Promise<string>;
  static toSerializable(graph: Explorable): Promise<PlainObject>;
  static toTextForExtension(graph: GraphVariant | object, key: string): Promise<string>;
  static toYaml(graph: GraphVariant | object): Promise<string>;
  static traverse(graph: GraphVariant, ...keys: any[]): Promise<any>;
  static traverseOrThrow(graph: GraphVariant, ...keys: any[]): Promise<any>;
  static values(graph: GraphVariant): Promise<any[]>;
}
