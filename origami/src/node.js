import path from "node:path";
import process from "node:process";
import url from "node:url";

// Patch process.env to be a plain object. Among other things, this lets us dump
// the complete environment to the terminal with `ori @node/process/env`.
const patchedProcess = Object.create(null, {
  ...Object.getOwnPropertyDescriptors(process),
  env: {
    enumerable: true,
    get: function () {
      return Object.assign({}, process.env);
    },
  },
});

export default {
  Buffer,
  path,
  process: patchedProcess,
  url,
};
