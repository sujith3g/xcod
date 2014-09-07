#!/usr/bin/env node
var fs=require('fs');
var DocUtils, DocxGen, currentPath, debug, debugBool, docs, docxFileName, jsonFileName, jsonInput, key, outputFile, res, showHelp;

DocUtils = require('./docUtils');

DocxGen = require('./docxgen');

showHelp = function() {
  console.log('Usage: docxtemplater <configFilePath>');
  console.log('--- ConfigFile Format: json');
  return console.log('--- see http://docxtemplater.readthedocs.org/en/latest/cli.html');
};

if (process.argv[2] === '--help' || process.argv[2] === '-h' || process.argv[2] === null || process.argv[2] === void 0) {
  showHelp();
  return;
}

res = fs.readFileSync(process.argv[2], 'utf-8');

jsonInput = JSON.parse(res);

DocUtils.config = {};

currentPath = process.cwd() + '/';

DocUtils.pathConfig = {
  "node": currentPath
};

for (key in jsonInput) {
  if (key.substr(0, 7) === 'config.') {
    DocUtils.config[key.substr(7)] = jsonInput[key];
  }
}

docxFileName = DocUtils.config["docxFile"];

jsonFileName = process.argv[2];

outputFile = DocUtils.config["outputFile"];

debug = DocUtils.config["debug"];

debugBool = DocUtils.config["debugBool"];

if (docxFileName === '--help' || docxFileName === '-h' || docxFileName === null || docxFileName === void 0 || jsonFileName === null || jsonFileName === void 0) {
  showHelp();
} else {
  if (debug === '-d' || debug === '--debug') {
    debugBool = true;
  }
  if (debugBool) {
    console.log(process.cwd());
    console.log(debug);
  }
  if (debugBool) {
    console.log("loading docx:" + docxFileName);
  }
  docs = {};
  docs[docxFileName] = new DocxGen().loadFromFile(docxFileName, {
    intelligentTagging: true
  });
  if (debugBool) {
    console.log('data:' + docs[docxFileName]);
  }
  docs[jsonFileName] = DocUtils.loadDoc(currentPath + jsonFileName, {
    docx: false
  });
  if (debugBool) {
    console.log('data:' + docs[jsonFileName]);
  }
  if (docs[jsonFileName] === void 0) {
    throw 'no data found in json file';
  }
  if (docs[docxFileName] === void 0) {
    throw 'no data found in json file';
  }
  if (debugBool) {
    console.log('decoded', jsonInput);
  }
  if (debugBool) {
    console.log(docX);
  }
  if (debugBool) {
    console.log(docs[docxFileName]);
  }
  docs[docxFileName].setTags(jsonInput);
  docs[docxFileName].qrCode = DocUtils.config["qrcode"];
  if (docs[docxFileName].qrCode === true) {
    docs[docxFileName].qrCode = DocUtils.loadHttp;
  }
  docs[docxFileName].finishedCallback = function() {
    this.output({
      download: true,
      name: outputFile
    });
    return console.log('outputed');
  };
  docs[docxFileName].applyTags();
}
