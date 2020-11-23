import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

class ProxyFs {
  constructor() {
    const proxy = new Proxy(this, {
      get(target, prop, receiver) {
        if (typeof prop === "string") {
          const promise = fs.readFile(path.join(currentDirectory, prop));
          return promise;
        } else {
          return target[prop];
        }
      },
    });
    return proxy;
  }

  async *[Symbol.asyncIterator]() {
    const names = await fs.readdir(currentDirectory);
    for (const name of names) {
      yield name;
    }
  }
}

const proxyFs = new ProxyFs();

// for await (const name of proxyFs) {
//   console.log(name);
// }
const data = await proxyFs["proxyFileSystem.js"];
console.log(data.toString());

const a = [];
for await (const name of proxyFs) {
  a.push(name);
}
console.log(a);
