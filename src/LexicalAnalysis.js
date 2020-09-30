const tokenTypes = {
  keyWords: ["program", "var", "integer", "real", "boolean", "procedure", "begin", "end", "if", "then", "else", "while", "do", "not"],
  delimiters: [";", ".", ":", "()", ","],
  identifiersRegex: "",
  integersRegex: "",
  floatsRegex: "",
  assignmentCommands: ":=",
  relationalOperators: ["=", "<", ">", "<=", ">=", "<>"],
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

  analizer() {
    this.filter();
    console.log(this.codeArray)

    return "";
  }


  constructor(programCode) {
    this.programCode = programCode;
    this.errors = [];
    this.codeArray = [];
  }

}

module.exports = { LexicalAnalysis }
