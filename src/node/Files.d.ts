import ExplorableGraph from "../core/ExplorableGraph.js";

export default class Files extends ExplorableGraph {
  constructor(dirname: string);
  dirname: string;
  set(...args: any[]): Promise<void>;
}