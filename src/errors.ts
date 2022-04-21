export class RuntimeError extends Error {
  
    constructor(message: string) {
      super(message);
      Object.setPrototypeOf(this, RuntimeError.prototype)
    }
  }

  export class ParseError extends Error {
  
    constructor(message: string) {
      super(message);
      Object.setPrototypeOf(this, RuntimeError.prototype)
    }
  }