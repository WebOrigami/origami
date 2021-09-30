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
            indirectCall
            group
            call

doubleQuotedString: "[text]"

singleQuotedString: '[text]'

indirectCall: group args

group: ( expression )

call: reference [args]

args: parentheticalArgs
      list

parentheticalArgs: ( [list] )

list: expression , list
      expression

reference: variableReference
           variableNameReference
           literal

variableReference: $variableName[extension]

variableNameReference: &variableName[extension]

variableName: everything in literal, but not a period

extension: .literal

literal: everything but =(){}$&"', and whitespace
```
