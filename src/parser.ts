export class Parser {
    private tokens: string[]

    constructor(tokens: string[]) {
        this.tokens = tokens
    }

    parse() {
        // read the tokens and build the AST
        return this.program(this.tokens)
    }

    program(tokens_to_parse: string[]): any {
        if (tokens_to_parse.length === 0) {
            console.log("ERROR: unexpected end of program")
            return null
        }

        let token: string = tokens_to_parse.shift() as any

        if (token === "(") {
            let inner_tokens = []
            while (tokens_to_parse[0] !== ")")
                inner_tokens.push(this.program(tokens_to_parse))
            tokens_to_parse.shift() // remove the ")"
            return inner_tokens
        }
        else if (token === ")") {
            console.log("ERROR: unexpected )")
            return null
        }
        else
            return this.identifier(token)
    }

    identifier(token: string | any) {
        if (isNaN(token)) {
            return token
        } else {
            return parseFloat(token)
        }
    }
}

