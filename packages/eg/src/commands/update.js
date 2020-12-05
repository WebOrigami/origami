import { asyncOps } from "@explorablegraph/core";

export default async function update(target, source) {
  await asyncOps.update(target, source);
}
