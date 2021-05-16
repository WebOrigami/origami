// import { ExplorableGraph } from "../../core/exports.js";
import ExplorableGraph from "../../core/exports.js/src/ExplorableGraph.js";

export default class Files extends ExplorableGraph {
  constructor(dirname: string);
  dirname: string;
  set(...args: any[]): Promise<void>;
}