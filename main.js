const path = require("path");
const { readFile } = require("./src/Utils")
const { LexicalAnalysis } = require("./src/LexicalAnalysis")
const { SyntaxAnalysis } = require("./src/SyntaxAnalysis")

let file1 = path.join(__dirname, 'tests_files', 'TestX.pas');

let r = async () => {
  let programCode = await readFile(file1)

  if (programCode !== null) {
    let lexical = new LexicalAnalysis(programCode);
    let { hasErrors, data } = lexical.analizer();

    console.log(data)

    // if (!hasErrors) {
    //   let syntax = new SyntaxAnalysis(data);
    //   try {
    //     syntax.analizer();
    //   }catch (err) {
    //     console.log(err);
    //   }
    // }else {
    //   console.log(data)
    // }

  } else {
    console.log("file is not found.")
  }
}

r()
