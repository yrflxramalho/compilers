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

  nextToken() {
    this.cursor++;

    if (this.cursor === this.tokenTable.length) {
      return false;
    }
    this.currentToken = this.tokenTable[this.cursor];

    return this.tokenTable[this.cursor];
  }

  program() {
    if(this.currentToken.token === "program") {
      this.nextToken();
      if (this.currentToken.tipo === 'identificador') {
        this.nextToken();
        if (this.currentToken.token === ';') {
          this.nextToken();
          
          this.variablesDeclaration();
          this.subprogramsDeclaration();
          // this.compoundCommand();
          console.log("*****")
          console.log(this.currentToken)

          if (this.currentToken.token === '.') {
            return true;
          }
        }
      }
    }
    return false;
  }

  variablesDeclaration() {
    if (this.currentToken.token === "var") {
      this.nextToken()
      if(this.declarationsList()) {
        this.nextToken();
      }
    }
    return false;
  }
  
  declarationsList() {
    if(this.identifiersList()) {
      this.nextToken();
    }

    if (this.currentToken.token === ":") {
      this.nextToken();
     
      if (this.currentToken.token === "integer" || this.currentToken.token === "real" || this.currentToken.token === "boolean") {
        this.nextToken();
        if (this.currentToken.token === ";") {
          this.nextToken();
          this.declarationsList();
        }
      }
    }
    return false;
  }

  identifiersList() {
    if (this.currentToken.tipo === "identificador") {
      this.nextToken();
      if (this.currentToken.token === ",") {
        this.nextToken();
        this.identifiersList();
      }else {
        return false;
      }
    }
    return false;
  }

  subprogramsDeclaration() {
    console.log(this.currentToken)
    if (this.currentToken.token === "procedure") {
      console.log("proc")
      this.nextToken();

      if (this.currentToken.tipo === "identificador") {
        this.nextToken();
        if (this.paramsList()) {
          this.nextToken();
        }
      }else {
        //err
      }

      if(this.currentToken.token === ";") {
        console.log('to aqui');
      }
    }
  }

  paramsList() {
  
    if(this.currentToken.token === '(') {
      this.nextToken();
      if (this.declarationsList()) {
        this.nextToken();
      }
      if(this.currentToken.token === ')') {
        return true;
      }else{
        //error
        console.log("errrr")
      }
    }
    return false;
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
