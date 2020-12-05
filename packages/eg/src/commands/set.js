import { asyncSet } from "@explorablegraph/core";

export default async function set(target, source) {
  await target[asyncSet](source);
}
