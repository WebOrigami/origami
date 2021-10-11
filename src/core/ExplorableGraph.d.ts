/// <reference path="explorable.ts"/>

export default class ExplorableGraph {
  static from(graph: GraphVariant): Explorable;
  static isExplorable(obj: any): boolean;
  static keys(graph: GraphVariant): Promise<any[]>;
  static map(graph: Explorable, mapFn: (any) => any): Explorable;
  static plain(graph: GraphVariant): Promise<PlainObject>;
  static parse(text: string): Explorable;
  static strings(graph: Explorable): Promise<any>;
  static toJson(graph: GraphVariant | object): Promise<string>;
  static toTextForExtension(graph: GraphVariant | object, key: string): Promise<string>;
  static toYaml(graph: GraphVariant | object): Promise<string>;
  static values(graph: GraphVariant): Promise<any[]>;
}
