import { TokenType } from './tokenType'

export class Token {
    type: TokenType
    lexeme: string
    literal: any
    line: number

    constructor(type: TokenType, lexeme: string, literal: any = null, line: number){
        this.type = type
        this.lexeme = lexeme
        this.literal = literal
        this.line = line
    }

    public toString() {
        return TokenType[this.type] + " " + this.lexeme + " " + this.literal
    }
}