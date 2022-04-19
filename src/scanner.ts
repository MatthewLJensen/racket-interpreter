export class Scanner {
    private source: string

    constructor(source: string) {
        this.source = source
    }

    tokenize() {
        // converts program into a list of tokens
        return this.source.replace("(", " ( ").replace(")", " ) ").split(' ')
    }
}