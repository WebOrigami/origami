import { Explorable, get } from "@explorablegraph/exfn";

export default function execute(exfn, argument) {
  let result;
  // The fn will be the function we want to execute.
  for (const fn of exfn) {
    const subtree = exfn[get](fn);
    const arg =
      subtree === argumentMarker
        ? argument
        : subtree instanceof Explorable
        ? subtree[get](argument)
        : subtree;
    // REVIEW: Support regular functions directly like this, or require an
    // exfn?
    result = fn instanceof Explorable ? fn[get](arg) : fn(arg);
  }
  return result;
}

export const argumentMarker = Symbol("argumentMarker");
