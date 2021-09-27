The eg grammar is as follows:

```
statement: assignment
           expr

assignment: reference = expr [extension]

expr: doubleQuotedString
      singleQuotedString
      indirectCall
      group
      call

doubleQuotedString: "[text]"

singleQuotedString: '[text]'

indirectCall: group args

group: ( expr )

call: reference args
      reference

args: parentheticalArgs
      list

parentheticalArgs: ( [list] )

list: expr , list
      expr

reference: literal
           pattern

pattern: [literal]{literal}[literal]

extension: .literal

literal: everything but =(){}"', and whitespace
```
