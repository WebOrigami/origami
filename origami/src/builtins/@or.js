export default function or(...args) {
  return args.find((arg) => arg);
}

or.usage = `@or ...values\tReturns the first truthy value`;
or.documentation = "https://weborigami.org/language/@or.html";
