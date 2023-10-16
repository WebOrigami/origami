# Origami grammar

A loose definition of the Origami expression language grammar:

```
absoluteFilePath: leadingSlashPath

args: parensArgs
      leadingSlashPath

argsChain: args [argsChain]

array: "[" list "]"

assignment: identifier "=" expression

callTarget: absoluteFilePath
            array
            object
            tree
            lambda
            protocolCall
            group
            scopeReference

expression: string
            number
            implicitParensCall
            functionComposition
            absoluteFilePath
            array
            object
            tree
            lambda
            templateLiteral
            group
            protocolCall
            scopeReference

formula: assignment
         identifier

functionComposition: callTarget argsChain

tree: "{" treeDocument "}"

treeDocument: formula [separator treeDocument]

group: "(" expression ")"

identifier: everything but unescaped (),/:=[]\`{}# and whitespace

identifierWithPort: identifier ":" number
                    identifier

implicitParensCallTarget: functionComposition
                          callTarget

implicitParensCall: implicitParensCallTarget list

lambda: "=" expression

list: expression [separator list]

number: (valid JavaScript signed/unsigned integer or floating point number)

object: "{" objectProperties "}"

objectProperties: objectProperty [separator objectProperties]

objectProperty: identifier ":" expression
                identifier

parensArgs: "(" [list] ")"

pathKey: number
         identifier

protocolCall: scopeReference "://"|":/"|":" identifierWithPort ["/"] [slashPath]

scopeReference: identifier

separator: ","
           (newline)

slashPath: pathKey ["/" slashPath]

string: "[text]"
        '[text]'

substitution: "\{\{" expression "}}"

templateDocument: templateDocumentText [substitution templateDocument]

templateDocumentText: everything but unescaped "\{\{"

templateLiteral: templateText [substitution template]

templateText: everything but unescaped "\{\{" or "`"
```
