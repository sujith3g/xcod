var DocUtils, ImgManager,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

DocUtils = require('./docUtils');

module.exports = ImgManager = (function() {
  var imageExtensions;

  imageExtensions = ['gif', 'jpeg', 'jpg', 'emf', 'png'];

  function ImgManager(zip) {
    this.zip = zip;
  }

  ImgManager.prototype.getImageList = function() {
    var extension, imageList, index, regex;
    regex = /[^.]+\.([^.]+)/;
    imageList = [];
    for (index in this.zip.files) {
      extension = index.replace(regex, '$1');
      if (__indexOf.call(imageExtensions, extension) >= 0) {
        imageList.push({
          "path": index,
          files: this.zip.files[index]
        });
      }
    }
    return imageList;
  };

  ImgManager.prototype.setImage = function(fileName, data, options) {
    if (options == null) {
      options = {};
    }
    this.zip.remove(fileName);
    return this.zip.file(fileName, data, options);
  };

  ImgManager.prototype.loadImageRels = function() {
    var RidArray, content, tag;
    content = DocUtils.decode_utf8(this.zip.files["word/_rels/document.xml.rels"].asText());
    this.xmlDoc = DocUtils.Str2xml(content);
    RidArray = (function() {
      var _i, _len, _ref, _results;
      _ref = this.xmlDoc.getElementsByTagName('Relationship');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        _results.push(parseInt(tag.getAttribute("Id").substr(3)));
      }
      return _results;
    }).call(this);
    this.maxRid = DocUtils.maxArray(RidArray);
    this.imageRels = [];
    return this;
  };

  ImgManager.prototype.addExtensionRels = function(contentType, extension) {
    var addTag, content, defaultTags, newTag, tag, types, xmlDoc, _i, _len;
    content = this.zip.files["[Content_Types].xml"].asText();
    xmlDoc = DocUtils.Str2xml(content);
    addTag = true;
    defaultTags = xmlDoc.getElementsByTagName('Default');
    for (_i = 0, _len = defaultTags.length; _i < _len; _i++) {
      tag = defaultTags[_i];
      if (tag.getAttribute('Extension') === extension) {
        addTag = false;
      }
    }
    if (addTag) {
      types = xmlDoc.getElementsByTagName("Types")[0];
      newTag = xmlDoc.createElement('Default');
      newTag.namespaceURI = null;
      newTag.setAttribute('ContentType', contentType);
      newTag.setAttribute('Extension', extension);
      types.appendChild(newTag);
      return this.setImage("[Content_Types].xml", DocUtils.encode_utf8(DocUtils.xml2Str(xmlDoc)));
    }
  };

  ImgManager.prototype.addImageRels = function(imageName, imageData) {
    var extension, file, newTag, relationships;
    if (this.zip.files["word/media/" + imageName] != null) {
      throw new Error('file already exists');
      return false;
    }
    this.maxRid++;
    file = {
      'name': "word/media/" + imageName,
      'data': imageData,
      'options': {
        base64: false,
        binary: true,
        compression: null,
        date: new Date(),
        dir: false
      }
    };
    this.zip.file(file.name, file.data, file.options);
    extension = imageName.replace(/[^.]+\.([^.]+)/, '$1');
    this.addExtensionRels("image/" + extension, extension);
    relationships = this.xmlDoc.getElementsByTagName("Relationships")[0];
    newTag = this.xmlDoc.createElement('Relationship');
    newTag.namespaceURI = null;
    newTag.setAttribute('Id', "rId" + this.maxRid);
    newTag.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
    newTag.setAttribute('Target', "media/" + imageName);
    relationships.appendChild(newTag);
    this.setImage("word/_rels/document.xml.rels", DocUtils.encode_utf8(DocUtils.xml2Str(this.xmlDoc)));
    return this.maxRid;
  };

  ImgManager.prototype.getImageByRid = function(rId) {
    var cRId, path, relationship, relationships, _i, _len;
    relationships = this.xmlDoc.getElementsByTagName('Relationship');
    for (_i = 0, _len = relationships.length; _i < _len; _i++) {
      relationship = relationships[_i];
      cRId = relationship.getAttribute('Id');
      if (rId === cRId) {
        path = relationship.getAttribute('Target');
        if (path.substr(0, 6) === 'media/') {
          return this.zip.files["word/" + path];
        } else {
          throw new Error("Rid is not an image");
        }
      }
    }
    throw new Error("No Media with this Rid found");
  };

  return ImgManager;

})();
