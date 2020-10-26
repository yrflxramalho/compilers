const tokenTypes = {
  keyWords: ["program", "var", "integer", "real", "boolean", "procedure", "begin", "end", "if", "then", "else", "while", "do", "not"],  //ok
  delimiters: [";", ".", ":", "()", ","],   //ok
  identifiersRegex: /^[a-z][A-Za-z0-9_]*$/,
  integersRegex: /^[0-9]*$/,
  floatsRegex: /^[0-9]*[.][0-9]$/,
  assignmentCommands: ":=",  //ok
  relationalOperators: ["=", "<", ">", "<=", ">=", "<>"], //ok
  additiveOperators: ["+", "-", "or"],
  multiplicativeOperators: ["*", "/", "and"],
}

class SyntaxAnalysis {

  exceptions(token, func = null) {
    throw new Error(`unexpected token ${token.token} at line ${token.linha} in ${func}`);
  }

  nextToken() {
    this.cursor++;

    if (this.cursor === this.tokenTable.length) {
      return false;
    }
    this.currentToken = this.tokenTable[this.cursor];

    return this.tokenTable[this.cursor];
  }

  program() {
    if (this.currentToken.token === "program") {
      this.nextToken();
      if (this.currentToken.tipo === 'identificador') {
        this.nextToken();
        if (this.currentToken.token === ';') {
          this.nextToken();

          this.variablesDeclaration();
          // this.subprogramsDeclaration();
          this.compoundCommand();
          this.nextToken();
          if (this.currentToken.token === '.') {
            console.log("programa ok")
            return true;
          }
        } else {
          this.exceptions(this.currentToken);
        }
      } else {
        this.exceptions(this.currentToken);
      }
    } else {
      this.exceptions(this.currentToken);
    }
    return false;
  }

  variablesDeclaration() {
    if (this.currentToken.token === "var") {
      this.nextToken();
      this.declarationsList();
    }

  }

  declarationsList() {
    while (true) {
      if (this.identifiersList()) {
        if (this.currentToken.token === ':') {
          this.nextToken();
          if (this.currentToken.token === 'integer' || this.currentToken.token === 'real' || this.currentToken.token === 'boolean') {
            this.nextToken();
            if (this.currentToken.token === ';') {
              this.nextToken();
            }
          } else {
            this.exceptions(this.currentToken);
          }
        } else {
          this.exceptions(this.currentToken);
        }
      } else {
        break;
      }
    }
  }

  identifiersList() {

    let hasOne = false;
    while (1) {
      if (this.currentToken.tipo === 'identificador') {
        hasOne = true;
        this.nextToken();
        if (this.currentToken.token === ',') {
          this.nextToken();
        } else if (this.currentToken.token === ":") {
          break;
        } else {
          this.exceptions(this.currentToken);
        }
      } else {
        break;
      }
    }
    return hasOne;
  }

  subprogramsDeclaration() {

    if (this.currentToken.token === "procedure") {
      this.nextToken();

      if (this.currentToken.tipo === "identificador") {
        this.nextToken();

        if (this.currentToken.token === '(') {
          this.nextToken();
          this.paramsList();
          if (this.currentToken.token === ')') {
            this.nextToken();
          } else {
            this.exceptions(this.currentToken);
          }
        }

        if (this.currentToken.token === ";") {
          this.nextToken();
          if (this.variablesDeclaration()) {
            this.nextToken();
          }
        } else {
          this.exceptions(this.currentToken);
        }
      } else {
        this.exceptions(this.currentToken);
      }
    } else {
      return false;
    }
  }

  paramsList() {
    let ret = false;
    while (true) {
      if (this.declarationsList()) {

        this.nextToken();
        if (this.currentToken.token !== ";") {

          if (this.currentToken.token === ")") {

          } else {
            console.log("in the else")
            this.exceptions(this.currentToken);
          }
        }


      } else {
        break;
      }
    }

    return false;
  }

  compoundCommand() {
    if (this.currentToken.token === 'begin') {
      this.nextToken();
      this.optionalCommands();
      if (this.currentToken.token === 'end') {
        return true;
      } else {
        this.exceptions(this.currentToken);
      }
    } else {
      this.exceptions(this.currentToken);
    }
  }

  optionalCommands() {
    this.commandList();
  }

  commandList() {
    while (true) {
      if (this.command()) {
        if (this.currentToken.token === ';') {
          this.nextToken();
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  command() {
    if (this.currentToken.tipo === 'identificador') {
      this.nextToken();
      if (this.currentToken.token === ':=') {
        this.nextToken();
        
        if (this.expression()) {

          
          if (this.currentToken.token === ";") {
            return true;
          }else {
            this.exceptions(this.currentToken);  
          }
        } else {
          this.exceptions(this.currentToken);
        }
      } else {
        this.exceptions(this.currentToken);
      }

    }

    if (this.currentToken.token === "if") {
      this.nextToken();
     
      if(this.expression()) {
        
        this.nextToken();
        if(this.currentToken.token === "then") {
          this.nextToken();
          if (this.elsePart()) {
            return true;
          }else {
            this.exceptions(this.currentToken)
          }
        }
      }
    }


    return false;
  }

  elsePart() {
    console.log("else")
    return true;
  }

  expression() {
    if (this.simpleExpression()) {
      this.nextToken();

      if (this.relationalOperator()) {
        this.nextToken();
        if (this.simpleExpression()) {
          return true;
        } else {
          this.exceptions(this.currentToken);
        }
      }
      return true;
    } else {
      this.exceptions(this.currentToken);
    }
  }

  simpleExpression() {
   
    if (this.term()) {
      return true;
    }

    if (this.signal()) {
      this.nextToken();
      if (this.term()) {
        return true;
      } else {
        this.exceptions(this.currentToken);
      }
    }
   
    if (this.simpleExpression()) {
      this.nextToken();
      if (this.additiveOperators()) {
        this.nextToken();
        if (this.term()) {
          return true;
        } else {
          this.exceptions(this.currentToken);
        }
      } else {
        this.exceptions(this.currentToken);
      }
    }
    this.exceptions(this.currentToken);

  }
  
  term() {
   
    if(this.factor()) {
      return true;
    }
    if(this.term()) {
      this.nextToken();
     
      if(this.multiplicativeOperator()) {
        this.nextToken();
        if(this.factor()) {
          return true;
        }else {
          this.exceptions(this.currentToken);
        }
      }else {
        this.exceptions(this.currentToken);
      }
    }

    return false;
  }

  factor() {
    if (this.currentToken.tipo === "identificador") {
      return true;
    }
    if (this.currentToken.tipo === "inteiro") {
      return true;
    }
    if (this.currentToken.tipo === "boolean") {
      return true;
    }
    
    if (this.currentToken.token === "(") {
      this.nextToken();

      if(this.expression()) {

        if(this.currentToken.token === ')') {
          return true;
        }else {
          this.exceptions(this.currentToken);
        }
      }
      if(this.currentToken.token === ')') {
        return true;
      }else {
        this.exceptions(this.currentToken);
      }
      return true;
    }
    if (this.currentToken.token === 'not') {
      this.nextToken();
      if(this.factor()) {
        return true;
      }else {
        this.exceptions(this.currentToken);
      }
    }
    return false;
  }

  signal() {
    return (this.currentToken.token === '+' || this.currentToken.token === '-');
  }

  relationalOperator() {
    if (this.currentToken.token === "=") {
      this.nextToken();
      return true;
    }
    if (this.currentToken.token === "<") {
      this.nextToken();
      if (this.currentToken.token === "=" || this.currentToken.token === ">") {
        this.nextToken();
        return true;
      }
      return true;
    }
    if (this.currentToken.token === ">") {
      this.nextToken();
      if (this.currentToken.token === "=") {
        this.nextToken();
        return true;
      }
      return true;
    }

    return false;
  }

  additiveOperator() {
    return (this.currentToken.token === '+' || this.currentToken.token === '-' || this.currentToken.token === 'or');
  }

  multiplicativeOperator() {
    return (this.currentToken.token === '*' || this.currentToken.token === '/' || this.currentToken.token === 'and');
  }

  analizer() {
    let currentToken = this.nextToken();
    this.program(currentToken);
  }

  constructor(tokenTable) {
    this.currentToken = null;
    this.cursor = -1;
    this.tokenTable = tokenTable;
    this.errors = [];
  }

}

module.exports = { SyntaxAnalysis }
