import { ExplorableGraph, WildcardGraph } from "@explorablegraph/core";
import { Files, VirtualFiles } from "@explorablegraph/node";
import process from "process";
import DefaultPages from "./DefaultPages.js";

export default class ExplorableApp extends ExplorableGraph {
  constructor(files) {
    super();
    if (files === undefined) {
      const dirname = process.cwd();
      files = new Files(dirname);
    }
    this.inner = new Resolver(
      new WildcardGraph(new DefaultPages(new VirtualFiles(files)))
    );
  }

  async *[Symbol.asyncIterator]() {
    yield* this.inner[Symbol.asyncIterator]();
  }

  async get(...path) {
    return await this.inner.get(...path);
  }
}

class Resolver extends ExplorableGraph {
  constructor(inner) {
    super();
    this.inner = inner;
  }

  async *[Symbol.asyncIterator]() {
    yield* this.inner[Symbol.asyncIterator]();
  }

  async get(...path) {
    let graph = this.inner;
    let value = undefined;
    while (path.length > 0) {
      const key = path.shift();
      value = await graph.get(key);
      if (value instanceof Function) {
        value = await value();
      }
      if (value instanceof ExplorableGraph) {
        value = await value.get(...path);
        path = [];
      }
    }
    return value;
  }
}
