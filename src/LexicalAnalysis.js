const tokenTypes = {
  keyWords: ["program", "var", "integer", "real", "boolean", "procedure", "begin", "end", "if", "then", "else", "while", "do", "not"],  //ok
  delimiters: [";", ".", ":", "(", ")", ","],   //ok
  identifiersRegex: /^[A-za-z][A-Za-z0-9_]*$/,
  integersRegex: /^[0-9]*$/,
  floatsRegex: /^[0-9]*[.][0-9]$/,
  assignmentCommands: ":=",  //ok
  relationalOperators: ["=", "<", ">", "<=", ">=", "<>"], //ok
  additiveOperators: ["+", "-", "or"],
  multiplicativeOperators: ["*", "/"],
  multiplicativeAnd: ["and"],
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

  filter() {
    this.removeComments();
  }

  addToken(token, keyWord, line) {
    this.tokenTable.push({
      token: token,
      linha: line + 1,
      tipo: keyWord
    })
  }

  analizerKeywords(token, line) {

    for (let keyWord of tokenTypes.keyWords) {
      if (token === keyWord) {
        this.addToken(token, "palavra reservada", line)
        return true;
      }
    }
    return false;
  }

  analizerAdditiveOperators(token, line) {
    //check keywords
    for (let additiveOperator of tokenTypes.additiveOperators) {
      if (token === additiveOperator) {
        this.addToken(token, "operador de adição", line)
        return true;
      }
    }
    return false;
  }

  analizerMultiplicativeAnd(token, line) {
    //check keywords
    if (token === tokenTypes.multiplicativeAnd) {
      this.addToken(token, "operador de multiplicação", line)
      return true;
    }

    return false;
  }

  analizerRelationalOperators(token, line) {
    //check keywords
    for (let relacional of tokenTypes.relationalOperators) {
      if (token === relacional) {
        this.addToken(token, "operador relacional", line)
        return true;
      }
    }
    return false;
  }

  analizerIdentifiers(token, line) {
    if (tokenTypes.identifiersRegex.test(token)) {
      this.addToken(token, "identificador", line)
      return true;
    }
    return false;
  }

  analizerNumber(token, line) {
    if (tokenTypes.integersRegex.test(token)) {
      this.addToken(token, "inteiro", line)
      return true;
    }
    if (tokenTypes.floatsRegex.test(token)) {
      this.addToken(token, "ponto flutuante", line)
      return true;
    }
    return false;
  }

  checkWord(token, line) {

    if (token.trim() === "" || token === "\n") return

    if (this.analizerKeywords(token, line)) return;
    if (this.analizerIdentifiers(token, line)) return;
    if (this.analizerMultiplicativeAnd(token, line)) return;
    if (this.analizerNumber(token, line)) return;

    this.errors.push({
      error: `Invalid or unexpected token [${token}] in line ${line}`
    })
  }

  analizer() {

    //filter and remove comments 
    this.filter();

    let splitedCode = this.programCode.replace('\t', '').split('\n');

    splitedCode.forEach((line, index) => {
      let initWord = 0;
      line = line.replace("\r", "");

      for (let i = 0; i < line.length; i++) {

        if (line[i] === " ") {
          let previousToken = line.slice(initWord, i);
          initWord = i + 1;
          this.checkWord(previousToken, index);
          continue;
        }

        //check numbers;
        //1*3;

        if (tokenTypes.integersRegex.test(line[i]) && initWord === i ) {
          let initNumber = i;
          while(tokenTypes.integersRegex.test(line[i]) || line[i] === ".") {
            i++;
          }
          let previousToken = line.slice(initNumber, i);
         
          if(this.analizerNumber(previousToken, index)) {
            initWord = i--;
            initWord = i + 1;
            continue;
          }
        }

        if (tokenTypes.delimiters.indexOf(line[i]) > -1) {
          let previousToken = line.slice(initWord, i);
          this.checkWord(previousToken, index);
         

          if (line[i] === ":" && i !== line.length - 1) {
            if (line[i + 1] === "=") {
              this.addToken(":=", "delimitador", index)
              initWord = i + 2;
              i++;
              continue;
            }
          }
          
          this.addToken(line[i], "delimitador", index)
          initWord = i + 1;
          continue;
        }

        if (tokenTypes.relationalOperators.indexOf(line[i]) > -1) {
          let previousToken = line.slice(initWord, i);
          this.checkWord(previousToken, index);

          if ((line[i] === "<" || line[i] === ">") && i !== line.length - 1) {
            if (line[i + 1] === "=" || line[i + 1] === ">") {
              this.addToken(line[i] + line[i + 1], "operador relacional", index)
              initWord = i + 2;
              i++;
              continue;
            }
          }
          this.addToken(line[i], "operador relacional", index)
          initWord = i + 1;
          continue;
        }

        if (tokenTypes.additiveOperators.indexOf(line[i]) > -1) {
          let previousToken = line.slice(initWord, i);
          this.checkWord(previousToken, index);
          this.addToken(line[i], "operador de adição", index)
          initWord = i + 1;
          continue;
        }

        if (tokenTypes.multiplicativeOperators.indexOf(line[i]) > -1) {
          let previousToken = line.slice(initWord, i);
          this.checkWord(previousToken, index);
          this.addToken(line[i], "operador de multiplicação", index)
          initWord = i + 1;
          continue;
        }

        if (i === line.length - 1) {
          let previousToken = line.slice(initWord, i + 1);
          this.checkWord(previousToken, index);
          continue;
        }

      }
    })

    return {
      hasErrors: this.errors.length > 0,
      data: this.errors.length === 0 ? this.tokenTable : this.errors,
    };
  }

  constructor(programCode) {
    this.programCode = programCode;
    this.errors = [];
    this.codeArray = [];
    this.tokenTable = [];
  }

}

module.exports = { LexicalAnalysis }
