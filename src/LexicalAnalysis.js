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

class LexicalAnalysis {

  removeComments() {
    let code = this.programCode;

    const commentRegex = /{[^}]*}/g;

    code = code.replace(commentRegex, '');

    if (code.indexOf('{') > 0) {
      if (code.indexOf('}') < 0) {
        this.errors.push({
          error: `Invalid or unexpected token in line ${code.indexOf('{')}`
        })
      }
    }
    this.programCode = code;
  }

  checkDelimiters(token, index) {

    tokenTypes.delimiters.forEach(delimiter => {
      while (token.indexOf(delimiter) !== -1) {
        this.codeArray.push({
          token: delimiter,
          index,
        })
        token = token.replace(delimiter, "")
      }
    })

    return token;
  }

  filter() {
    this.removeComments();

    //separa linhas
    let splitedCode = this.programCode.replace('\t', '').split('\r\n');

    splitedCode.forEach((line, index) => {
      line.split(' ').forEach(token => {

        if (token.trim() !== "") {

          //check delimiters
          token = this.checkDelimiters(token, index)

          this.codeArray.push({
            token,
            index,
          })
        }
      })
    })

  }

  addToken(token, keyWord) {
    this.tokenTable.push({
      token: token.token,
      linha: token.index +1,
      tipo: keyWord
    })
  }

  analizerKeywords(token) {
    
    for (let keyWord of tokenTypes.keyWords) {
      if (token.token === keyWord) {
        this.addToken(token, "palavra reservada")
        return true;    
      }
    }
    return false;
  }

  analizerDelimiters(token) {
    //check keywords
    for (let delimiter of tokenTypes.delimiters) {
      if (token.token === delimiter) {
        this.addToken(token, "delimitador")
        return true;
      }
    }
    return false;
  }

  analizerAssingnment(token) {
    //check keywords
    if (token === tokenTypes.assignmentCommands) {
      this.addToken(token, "operador de atribuição");
      return true;
    }
    return false;
  }

  analizerAdditiveOperators(token) {
    //check keywords
    for (let additiveOperator of tokenTypes.additiveOperators) {
      if (token.token === additiveOperator) {
        this.addToken(token, "operador de adição")
        return true;
      }
    }
    return false;
  }

  analizerMultiplicativeOperators(token) {
    //check keywords
    for (let multiplicativeOperator of tokenTypes.multiplicativeOperators) {
      if (token.token === multiplicativeOperator) {
        this.addToken(token, "operador de multiplicação")
        return true;
      }
    }
    return false;
  }

  analizerRelationalOperators(token) {
    //check keywords
    for (let relacional of tokenTypes.relationalOperators) {
      if (token.token === relacional) {
        this.addToken(token, "operador relacional")
        return true;
      }
    }
    return false;
  }

  analizerIdentifiers(token) {
    if(tokenTypes.identifiersRegex.test(token.token)) {
      this.addToken(token, "identificador")
        return true;
    }
    return false;
  }

  analizerNumber(token) {
    if(tokenTypes.integersRegex.test(token.token)) {
      this.addToken(token, "inteiro")
        return true;
    }
    if(tokenTypes.floatsRegex.test(token.token)) {
      this.addToken(token, "ponto flutuante")
        return true;
    }
    return false;
  }

  analizer() {

    //filter and remove comments 
    this.filter();

    this.codeArray.forEach(token => {
      
      if (this.analizerKeywords(token)) return;
      if (this.analizerDelimiters(token)) return;
      if (this.analizerAssingnment(token)) return;
      if (this.analizerRelationalOperators(token)) return;
      if (this.analizerAdditiveOperators(token)) return;
      if (this.analizerMultiplicativeOperators(token)) return;
      if (this.analizerIdentifiers(token)) return;
      
      this.errors.push({
        error: `Invalid or unexpected token in line ${token.index + 1}`
      })
    })

    console.log(this.tokenTable)
    console.log(this.errors)
    return "";
  }


  constructor(programCode) {
    this.programCode = programCode;
    this.errors = [];
    this.codeArray = [];
    this.tokenTable = [];
  }

}

module.exports = { LexicalAnalysis }
