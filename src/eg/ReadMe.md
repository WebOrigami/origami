The eg grammar is as follows:

```
key: assignment
     reference

assignment: reference = expression [extension]

expression: doubleQuotedString
            singleQuotedString
            variableNameReference
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
           literal

variableReference: $variableName[extension]

variableNameReference: &variableName[extension]

extension: .literal

literal: everything but =(){}"', and whitespace

variableName: everything in literal, but not a period
```
