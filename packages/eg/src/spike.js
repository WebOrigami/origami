import { asyncGet } from "@explorablegraph/core";
// import fn from "/Users/jan/Source/ExplorableGraph/explorable/packages/eg/test/fixtures/letters.js";

const module = await import(
  "/Users/jan/Source/ExplorableGraph/explorable/packages/eg/test/fixtures/letters.js"
);
const fn = module.default;
const get = fn[asyncGet];
debugger;
