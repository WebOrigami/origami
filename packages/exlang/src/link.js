import { get } from "@explorablegraph/core";

// Link an array of parsed nodes, which are either <terminal> or [fn, args].
// Return the equivalent array in which each key has been replaced with its value in
// the scope exfn.
export default function link(parsed, scope) {
  if (parsed instanceof Array) {
    // Function
    // Map the name to the actual function.
    const [fnName, ...args] = parsed;
    const fn = scope[get](fnName);

    // Recursively link the args.
    const linkedArgs = args.map((arg) => link(arg, scope));

    return [fn, ...linkedArgs];
  } else {
    // Terminal
    return parsed;
  }
}
