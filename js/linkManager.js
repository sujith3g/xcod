var DocUtils, LinkManager,
DocUtils = require('./docUtils');
module.exports = LinkManager = (function() {
  function LinkManager(zip, fileName) {
    this.zip = zip;
    this.fileName = fileName;
    this.endFileName = this.fileName.replace(/^.*?([a-z0-9]+)\.xml$/, "$1");
  }
  LinkManager.prototype.setLink = function(fileName, data, options) {
    if (options == null) {
      options = {};
    }
    this.zip.remove(fileName);
    return this.zip.file(fileName, data, options);
  };

  LinkManager.prototype.loadRels = function(){
    var RidArray, content, file, tag;
    file = this.zip.files["word/_rels/" + this.endFileName + ".xml.rels"];
    if (file === void 0) {
      return;
    }
    content = DocUtils.decode_utf8(file.asText());
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
    this.linkRels = [];
    return this;
  };
  LinkManager.prototype.addLinkRels = function(linkUrl, i) {
    this.maxRid++;
    relationships = this.xmlDoc.getElementsByTagName("Relationships")[0];
    newTag = this.xmlDoc.createElement('Relationship');
    newTag.namespaceURI = null;
    newTag.setAttribute('Id', "rId" + this.maxRid);
    newTag.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink');
    newTag.setAttribute('Target', linkUrl);
    newTag.setAttribute('TargetMode', "External");
    relationships.appendChild(newTag);
    this.setLink("word/_rels/" + this.endFileName + ".xml.rels", DocUtils.encode_utf8(DocUtils.xml2Str(this.xmlDoc)));
    return this.maxRid;
  };
  return LinkManager;
})();
