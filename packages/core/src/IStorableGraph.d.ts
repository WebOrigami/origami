import ExplorableGraph from "./ExplorableGraph";

export default interface IStorableGraph extends ExplorableGraph {
  set(...args: any[]): Promise<void>;
}