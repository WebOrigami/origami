import ExplorableGraph from "./ExplorableGraph";

export class ExplorableObject extends ExplorableGraph {
  constructor(obj: any);
  set(...args: any[]): Promise<void>;
}