// Define equals as a function so that if someone executes an assignment
// statement, the result will be the value of the right-hand side.
export default function equals(left, right) {
  return right;
}

equals.usage = `=(name, value)\tReturns value`;
