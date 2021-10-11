/// <reference path="explorable.ts"/>

export default class ExplorableGraph {
  static from(graph: GraphVariant): Explorable;
  static isExplorable(obj: any): boolean;
  static keys(graph: Explorable): Promise<any[]>;
  static map(graph: Explorable, mapFn: (any) => any): Explorable;
  static plain(graph: Explorable): Promise<any>;
  static parse(text: string): Explorable;
  static strings(graph: Explorable): Promise<any>;
  static toJson(graph: GraphVariant | object): Promise<string>;
  static toTextForExtension(graph: GraphVariant | object, key: string): Promise<string>;
  static toYaml(graph: GraphVariant | object): Promise<string>;
}
