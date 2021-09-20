/// <reference path="explorable.ts"/>

export default class ExplorableGraph {
  static isExplorable(obj: any): boolean;
  static keys(graph: Explorable): Promise<any[]>;
  static map(graph: Explorable, mapFn: (any) => any): Explorable;
  static mapValues(graph: Explorable, mapFn: (any) => any): Promise<any>;
  static plain(graph: Explorable): Promise<any>;
  static strings(graph: Explorable): Promise<any>;
}
