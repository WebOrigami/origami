import { AsyncExplorable, asyncGet, asyncKeys } from "@explorablegraph/core";
import { promises as fs } from "fs";
import path from "path";

export default class File extends AsyncExplorable {
  constructor(filePath) {
    super();
    this.filePath = filePath;
  }

  async *[asyncKeys]() {
    yield* [path.basename(this.filePath)];
  }

  async [asyncGet](...keys) {
    if (keys.length === 0 || keys.length > 1) {
      // Only want one key.
      return undefined;
    }
    const key = keys[0];
    if (key !== path.basename(this.filePath)) {
      // Didn't get the expected key.
      return undefined;
    }
    const value = fs.readFile(this.filePath);
    return value;
  }
}
