import { trailingSlash } from "../../main.js";

export default function constantTree(constant) {
  return {
    async get(key) {
      return trailingSlash.has(key) ? constantTree(constant) : constant;
    },

    async keys() {
      return [];
    },
  };
}
