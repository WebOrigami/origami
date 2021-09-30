The eg grammar is as follows:

```
key: assignment
     declaration

declaration: variableDeclaration
             literal

variableDeclaration: {variableName}[extension]

assignment: declaration = expression [extension]

expression: doubleQuotedString
            singleQuotedString
            backtickQuotedString
            indirectCall
            group
            call

doubleQuotedString: "[text]"

singleQuotedString: '[text]'

backtickQuotedString: `backtickList`

backtickList: backtickText variableReference backtickText

backtickText: everything but $

indirectCall: group args

group: ( expression )

call: reference [args]

args: parentheticalArgs
      list

parentheticalArgs: ( [list] )

list: expression , list
      expression

reference: variableReference
           literal

variableReference: $variableName[extension]

variableName: everything in literal, but not a period

extension: .literal

literal: everything but =(){}$&"', and whitespace
```
