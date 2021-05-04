import process from "process";
import { ExplorableGraph, WildcardGraph } from "../../core/exports.js";
import { Files, VirtualFiles, VirtualKeys } from "../../node/exports.js";
import DefaultPages from "./DefaultPages.js";

export default class ExplorableApp extends ExplorableGraph {
  constructor(files) {
    super();
    if (files === undefined) {
      const dirname = process.cwd();
      files = new Files(dirname);
    }

    // DefaultPages(Files) so that DefaultPages can respect real index.html

    // DefaultPages(VirtualKeys(...)) so that VirtualKeys can provide keys to index.html

    // WildcardGraph(DefaultPages(...)) so that DefaultPages can provide index.html
    // without triggering :notFound wildcard

    // DefaultPages(VirtualFiles(...)) so that VirtualFiles can generate a dynamic index.html

    // WildcardGraph(VirtualFiles(...)) so that VirtualFiles can generate a wildcard function
    // that WildcardGraph can resolve

    // Can't rely only on outer Resolver to resolve functions -- a wildcard function needs to
    // be able to return undefined to indicate that it can't provide a value for that path

    this.inner = new WildcardGraph(
      new DefaultPages(new VirtualFiles(new VirtualKeys(files)))
    );
  }

  async *[Symbol.asyncIterator]() {
    yield* this.inner[Symbol.asyncIterator]();
  }

  async get(...path) {
    return await this.inner.get(...path);
  }
}

// class Resolver extends ExplorableGraph {
//   constructor(inner) {
//     super();
//     this.inner = inner;
//   }

//   async *[Symbol.asyncIterator]() {
//     yield* this.inner[Symbol.asyncIterator]();
//   }

//   async get(...path) {
//     let graph = this.inner;
//     let value = undefined;
//     while (path.length > 0) {
//       const key = path.shift();
//       value = await graph.get(key);
//       if (value instanceof Function) {
//         value = await value();
//       }
//       if (value instanceof ExplorableGraph) {
//         value = await value.get(...path);
//         path = [];
//       }
//     }
//     return value;
//   }
// }
