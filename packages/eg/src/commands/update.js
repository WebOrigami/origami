import { asyncOps } from "@explorablegraph/core";

export default async function update(target, source) {
  await asyncOps.update(target, source);
}

update.usage = `update(target, source)\tUpdate the target with the values in source`;
