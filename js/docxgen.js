
/*
Docxgen.coffee
Created by Edgar HIPP
 */
var DocUtils, DocXTemplater, DocxGen, ImgManager, JSZip, fs;

DocUtils = require('./docUtils');

ImgManager = require('./imgManager');

LinkManager = require('./LinkManager');

DocXTemplater = require('./docxTemplater');

JSZip = require('jszip');

fs = require('fs');

module.exports = DocxGen = (function() {
  var templatedFiles;

  templatedFiles = ["word/document.xml", "word/footer1.xml", "word/footer2.xml", "word/footer3.xml", "word/header1.xml", "word/header2.xml", "word/header3.xml"];

  function DocxGen(content, Tags, options) {
    this.Tags = Tags != null ? Tags : {};
    this.options = options;
    this.setOptions(this.options);
    this.finishedCallback = function() {};
    this.filesProcessed = 0;
    this.qrCodeNumCallBack = 0;
    this.qrCodeWaitingFor = [];
    if (content != null) {
      if (content.length > 0) {
        this.load(content);
      }
    }
  }

  DocxGen.prototype.setOptions = function(options) {
    this.options = options != null ? options : {};
    this.intelligentTagging = this.options.intelligentTagging != null ? this.options.intelligentTagging : true;
    this.qrCode = this.options.qrCode != null ? this.options.qrCode : false;
    this.replaceLinks = this.options.replaceLinks != null ? this.options.replaceLinks : false;
    if (this.qrCode === true) {
      this.qrCode = DocUtils.unsecureQrCode;
    }
    if (this.options.parser != null) {
      this.parser = options.parser;
    }
    return this;
  };

  DocxGen.prototype.loadFromFile = function(path, options) {
    var promise;
    if (options == null) {
      options = {};
    }
    this.setOptions(options);
    promise = {
      success: function(fun) {
        return this.successFun = fun;
      },
      successFun: function() {}
    };
    if (options.docx == null) {
      options.docx = false;
    }
    if (options.async == null) {
      options.async = false;
    }
    if (options.callback == null) {
      options.callback = (function(_this) {
        return function(rawData) {
          if (rawData === true) {
            throw new Error("File `" + path + "` was not Found");
          }
          _this.load(rawData);
          return promise.successFun(_this);
        };
      })(this);
    }
    if(options.varTags != null){
      DocUtils.tags = options.varTags;
    }
    DocUtils.loadDoc(path, options);
    if (options.async === false) {
      return this;
    } else {
      return promise;
    }
  };

  DocxGen.prototype.qrCodeCallBack = function(id, add) {
    var index;
    if (add == null) {
      add = true;
    }
    if (add === true) {
      this.qrCodeWaitingFor.push(id);
    } else if (add === false) {
      index = this.qrCodeWaitingFor.indexOf(id);
      this.qrCodeWaitingFor.splice(index, 1);
    }
    return this.testReady();
  };

  DocxGen.prototype.testReady = function() {
    if (this.qrCodeWaitingFor.length === 0 && this.filesProcessed === templatedFiles.length) {
      this.ready = true;
      return this.finishedCallback();
    }
  };

  DocxGen.prototype.load = function(content) {
    this.loadedContent = content;
    this.zip = new JSZip(content);
    return this;
  };

  DocxGen.prototype.applyTags = function(Tags) {
    var currentFile, fileName, imgManager, _i, _j, _len, _len1;
    this.Tags = Tags != null ? Tags : this.Tags;
    for (_i = 0, _len = templatedFiles.length; _i < _len; _i++) {
      fileName = templatedFiles[_i];
      if (this.zip.files[fileName] == null) {
        this.filesProcessed++;
      }
    }
    for (_j = 0, _len1 = templatedFiles.length; _j < _len1; _j++) {
      fileName = templatedFiles[_j];
      if (!(this.zip.files[fileName] != null)) {
        continue;
      }
      imgManager = new ImgManager(this.zip, fileName);
      imgManager.loadImageRels();
      linkManager = new LinkManager(this.zip, fileName);
      currentFile = new DocXTemplater(this.zip.files[fileName].asText(), {
        DocxGen: this,
        Tags: this.Tags,
        intelligentTagging: this.intelligentTagging,
        parser: this.parser,
        imgManager: imgManager,
        linkManager: linkManager,
        fileName: fileName
      });
      this.setData(fileName, currentFile.applyTags().content);
      this.filesProcessed++;
    }
    return this.testReady();
  };

  DocxGen.prototype.setData = function(fileName, data, options) {
    if (options == null) {
      options = {};
    }
    return this.zip.file(fileName, data, options);
  };

  DocxGen.prototype.getTags = function() {
    var currentFile, fileName, usedTags, usedTemplateV, _i, _len;
    usedTags = [];
    for (_i = 0, _len = templatedFiles.length; _i < _len; _i++) {
      fileName = templatedFiles[_i];
      if (!(this.zip.files[fileName] != null)) {
        continue;
      }
      currentFile = new DocXTemplater(this.zip.files[fileName].asText(), {
        DocxGen: this,
        Tags: this.Tags,
        intelligentTagging: this.intelligentTagging,
        parser: this.parser
      });
      usedTemplateV = currentFile.applyTags().usedTags;
      if (DocUtils.sizeOfObject(usedTemplateV)) {
        usedTags.push({
          fileName: fileName,
          vars: usedTemplateV
        });
      }
    }
    return usedTags;
  };

  DocxGen.prototype.setTags = function(Tags) {
    this.Tags = Tags;
    return this;
  };

  DocxGen.prototype.output = function(options) {
    var result;
    if (options == null) {
      options = {};
    }
    if (options.download == null) {
      options.download = true;
    }
    if (options.name == null) {
      options.name = "output.docx";
    }
    if (options.type == null) {
      options.type = "base64";
    }
    if (options.compression == null) {
      options.compression = "DEFLATE";
    }
    result = this.zip.generate({
      type: options.type,
      compression: options.compression
    });
    if (options.download) {
      if (DocUtils.env === 'node') {
        fs.writeFile(process.cwd() + '/' + options.name, result, 'base64', function(err) {
          if (err) {
            throw err;
          }
          if (options.callback != null) {
            return options.callback();
          }
        });
      } else {
        document.location.href = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64," + result;
      }
    }
    return result;
  };

  DocxGen.prototype.getFullText = function(path) {
    var usedData;
    if (path == null) {
      path = "word/document.xml";
    }
    usedData = this.zip.files[path].asText();
    return (new DocXTemplater(usedData, {
      DocxGen: this,
      Tags: this.Tags,
      intelligentTagging: this.intelligentTagging
    })).getFullText();
  };

  DocxGen.prototype.download = function(swfpath, imgpath, filename) {
    var output;
    if (filename == null) {
      filename = "default.docx";
    }
    output = this.zip.generate({
      compression: "DEFLATE"
    });
    return Downloadify.create('downloadify', {
      filename: function() {
        return filename;
      },
      data: function() {
        return output;
      },
      onCancel: function() {
        return alert('You have cancelled the saving of this file.');
      },
      onError: function() {
        return alert('You must put something in the File Contents or there will be nothing to save!');
      },
      swf: swfpath,
      downloadImage: imgpath,
      width: 100,
      height: 30,
      transparent: true,
      append: false,
      dataType: 'base64'
    });
  };

  return DocxGen;

})();
