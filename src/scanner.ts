export class Scanner {
    private source: string

    constructor(source: string) {
        this.source = source
    }

    tokenize() {
        // converts program into a list of tokens
        // add spaces to parentheses, split on spaces, remove empty strings because they evaluate to false in the filter
        return this.source.replaceAll("(", " ( ").replaceAll(")", " ) ").split(" ").filter(Boolean)
    }
}