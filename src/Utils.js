const fs = require("fs");

module.exports = {

  async readFile(path) {
    try {
      let res = await fs.readFileSync(path, 'utf-8');
      return res;
    }catch(err) {
      return null;
    }
  },
}