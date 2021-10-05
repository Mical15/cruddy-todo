const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      callback(err, null);
    } else {
      const filePath = path.join(exports.dataDir, id + '.txt');
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.readAll = (callback) => {

  const readFilePromise = Promise.promisify(fs.readFile);

  fs.readdir(exports.dataDir, null, (err, files) => {
    if (err) {
      callback(err, null);
    } else {
      var results = files.map( (fileName) => {
        const idNumber = fileName.slice(0, 5);
        return readFilePromise(path.join(exports.dataDir, fileName)).then((fileData) => {
          return {
            id: idNumber,
            text: fileData.toString()
          };
        });
      });
      Promise.all(results).then( (element) => {
        callback(null, element);
      }).catch(console.log(err));
    }
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'), 'utf-8', (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, { id: id, text: data });
    }
  });
};

exports.update = (id, text, callback) => {
  fs.access(path.join(exports.dataDir, id + '.txt'), (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, null, (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, { id: id, text: text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(path.join(exports.dataDir, id + '.txt'), (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
