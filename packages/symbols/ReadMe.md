This package does nothing other than define two JavaScript `Symbol` objects which form the bedrock of the explorable graph ecosystem in JavaScript.

With these two symbols, plus two more symbols built into JavaScript, you can create explorable objects on your own that are compatible with this ecosystem. You could also create symbols of your own and build out your own explorable ecosystem (but the explorable objects in your ecosystem would not be directly compatible with the others defined in this project.)

The symbols are defined in a package of their own so that you can adopt the explorable function pattern in any JavaScript project with no other dependencies. You do not have to use the core exfn package.

Hypothetically, the symbols defined here could someday be defined in the JavaScript language itself. If that came to pass, this package could simply re-export the new, standard JavaScript symbols. All explorable objects built with this project would then become compatible with those created with the standard symbols.
