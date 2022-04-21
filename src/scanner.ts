export class Scanner {
    private source: string

    constructor(source: string) {
        // remove line breaks and tabs
        this.source = source.replace(/[\n\r\t]/g, "")
    }

    tokenize(): string[] {
        // converts program into a list of tokens
        // add spaces to parentheses, split on spaces, remove empty strings because they evaluate to false in the filter
        return this.source.replaceAll("(", " ( ").replaceAll(")", " ) ").split(" ").filter(Boolean)
    }
}