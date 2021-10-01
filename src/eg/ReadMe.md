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
            url
            call

doubleQuoteString: "[text]"

singleQuoteString: '[text]'

backtickQuoteString: `backtickContents`

backtickContents: backtickText variableReference backtickContents
                  backtickText

backtickText: everything but ` and $

indirectCall: group args

group: ( expression )

url: protocol urlPath

protocol: "http"
          "https"

urlPath: urlKey urlPath
         urlKey

urlKey: variableReference
        literal

call: reference [args]

args: parentheticalArgs
      list

parentheticalArgs: ( [list] )

list: expression , list
      expression

reference: variableReference
           literal

variableReference: $variableName[extension]

variableName: for now, JavaScript identifiers with ASCII letters

extension: .literal

literal: everything but =(){}$&"', and whitespace
```
