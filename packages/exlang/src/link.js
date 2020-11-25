import { syncOps } from "@explorablegraph/exfn";

// Given an exfn of parsed { key, value } nodes, return the equivalent tree in
// which each key has been replaced with its value in the scope exfn.
export default function link(parsed, scope) {
  return syncOps.mapKeys(parsed, (key) => scope(key));
}
