import { asyncOps, Explorable } from "@explorablegraph/core";

export default async function stdout(obj) {
  let output;
  if (obj === undefined) {
    return;
  } else if (obj instanceof Explorable) {
    const strings = await asyncOps.strings(obj);
    output = JSON.stringify(strings, null, 2);
  } else {
    output = obj;
  }
  console.log(output);
}
