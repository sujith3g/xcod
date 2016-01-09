var DocUtils, DocxQrCode, ImgReplacer, JSZip, PNG;

DocUtils = require('./docUtils');

XmlMatcher = require('./xmlMatcher');

DocxQrCode = require('./docxQrCode');

DocxTemplater = require('./docxTemplater');

PNG = require('png-js');

JSZip = require('jszip');

module.exports = LinkReplacer = (function() {
  function LinkReplacer(xmlTemplater) {
    this.xmlTemplater = xmlTemplater;
    this.linkMatches = [];
    this.xmlTemplater.numLinks = 0;
    this;
  }

  LinkReplacer.prototype.findLinks = function() {
    this.linkMatches = DocUtils.preg_match_all(/<w:hyperlink[^>]*>.*?<\/w:hyperlink>/g, this.xmlTemplater.content);

    return this;
  };
  LinkReplacer.prototype.replaceLinks = function(){
    var match, u, _i, _len, _ref;
    this.qr = [];
    this.xmlTemplater.numLinks += this.linkMatches.length;
    _ref = this.linkMatches;
    for (u = _i = 0, _len = _ref.length; _i < _len; u = ++_i) {
      match = _ref[u];
      this.replaceLink(match, u);
    }
    return this;
  };
  LinkReplacer.prototype.replaceLink = function(match,u){
    var xmlLink,tagrId,rId;
    var textInsideTag, xmlParser;
    xmlParser = new XmlMatcher(match[0]);
    textInsideTag = xmlParser.parse('w:t');
    textInsideTag = textInsideTag.matches.map(function(match){
      return match[2];
    }).join('');
    try {
      xmlLink = DocUtils.Str2xml('<?xml version="1.0" ?><w:document mc:Ignorable="w14 wp14" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">' + match[0] + '</w:document>', function(_i, type) {
        if (_i === 'fatalError') {
          throw "fatalError";
        }
      });
    } catch (_error) {
      e = _error;
      return;
    }
    linkTag = xmlLink.getElementsByTagName("w:hyperlink")[0];
    rId = linkTag.getAttribute('r:id');
    if (rId === void 0) {
      throw new Error('RiD undefined !');
    }
    console.log(this.xmlTemplater.DocxGen.replaceLinks);
    newLink = this.xmlTemplater.DocxGen.replaceLinks[textInsideTag];
    if(newLink){
      newRid = this.xmlTemplater.linkManager.addLinkRels(newLink,1);
      linkTag.setAttribute('r:id', 'rId' + newRid);
      updatedLinkTag = xmlLink.getElementsByTagName("w:hyperlink")[0];
      replacement = DocUtils.xml2Str(updatedLinkTag);
      this.xmlTemplater.content = this.xmlTemplater.content.replace(match[0], replacement);
    }
    // textTag =xmlLink.getElementsByTagName('w:t')[0];
    //textTag = new DocxTemplater(DocUtils.xml2Str(match[0]),{});
    // textTag.applyTags();
    return this;
  };
  return LinkReplacer;
})();
