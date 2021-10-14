The eg grammar is as follows:

```
key: assignment
     declaration

declaration: variableDeclaration
             literal

variableDeclaration: {variableName}[extension]

assignment: declaration = expression [extension]

expression: singleQuoteString
            backtickQuoteString
            indirectCall
            group
            spaceUrl
            slashCall
            functionCall
            variableValue
            literalValue

singleQuoteString: '[text]'

backtickQuoteString: `backtickContents`

backtickContents: backtickText variableReference backtickContents
                  backtickText

backtickText: everything but ` and $

indirectCall: group args

group: ( expression )

slashCall: literal ":"|"://"|"/" slashPath

slashPath: pathKey / slashPath
           pathKey

pathKey: variableReference
         literal

slashCall: literal / slashPath

spaceUrl: spaceUrlProtocol whitespace spaceUrlPath

spaceUrlProtocol: https
                  http

spaceUrlPath: pathKey whitespace spaceUrlPath
              pathKey

functionCall: reference [args]

args: parentheticalArgs
      list

parentheticalArgs: ( [list] )

list: expression , list
      expression

reference: variableReference
           literalValue

variableValue: variableReference

variableReference: $variableName[extension]

variableName: for now, JavaScript identifiers with ASCII letters

extension: .literal

literalValue: literal

literal: everything but =(){}$&"'/, and whitespace


functionCall: value [args]

key: assignment
     reference

declaration → drop

slashPath: reference / slashPath
spaceUrlPath: reference whitespace spaceUrlPath

pathKey → drop

reference: variableReference
           literalReference

value: variableValue
       literalValue

```
