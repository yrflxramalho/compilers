const path = require("path");
const { readFile } = require("./src/Utils")
const { LexicalAnalysis } = require("./src/LexicalAnalysis")
const { SyntaxAnalysis } = require("./src/SyntaxAnalysis")

let r = async (filepath) => {
  let programCode = await readFile(path.join(__dirname, filepath))

  if (programCode !== null) {
    let lexical = new LexicalAnalysis(programCode);
    let { hasErrors, data } = lexical.analizer();

    if (!hasErrors) {
      let syntax = new SyntaxAnalysis(data);
      try {
        syntax.analizer();
      }catch (err) {
        console.log(err);
      }
    }else {
      console.log(data)
    }

  } else {
    console.log("file is not found.")
  }
}
var args = process.argv.slice(2);

if (args.length !== 0) {
  r(args[0])
}else {
  console.log('please, select a test file');
}
