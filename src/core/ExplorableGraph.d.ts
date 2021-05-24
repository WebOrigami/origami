/// <reference path="explorable.ts"/>

export default class ExplorableGraph {
  static isExplorable(obj: any): boolean;
  static keys(graph: ExplorableGraph): Promise<any[]>;
  static mapValues(graph: ExplorableGraph, mapFn: (any) => any): Promise<any>;
  static plain(graph: ExplorableGraph): Promise<any>;
  static strings(graph: ExplorableGraph): Promise<any>;
}
