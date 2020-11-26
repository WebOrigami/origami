import { Explorable, get } from "@explorablegraph/exfn";

export default function execute(linked, argument) {
  if (linked instanceof Array) {
    // Function
    const [fn, ...args] = linked;

    // Recursively evaluate args.
    const evaluated = args.map((arg) => execute(arg, argument));

    // Now apply function to the evaluated args.
    const result =
      fn instanceof Explorable ? fn[get](evaluated[0]) : fn(...evaluated);
    return result;
  } else if (linked === argumentMarker) {
    // Argument placeholder
    return argument;
  } else {
    // Other terminal
    return linked;
  }
}

export const argumentMarker = Symbol("argumentMarker");
