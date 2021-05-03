import { ExplorableGraph } from "@explorablegraph/core";
import { Files } from "@explorablegraph/node";
import process from "process";
import DefaultPages from "./DefaultPages.js";

export default class ExplorableApp extends ExplorableGraph {
  constructor(files) {
    super();
    if (files === undefined) {
      const dirname = process.cwd();
      files = new Files(dirname);
    }
    this.inner = new DefaultPages(files);
  }

  async *[Symbol.asyncIterator]() {
    yield* this.inner[Symbol.asyncIterator]();
  }

  async get(...path) {
    return await this.inner.get(...path);
  }
}
