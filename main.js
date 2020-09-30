const path = require("path");
const { readFile } = require("./src/Utils")
const {LexicalAnalysis} = require("./src/LexicalAnalysis")

let file1 = path.join(__dirname, 'tests_files', 'Test1.pas');

let r = async()=>{
  let programCode = await readFile(file1)
  
  if(programCode !== null) {
    let lexical = new LexicalAnalysis(programCode);

    lexical.analizer();
  }else {
    console.log("file is not found.")
  }
}

r()
