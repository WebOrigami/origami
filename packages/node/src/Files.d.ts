// import { ExplorableGraph } from "@explorablegraph/core";
import ExplorableGraph from "@explorablegraph/core/src/ExplorableGraph.js";

export default class Files extends ExplorableGraph {
  constructor(dirname: string);
  dirname: string;
  set(...args: any[]): Promise<void>;
}