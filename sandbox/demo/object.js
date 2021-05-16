import { Explorable } from "../../core/exports.js";

const graph = Explorable({
  a: "The letter A",
  b: "The letter B",
  c: "The letter C",
  more: {
    d: "The letter D",
    e: "The letter E",
    f: "The letter F",
  },
});
