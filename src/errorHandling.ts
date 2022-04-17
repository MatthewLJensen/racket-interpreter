import { RuntimeError } from './runtimeError';
import { TokenType } from './tokenType';
import { Token } from './token';


let hadError: boolean = false
export let hadRuntimeError: boolean = false

export function error(line: number, message: string) {
    report(line, "", message)
}

export function runtimeError(error: RuntimeError) {
    console.log(error.message + "\n[line " + error.token.line + "]") // hopefully message is the right alternative for .getMessage in Java
    hadRuntimeError = true;
}

function report(line: number, where: string, message: string) {
    console.log(`[line ${line}] Error ${where}: ${message}`)
    hadError = true
}

export function tokenError(token: Token, message: string) {
    if (token.type == TokenType.EOF) {
        report(token.line, "at end", message)
    } else {
        report(token.line, "at '" + token.lexeme + "'", message)
    }
}

export function setHadError(value: boolean) {
    hadError = value
}

export function getHadError(): boolean {
    return hadError
}