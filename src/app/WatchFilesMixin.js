import * as fs from "fs"; // NOT the promises version used elsewhere
import path from "path";
import process from "process";

export default function WatchFilesMixin(Base) {
  return class WatchFiles extends Base {
    constructor(dirname) {
      super(dirname);
      const absoluteDirname = path.resolve(process.cwd(), dirname);
      fs.watch(absoluteDirname, (...args) => this.onChange(...args));
    }

    onChange(eventType, filename) {
      if (super.onChange) {
        super.onChange(eventType, filename);
      }
      console.log(`File changed: ${filename}`);
    }
  };
}
