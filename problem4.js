function isOpeningBracket(ch) {
  return ch === "(" || ch === "[" || ch === "{";
}

function isClosingBracket(ch) {
  return ch === ")" || ch === "]" || ch === "}";
}

function matches(opening, closing) {
  return (
    (opening === "(" && closing === ")") ||
    (opening === "[" && closing === "]") ||
    (opening === "{" && closing === "}")
  );
}

function isValidBracketSequence(text) {
  if (typeof text !== "string") {
    return false;
  }

  const stack = new Array(text.length);
  let top = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (isOpeningBracket(ch)) {
      top++;
      stack[top] = ch;
      continue;
    }

    if (isClosingBracket(ch)) {
      if (top < 0) {
        return false;
      }

      if (!matches(stack[top], ch)) {
        return false;
      }

      top--;
    }
  }

  return top === -1;
}

console.log(isValidBracketSequence("()[]{}"));
console.log(isValidBracketSequence("t"));
console.log(isValidBracketSequence("([{}])"));
console.log(isValidBracketSequence("("));
console.log(isValidBracketSequence("[(])"));
console.log(isValidBracketSequence("{[}]"));
console.log(isValidBracketSequence("{[}]"));
