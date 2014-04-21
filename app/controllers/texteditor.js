// Module dependencies here
var mongoose = require('mongoose'),
    async = require('async'),
    Q = require('q'),
    fs = require('fs'),
    StringDecoder = require('string_decoder').StringDecoder,
    _ = require('underscore');

exports.upload = function(req, res) {
  // This will decode the <Buffer> into a normal string
  var decoder = new StringDecoder('utf8');
  // end

  var numFiles = parseInt(req.query.numFiles),
      files = [];

  // Set up fs.readFile to work with promises
  var fs_readFile = Q.denodeify(fs.readFile)
  // end

  var promises = [];

  if (numFiles > 1) {
    req.files.file.forEach(function(file) {
      var fileName = file.name;
      var fileType = file.type;
      var filePath = file.path;

      files.push({
        name: fileName,
        type: fileType
      });

      var promise = fs_readFile(filePath, 'utf8', function(err, data) {
        if(err){res.send(404);}
        var file = decoder.write(data);
      }); //readfile

      promises.push(promise);
    }) // forEach
    var executePromises = Q.all(promises);
    var count = 0;
    executePromises.then(function(arr) {
      arr.forEach(function(data) {
        files[count].data = data;
        count++;
      });
      res.send(files);
    }, console.error);
  } else {
    var fileName = req.files.file.name;
    var fileType = req.files.file.type;
    var filePath = req.files.file.path;
    fs.readFile(filePath, function(err, data) {
      if(err){res.send(404);}
      var file = decoder.write(data);
      files.push({
        name: fileName,
        type: fileType,
        data: file
      });
      console.log(files);
      res.send(files);
    }); //readfile
  } //else
};