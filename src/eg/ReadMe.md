The eg grammar is as follows:

```
key: assignment
     declaration

declaration: variableDeclaration
             literal

variableDeclaration: {variableName}[extension]

assignment: declaration = expression [extension]

expression: doubleQuoteString
            singleQuoteString
            backtickQuoteString
            indirectCall
            group
            spaceUrl
            slashCall
            functionCall
            variableValue
            literal

doubleQuoteString: "[text]"

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

pathKey: reference

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

variableValue: variableReference

reference: variableReference
           literal

variableReference: $variableName[extension]

variableName: for now, JavaScript identifiers with ASCII letters

extension: .literal

literal: everything but =(){}$&"'/, and whitespace
```
