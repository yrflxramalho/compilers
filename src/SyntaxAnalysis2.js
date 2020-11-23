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
    throw new Error(`unexpected token ${token.token} at line ${token.linha}`);
  }
  exceptionsExists(token, func = null) {
    throw new Error(`token ${token.token} already exists at line ${token.linha}`);
  }

  checkExists(token) {
    let flag = false;
    
    for (let i = this.stack.length-1; i >= 0; i--) {
      let ele = this.stack[i];
      if (ele.id === "$") {
        i=0;

      }else if (ele.id === token.token) {
        flag = true;
        i=0;
      }
    }
    return flag;
  }

  pushSimbol(token) {
    if (this.checkExists(token)) {
      this.exceptionsExists(token);
      return;
    }

    this.stack.push({
      padding: this.padding++,
      level: this.level,
      id: token.token,
      tipo: token.tipo,
    })
 
  }

  closeEscope(){
    let flag = true;
    while(flag){
      let ele = this.stack.pop();
      if (ele === undefined) {
        flag = false;
      }else if (ele.id === "$") {
        flag = false;
      }
    }
  }

  newEscope() {
    this.padding = 1;
    this.level ++;
    this.pushSimbol({token: "$", tipo: ""})
  }

  nextToken() {
    this.cursor++;

    if (this.cursor === this.tokenTable.length) {
      return false;
    }
    this.currentToken = this.tokenTable[this.cursor];

    return this.tokenTable[this.cursor];
  }
  backToken() {
    this.cursor--;

    if (this.cursor === this.tokenTable.length) {
      return false;
    }
    this.currentToken = this.tokenTable[this.cursor];

    return this.tokenTable[this.cursor];
  }

  analizer() {
    let currentToken = this.nextToken();
    console.log(this.program(currentToken));
    console.log(this.stack)
  }

  constructor(tokenTable) {
    this.currentToken = null;
    this.cursor = -1;
    this.tokenTable = tokenTable;
    this.errors = [];
    this.stack = [];
    this.level = 1;
    this.padding = 1;
    this.x = 0;
  }

  program(token) {
    if (token.token === "program") {
      this.newEscope();
      this.nextToken();
      if (this.currentToken.tipo === 'identificador') {
        //push
        this.pushSimbol(this.currentToken);
        this.nextToken();
        if (this.currentToken.token === ";") {
          this.nextToken();
        
          if( this.variblesDeclarations(this.currentToken)) {
            this.backToken();
          }
          
          if( this.subProcedures(this.currentToken)) {
            this.backToken();
          }

          if(this.compostCommand(this.currentToken)) {
            this.nextToken();
          }else {
            this.exceptions(this.currentToken)
          }

          if (this.currentToken.token === '.') {
            return true;
          }else {
            this.exceptions(this.currentToken)
          }
        }else {
          this.exceptions(this.currentToken)
        }
      }else{
        this.exceptions(this.currentToken)
      }
    }
    return false;
  }

  subProcedures(token) {
    return this.subProcedureDeclaration(token);
  }

  arguments(token) {
    if (token.token === '(') {
     
      this.nextToken();
      if (this.listParams(this.currentToken)) {
       
        if (this.currentToken.token === ')') {
          this.nextToken();
          return true;
        }
      }else {
        this.exceptions(this.currentToken)
      }
    }

    return true;
  }

  listParams(token) {
    if(this.listIdentifiers(token)) {
      return true;
    }
    this.nextToken();
    return false;
  }  

  subProcedureDeclaration(token) {
    if (token.token === "procedure") {
      this.nextToken();
      if (this.currentToken.tipo === "identificador") {
        this.pushSimbol(this.currentToken);
        this.newEscope();
       
        this.nextToken();
        if (this.arguments(this.currentToken)) {
          if (this.currentToken.token === ";") {
            this.nextToken();
            if( this.variblesDeclarations(this.currentToken)) {
              this.backToken();
            }
            if(this.compostCommand(this.currentToken)) {
              this.nextToken();
            }else {
              this.exceptions(this.currentToken)
            }
            
            return true;
          }

        }else {
          this.exceptions(this.currentToken)
        }
      }else{
        this.exceptions(this.currentToken)
      }
    }

    return false;
  }

  variblesDeclarations(token) {
    if (token.token === "var") {
      this.nextToken();
      if (this.listVariableDeclaration(this.currentToken)) {
        return true;
      }else {
        this.exceptions(this.currentToken);
      }
      
    }
    return false;
  }

  listVariableDeclaration(token) {
    if (this.listIdentifiers(token)) {
      if (this.currentToken.token === ":") {
        this.nextToken();
        if (this.type(this.currentToken)) {
          this.nextToken();
          if (this.currentToken.token === ";") {
            this.nextToken();
            if (this.listVariableDeclaration(this.currentToken)) {
              return true;
            }else {
              this.nextToken();
              return true;
            }
          }
        }else {
          this.exceptions(this.currentToken)
        }
      }
    }

    return false;
  }

  listIdentifiers(token) {
    if(token.tipo === "identificador") {
      if (this.x === 0) {
        this.pushSimbol(this.currentToken)
      }else {
        if(!this.checkExists(this.currentToken)){
          this.exceptionsExists(this.currentToken);
        };  
      }
      this.nextToken();
      if(this.currentToken.token === ",") {
        this.nextToken();
        if(this.listIdentifiers(this.currentToken)) {
          return true;
        }else {
          this.exceptions(this.currentToken);
        }

      }
      return true;
    }

    return false;
  }

  type(token) {
    return (token.token === "integer" || token.token === "real" || token.token === "boolean")
  }

  procedureActivation(token) {
    if (token.tipo === "identificador") {
      this.nextToken();
      
      if (this.currentToken.token === "(") {
        this.nextToken();
        if (this.currentToken.token === ")") {
          this.nextToken();
          return true;
        }

        if (this.expressionList(this.currentToken)) {
          if (this.currentToken.token === ")") {
            
            this.nextToken();
            return true;
          }else {
            this.exceptions(this.currentToken);
          }
        }else {
          this.exceptions(this.currentToken);
        }
      }else {
        this.backToken();
        return false;
      }
    }
    return false;
  }

  listCommand(token) {
    if (this.command(token)) {
      if (this.currentToken.token === ";") {
        this.nextToken();
        if (this.listCommand(this.currentToken)) {
          return true;
        }else {
          return false;
        };
      }else {
        this.exceptions(this.currentToken);
      }
    }

    return false;
  }

  optionalCommands(token) {
    this.listCommand(token);
  }

  compostCommand(token) {
    if (token.token === "begin") {
      this.x == 1;
      this.nextToken();
      this.optionalCommands(this.currentToken);
      if (this.currentToken.token === "end") {
        this.x == 0;
        this.closeEscope();
        this.nextToken();
        return true;
      }else {
        this.exceptions(this.currentToken);
      }

    }
    return false;
  }
  
  command(token) {
    //procedureActivation
    if (this.procedureActivation(token)) {
      return true; 
    }

    //varible
    if (this.variable(token)) {
      this.nextToken();
      if (tokenTypes.assignmentCommands === this.currentToken.token) {
        this.nextToken();
        if (this.expression(this.currentToken)) {
          return true;
        }else {
          this.exceptions(this.currentToken);
        }
      }else{
        this.exceptions(this.currentToken);
      }
      return true;
    }

    //compostCommand
    if (this.compostCommand(token)) {
      this.nextToken();
      return true;
    }

    if (token.token === "if") {
      this.nextToken();
      if (this.expression(this.currentToken)) {
        if (this.currentToken.token === "then") {
          this.nextToken();
          if (this.command(this.currentToken)) {
            // this.nextToken();
            this.elsePart(this.currentToken);
            return true;
          }
        }else {
          this.exceptions(this.currentToken);
        }
      }
    }

    //while
    if (token.token === "while") {
      this.nextToken();
      if (this.expression(this.currentToken)) {
        if (this.currentToken.token === "do") {
          this.nextToken();
          if (this.command(this.currentToken)) {
            return true;
          }
        }else {
          this.exceptions(this.currentToken);
        }
      }
    }


    return false;
  }

  elsePart(token) {
    if (token.token === "else") {
      this.nextToken();
      if (this.command(this.currentToken)) {
        this.nextToken();
        return true;
      }else {
        this.exceptions(this.currentToken);
      }

    }
    return true;
  }

  variable(token) {
    if (token.tipo !== "identificador") {
      return false;
    }

    if (!this.checkExists(token)){

      this.exceptions(token);
    }

    return true;
  }

  opMultiplicative(token){
    return tokenTypes.multiplicativeOperators.includes(token.token);
  } 

  opAditive(token){
    return tokenTypes.additiveOperators.includes(token.token);
  } 

  opRelational(token){
    return tokenTypes.relationalOperators.includes(token.token);
  } 

  factor(token) {
    if (token.token === "true" || token.token === "false") {
      this.nextToken();
      return true;
    } 

    if (token.token === "not") {
      if (this.factor(this.nextToken())){
        this.nextToken();
        return true;
      };
    } 

    if (token.tipo === "inteiro" || token.tipo === "ponto flutuante") {
      this.nextToken();
      return true;
    }

    if (token.tipo === "identificador") {
      if (!this.checkExists(this.currentToken)) {
        
        this.exceptions(this.currentToken);
      }

      this.nextToken();
      
      if (this.currentToken.token === "(") {
        this.nextToken();
        
        if (this.currentToken.token === ")") {
          this.nextToken();
          return true;
        }

        if (this.expressionList(this.currentToken)) {
          if (this.currentToken.token === ")") {
            
            this.nextToken();
            return true;
          }else {
            this.exceptions(this.currentToken);
          }
        }else {
          this.exceptions(this.currentToken);
        }
      }else {
        return true;
      }
    }
    if (token.token === "(") {
      this.nextToken();
      if (this.expression(this.currentToken)) {
        if (this.currentToken.token === ")") {
          this.nextToken();
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

  expressionList(token) {
    if (this.expression(token)) {
      if (this.currentToken.token === ",") {
        this.nextToken();
        if (this.expressionList(this.currentToken)) {
          return true;
        }else {
          this.exceptions(this.currentToken);
        }
      }
      return true;
    }

    return false;
  }

  expression(token) {
    if (this.simpleExpression(token)) { 
      if (this.opRelational(this.currentToken)) {
        this.nextToken();
        if (this.simpleExpression(this.currentToken)) {
          // this.nextToken();
          return true;
        }else {
          this.exceptions(this.currentToken);
        }
      }
      return true; 
    }
    this.nextToken();
    return false;
  }

  signal(token) {
    return (token.token === "+" || token.token === "-");
  }

  simpleExpression(token) {
    if (this.term(token)) {
    
      if (this.signal(this.currentToken)) {
        this.nextToken();
        if (this.simpleExpression(this.currentToken)) {
          return true;
        }else {
          this.exceptions(this.currentToken);
        }
      }
  
      return true;
    }
    return false;
  }

  term(token) {
    if (this.factor(token)) {
      if (this.opMultiplicative(this.currentToken)) {
        this.nextToken();
        if(this.term(this.currentToken)) {
          return true;
        }else {
          this.exceptions(this.currentToken)
        }
      }
      return true;
    }
  
    return false;
  }

}

module.exports = { SyntaxAnalysis }
