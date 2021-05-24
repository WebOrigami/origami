import ExplorableGraph from "./ExplorableGraph";

export default class ExplorableObject extends ExplorableGraph {
  constructor(obj: any);
  static explore(obj): ExplorableGraph;
  set(...args: any[]): Promise<void>;
}