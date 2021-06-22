// Link an array of parsed nodes, which are either <terminal> or [fn, args].
// Return the equivalent array in which each key has been replaced with its value in
// the scope graph.
export default async function link(parsed, scope) {
  if (parsed instanceof Array) {
    // Function
    // Map the name to the actual function.
    const [fnExpression, ...args] = parsed;
    const fn =
      fnExpression instanceof Array
        ? await link(fnExpression, scope)
        : await scope.get(fnExpression);

    // Recursively link the args.
    const linkedArgs = await Promise.all(args.map((arg) => link(arg, scope)));

    return [fn, ...linkedArgs];
  } else {
    // Terminal
    return parsed;
  }
}
