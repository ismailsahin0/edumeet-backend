const fs = require('fs');

class fileoperations {
    static deleteFile(path) {
        fs.unlinkSync(path);
    }
}


module.exports = fileoperations;