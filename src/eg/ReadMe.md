The eg grammar is as follows:

```
statement: assignment
           expr

assignment: reference = expr

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

reference: everything but =()"', and whitespace
```
