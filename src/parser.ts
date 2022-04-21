import { ParseError } from "./errors"

//Parser is somewhat translated from http://norvig.com/lispy.html
export class Parser {
    private tokens: string[]

    constructor(tokens: string[]) {
        this.tokens = ['(', ...tokens, ')']
    }

    // returns type of any because the depth of the returned syntax tree is unknown. If its recursion is at the bottom, it will return a string or a number
    parse(tokens_to_parse: string[] = this.tokens): any[] | string | number {
        if (tokens_to_parse.length === 0) {
            throw new ParseError("Unexpected end of input")
        }


        let token: string = tokens_to_parse.shift()! //the ! postfix operator is used to force the compiler to treat the value as non-nullable

        if (token === "(") {
            let inner_tokens = []
            while (tokens_to_parse[0] !== ")")
                inner_tokens.push(this.parse(tokens_to_parse))
            tokens_to_parse.shift() // this removes the trailing ")"
            return inner_tokens
        }
        else if (token === ")") {
            throw new ParseError("Error: unexpected ')'")
        }
        else
            return this.identifier(token)
    }

    identifier(token: string): string | number {
        if (isNaN(Number(token))) {
            return token
        } else {
            return parseFloat(token)
        }
    }
}

