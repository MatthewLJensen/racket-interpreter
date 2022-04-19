//Parser is somewhat translated from http://norvig.com/lispy.html
export class Parser {
    private tokens: string[]

    constructor(tokens: string[]) {
        this.tokens = tokens
    }

    parse(tokens_to_parse: string[] = this.tokens): any {
        if (tokens_to_parse.length === 0) {
            console.log("ERROR: unexpected end of program")
            return null
        }

        let token: string = tokens_to_parse.shift() as any
        let parse_array: any[] = []

        if (token === "(") {
            let {inner_tokens, shortened_tokens} = this.grouping(tokens_to_parse)
            console.log(inner_tokens)
            console.log(shortened_tokens)
            parse_array.push(inner_tokens)
            tokens_to_parse = shortened_tokens as any
            if (tokens)
        }
        else if (token === ")") {
            console.log("ERROR: unexpected )")
            return null
        }
        else
            return this.identifier(token)
    }

    grouping(tokens_to_parse: string[]) {
        let inner_tokens = []
        while (tokens_to_parse[0] !== ")")
            inner_tokens.push(this.parse(tokens_to_parse))
        let shortened_tokens = tokens_to_parse.shift() // remove the ")"
        return {inner_tokens, shortened_tokens}
    }

    identifier(token: string | any) {
        if (isNaN(token)) {
            return token
        } else {
            return parseFloat(token)
        }
    }
}

