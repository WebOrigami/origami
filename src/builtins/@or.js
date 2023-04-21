export default function or(...args) {
  return args.find((arg) => arg);
}

or.usage = `@or ...values\tReturns the first truthy value`;
or.documentation = "https://graphorigami.org/language/@or.html";
