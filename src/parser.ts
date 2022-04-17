import { Token } from "./token"
import { TokenType } from "./tokenType"
import { Expr, Grouping, Literal, Unary, Binary, Ternary, Variable, Assign, Logical, Call, Get, Set, This, Super } from "./expr"
import { Stmt, Print, Expression, Var, Block, If, While, Break, Continue, Exit, For, Switch, Func, Return, Class } from "./stmt"
import { tokenError } from "./errorHandling"

class ParseError extends Error {
    constructor(message?: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}
export class Parser {
    private tokens: Token[]
    private current: number = 0
    private allowExpression: boolean = false
    private foundExpression: boolean = false
    private loopDepth: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    private expression(): Expr {
        return this.assignment()
    }

    private declaration(): Stmt {
        try {
            if (this.match(TokenType.CLASS)) return this.classDeclaration()
            if (this.match(TokenType.FUN)) return this.function("function")
            if (this.match(TokenType.VAR)) return this.varDeclaration();
            return this.statement()
        } catch (error) {
            if (error instanceof ParseError) {
                this.synchronize()
                return null as any
            } else {
                throw error
            }
        }
    }

    private classDeclaration(): Stmt {
        let name: Token = this.consume(TokenType.IDENTIFIER, "Expect class name.");

        let superclass: Variable = null as any
        if (this.match(TokenType.LESS)) {
            this.consume(TokenType.IDENTIFIER, "Expect superclass name.");
            superclass = new Variable(this.previous());
        }

        this.consume(TokenType.LEFT_BRACE, "Expect '{' before class body.");

        let methods: Func[] = []
        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            methods.push(this.function("method"));
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body.");

        return new Class(name, superclass, methods);
    }


    private statement(): Stmt {
        if (this.match(TokenType.EXIT)) return this.exitStatement()
        if (this.match(TokenType.BREAK)) return this.breakStatement()
        if (this.match(TokenType.CONTINUE)) return this.continueStatement()
        if (this.match(TokenType.FOR)) return this.forStatement()
        if (this.match(TokenType.SWITCH)) return this.switchStatement()
        if (this.match(TokenType.IF)) return this.ifStatement()
        if (this.match(TokenType.PRINT)) return this.printStatement()
        if (this.match(TokenType.RETURN)) return this.returnStatement()
        if (this.match(TokenType.WHILE)) return this.whileStatement()
        if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block())
        return this.expressionStatement()
    }



    private or(): Expr {
        let expr: Expr = this.and();

        while (this.match(TokenType.OR)) {
            const operator: Token = this.previous();
            const right: Expr = this.and();
            expr = new Logical(expr, operator, right);
        }

        return expr;
    }

    private and(): Expr {
        let expr: Expr = this.ternaryConditional()

        while (this.match(TokenType.AND)) {
            const operator: Token = this.previous();
            const right: Expr = this.equality();
            expr = new Logical(expr, operator, right);
        }

        return expr;
    }

    private ifStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
        const condition: Expr = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

        const thenBranch: Stmt = this.statement();
        let elseBranch: Stmt = null as any;
        if (this.match(TokenType.ELSE)) {
            elseBranch = this.statement();
        }

        return new If(condition, thenBranch, elseBranch);
    }

    private printStatement(): Stmt {
        let value: Expr = this.expression()
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.")
        return new Print(value)
    }

    private returnStatement(): Stmt {
        let keyword: Token = this.previous();
        let value: Expr = null as any;
        if (!this.check(TokenType.SEMICOLON)) {
            value = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after return value.");
        return new Return(keyword, value);
    }

    private varDeclaration(): Stmt {
        const name: Token = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

        let initializer: Expr = null as any;
        if (this.match(TokenType.EQUAL)) {
            initializer = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
        return new Var(name, initializer);
    }

    // this no longer desugarizes to a while loop
    private forStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");
        let initializer: Stmt
        if (this.match(TokenType.SEMICOLON)) {
            initializer = null as any;
        } else if (this.match(TokenType.VAR)) {
            initializer = this.varDeclaration();
        } else {
            initializer = this.expressionStatement();
        }

        let condition: Expr = null as any;
        if (!this.check(TokenType.SEMICOLON)) {
            condition = this.expression();
        }
        this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

        let increment: Expr = null as any;
        if (!this.check(TokenType.RIGHT_PAREN)) {
            increment = this.expression();
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

        try {
            this.loopDepth++

            let body: Stmt = this.statement();


            if (condition == null)
                condition = new Literal(true);

            // the weird ternary is to send null to the incrementer if it's not there
            body = new For(condition, body, (increment) ? new Expression(increment) : increment, initializer);

            return body;
        } catch (error) {
            throw error
        } finally {
            this.loopDepth--
        }

    }

    private whileStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
        const condition: Expr = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");

        try {
            this.loopDepth++;
            const body: Stmt = this.statement();
            return new While(condition, body);
        } catch (error) {
            throw error
        } finally {
            this.loopDepth--
        }

    }

    private breakStatement(): Stmt {
        if (this.loopDepth == 0) {
            this.error(this.previous(), "'break' is only allowed in a loop.");
        }
        this.consume(TokenType.SEMICOLON, "Expect ';' after 'break'.");
        return new Break();
    }

    private continueStatement(): Stmt {
        if (this.loopDepth == 0) {
            this.error(this.previous(), "'continue' is only allowed in a loop.");
        }
        this.consume(TokenType.SEMICOLON, "Expect ';' after 'continue'.");
        return new Continue();
    }

    private switchStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'switch'.");
        const expression: Expr = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after switch target.");

        let cases: Array<(Stmt | Expr)>[] = [];
        let defaultCase: Stmt = null as any;

        //let body = this.statement();
        this.consume(TokenType.LEFT_BRACE, "Expect '{' after switch and target.");
        while (!this.check(TokenType.RIGHT_BRACE) && !this.check(TokenType.DEFAULT) && !this.isAtEnd()) {
            cases.push(this.Case());
        }
        if (this.check(TokenType.DEFAULT)) {
            defaultCase = this.Default()
        }

        // To match Prof. O's required errors
        if (this.check(TokenType.DEFAULT)) {
            this.error(this.peek(), "Only 1 default branch allowed.")
            this.Default()
        }
        if (this.check(TokenType.CASE)) {
            this.error(this.peek(), "'default' must be the last branch.")
            this.Case()
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after all cases.");
        return new Switch(expression, cases, defaultCase)
    }

    private Case(): Array<(Expr | Stmt)> {
        if (this.match(TokenType.CASE)) {
            const condition: Expr = this.expression();
            this.consume(TokenType.COLON, "Expect ':' after case expression.");
            const body: Stmt = this.statement();
            return [condition, body];
        } else {
            this.error(this.peek(), "Every branch of switch must begin with 'case' or 'default'.");
            this.statement()
            return null as any;
        }
    }

    private Default(): Stmt {
        if (this.match(TokenType.DEFAULT)) {
            this.consume(TokenType.COLON, "Expect ':' after 'default'.");
            const body: Stmt = this.statement();
            return body;
        } else {
            throw this.error(this.peek(), "Expect 'case' or 'default' after 'switch'.");
            return null as any;
        }
    }

    private exitStatement(): Stmt {
        this.consume(TokenType.SEMICOLON, "Expect ';' after 'exit'."); // I just removed the quotation marks. Not sure why Prof. O doesn't want them in his test on github, but the output file does want them.
        return new Exit();
    }

    private expressionStatement(): Stmt {
        let expr: Expr = this.expression()
        if (this.allowExpression && this.isAtEnd()) {
            this.foundExpression = true;
        } else {
            this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        }
        return new Expression(expr);
    }

    private function(kind: string): Func {
        let name: Token = this.consume(TokenType.IDENTIFIER, "Expect " + kind + " name.");
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after " + kind + " name.");
        let parameters: Token[] = []
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if (parameters.length >= 255) {
                    this.error(this.peek(), "Can't have more than 255 parameters.");
                }
                parameters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");
        this.consume(TokenType.LEFT_BRACE, "Expect '{' before " + kind + " body.");
        let body: Stmt[] = this.block();
        return new Func(name, parameters, body);
    }

    private block(): Stmt[] {
        let statements: Stmt[] = []

        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
        return statements;
    }

    private assignment(): Expr {
        let expr: Expr = this.or();

        if (this.match(TokenType.EQUAL)) {
            const equals: Token = this.previous();
            const value: Expr = this.assignment();

            if (expr instanceof Variable) {
                let name: Token = (expr as Variable).name;
                return new Assign(name, value);
            } else if (expr instanceof Get) {
                let get: Get = expr as Get;
                return new Set(get.object, get.name, value)
            }

            this.error(equals, "Invalid assignment target."); // what number should equals be?
        }

        return expr;
    }

    private ternaryConditional(): Expr {
        let expr: Expr = this.equality()

        if (this.match(TokenType.QUESTION)) {
            let left: Expr = this.ternaryConditional()
            if (this.match(TokenType.COLON)) {
                let right: Expr = this.ternaryConditional()
                return new Ternary(expr, left, right)
            } else {
                throw this.error(this.peek(), "Expect '?' to have matching ':'.")
            }
        }
        return expr
    }

    private equality(): Expr {
        let expr: Expr = this.comparison()

        while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            let operator: Token = this.previous()
            let right: Expr = this.comparison()
            expr = new Binary(expr, operator, right)
        }

        return expr

    }

    private comparison(): Expr {
        let expr: Expr = this.term()

        while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            const operator: Token = this.previous()
            const right: Expr = this.term()
            expr = new Binary(expr, operator, right)
        }
        return expr
    }

    private term(): Expr {
        let expr: Expr = this.factor()

        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
            const operator: Token = this.previous()
            const right: Expr = this.factor()
            expr = new Binary(expr, operator, right)
        }

        return expr
    }

    private factor(): Expr {
        let expr: Expr = this.unary()
        while (this.match(TokenType.SLASH, TokenType.STAR)) {
            const operator: Token = this.previous()
            const right: Expr = this.unary()
            expr = new Binary(expr, operator, right)
        }
        return expr
    }

    private unary(): Expr {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator: Token = this.previous()
            const right: Expr = this.unary()
            return new Unary(operator, right)
        }

        return this.call()
    }

    private call(): Expr {
        let expr: Expr = this.primary()

        while (true) {
            if (this.match(TokenType.LEFT_PAREN)) {
                expr = this.finishCall(expr)
            } else if (this.match(TokenType.DOT)) {
                const name: Token = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
                expr = new Get(expr, name)
            } else {
                break
            }
        }
        return expr
    }

    private finishCall(callee: Expr): Expr {
        let args: Expr[] = []
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if (args.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 arguments.");
                }
                args.push(this.expression())
            } while (this.match(TokenType.COMMA))
        }
        let paren: Token = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

        return new Call(callee, paren, args)
    }

    private primary(): Expr {
        if (this.match(TokenType.FALSE)) return new Literal(false)
        if (this.match(TokenType.TRUE)) return new Literal(true)
        if (this.match(TokenType.NIL)) return new Literal(null as any)

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Literal(this.previous().literal)
        }

        if (this.match(TokenType.SUPER)) {
            let keyword: Token = this.previous();
            this.consume(TokenType.DOT, "Expect '.' after 'super'.");
            let method: Token = this.consume(TokenType.IDENTIFIER, "Expect superclass method name.");
            return new Super(keyword, method);
        }

        if (this.match(TokenType.THIS)) return new This(this.previous())

        if (this.match(TokenType.IDENTIFIER)) {
            return new Variable(this.previous());
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            const expr = this.expression()
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
            return new Grouping(expr)
        }

        throw this.error(this.peek(), "Expect expression.")

    }

    parse(): Stmt[] {
        let statements: Stmt[] = []
        while (!this.isAtEnd()) {
            statements.push(this.declaration())
        }
        return statements
    }

    parseRepl(): Object {
        this.allowExpression = true
        let statements: Stmt[] = []
        while (!this.isAtEnd()) {
            statements.push(this.declaration());

            if (this.foundExpression) {
                let last: Stmt = statements[statements.length - 1]
                return (last as Expression).expression;
            }

            this.allowExpression = false;
        }

        return statements;
    }

    private match(...types: TokenType[]): boolean | undefined {
        for (let type of types) {
            if (this.check(type)) {
                this.advance()
                return true
            }
        }
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false
        return this.peek().type == type
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++
        return this.previous()
    }

    private isAtEnd(): boolean {
        return this.peek().type == TokenType.EOF
    }

    private peek(): Token {
        return this.tokens[this.current]
    }

    private previous(): Token {
        return this.tokens[this.current - 1]
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance()
        throw this.error(this.peek(), message)
    }

    private error(token: Token, message: string): Error {
        tokenError(token, message)
        return new ParseError()
    }

    private synchronize() {
        this.advance()

        while (!this.isAtEnd()) {
            if (this.previous().type == TokenType.SEMICOLON) return // this is returning early because it sees a semicolon, so it returns and is met with a closing bracket.

            switch (this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                case TokenType.SWITCH:
                    //case TokenType.DEFAULT: // hopefully this doesn't break anything
                    return
            }
            this.advance()
        }
    }
}

