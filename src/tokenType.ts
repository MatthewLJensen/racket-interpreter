export enum TokenType {
    // Single-character tokens.
    LEFT_PAREN, RIGHT_PAREN, MINUS, PLUS, SLASH, STAR,

    //literals
    IDENTIFIER, NUMBER,

    // keywords
    DEFINE, ELSE, COND,

    EOF
}