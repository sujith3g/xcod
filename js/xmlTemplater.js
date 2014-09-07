var DocUtils, ImgReplacer, ScopeManager, SubContent, TemplaterState, XmlMatcher, XmlTemplater;

DocUtils = require('./docUtils');

ScopeManager = require('./scopeManager');

SubContent = require('./subContent');

TemplaterState = require('./templaterState');

XmlMatcher = require('./xmlMatcher');

ImgReplacer = require('./imgReplacer');

module.exports = XmlTemplater = (function() {
  function XmlTemplater(content, options) {
    if (content == null) {
      content = "";
    }
    if (options == null) {
      options = {};
    }
    this.tagXml = '';
    this.currentClass = XmlTemplater;
    this.fromJson(options);
    this.templaterState = new TemplaterState;
    this.currentScope = this.Tags;
  }

  XmlTemplater.prototype.load = function(content) {
    var xmlMatcher;
    this.content = content;
    xmlMatcher = new XmlMatcher(this.content).parse(this.tagXml);
    this.templaterState.matches = xmlMatcher.matches;
    return this.templaterState.charactersAdded = xmlMatcher.charactersAdded;
  };

  XmlTemplater.prototype.fromJson = function(options) {
    if (options == null) {
      options = {};
    }
    this.Tags = options.Tags != null ? options.Tags : {};
    this.DocxGen = options.DocxGen != null ? options.DocxGen : null;
    this.intelligentTagging = options.intelligentTagging != null ? options.intelligentTagging : false;
    this.scopePath = options.scopePath != null ? options.scopePath : [];
    this.usedTags = options.usedTags != null ? options.usedTags : {};
    this.imageId = options.imageId != null ? options.imageId : 0;
    this.parser = options.parser != null ? options.parser : DocUtils.defaultParser;
    return this.scopeManager = new ScopeManager(this.Tags, this.scopePath, this.usedTags, this.Tags, this.parser);
  };

  XmlTemplater.prototype.toJson = function() {
    return {
      Tags: DocUtils.clone(this.scopeManager.tags),
      DocxGen: this.DocxGen,
      intelligentTagging: DocUtils.clone(this.intelligentTagging),
      scopePath: DocUtils.clone(this.scopeManager.scopePath),
      usedTags: this.scopeManager.usedTags,
      localImageCreator: this.localImageCreator,
      imageId: this.imageId,
      parser: this.parser
    };
  };

  XmlTemplater.prototype.calcIntellegentlyDashElement = function() {
    return false;
  };

  XmlTemplater.prototype.getFullText = function(tagXml) {
    var match, matcher, output;
    this.tagXml = tagXml != null ? tagXml : this.tagXml;
    matcher = new XmlMatcher(this.content).parse(this.tagXml);
    output = (function() {
      var _i, _len, _ref, _results;
      _ref = matcher.matches;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        match = _ref[_i];
        _results.push(match[2]);
      }
      return _results;
    })();
    return DocUtils.wordToUtf8(DocUtils.convert_spaces(output.join("")));
  };


  /*
  	content is the whole content to be tagged
  	scope is the current scope
  	returns the new content of the tagged content
   */

  XmlTemplater.prototype.applyTags = function() {
    var character, innerText, m, match, numCharacter, numXmlTag, t, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    this.templaterState.initialize();
    _ref = this.templaterState.matches;
    for (numXmlTag = _i = 0, _len = _ref.length; _i < _len; numXmlTag = ++_i) {
      match = _ref[numXmlTag];
      innerText = match[2];
      for (numCharacter = _j = 0, _len1 = innerText.length; _j < _len1; numCharacter = ++_j) {
        character = innerText[numCharacter];
        this.templaterState.currentStep = {
          'numXmlTag': numXmlTag,
          'numCharacter': numCharacter
        };
        _ref1 = this.templaterState.matches;
        for (t = _k = 0, _len2 = _ref1.length; _k < _len2; t = ++_k) {
          m = _ref1[t];
          if (t === numXmlTag) {
            if (this.content[m.offset + this.templaterState.charactersAdded[t]] !== m[0][0]) {
              throw new Error("no < at the beginning of " + m[0][0] + " (2)");
            }
          }
        }
        if (character === DocUtils.tags.start) {
          this.templaterState.startTag();
        } else if (character === DocUtils.tags.end) {
          this.templaterState.endTag();
          if (this.templaterState.loopType() === 'simple') {
            this.replaceSimpleTag();
          }
          if (this.templaterState.loopType() === 'xml') {
            this.replaceSimpleTagRawXml();
            break;
          } else if (this.templaterState.isLoopClosingTag()) {
            return this.replaceLoopTag();
          }
        } else {
          if (this.templaterState.inTag === true) {
            this.templaterState.textInsideTag += character;
          }
        }
      }
    }
    if ((this.DocxGen != null) && this.DocxGen.qrCode !== false) {
      new ImgReplacer(this).findImages().replaceImages();
    }
    return this;
  };

  XmlTemplater.prototype.replaceSimpleTag = function() {
    var newValue;
    newValue = this.scopeManager.getValueFromScope(this.templaterState.textInsideTag);
    this.content = this.replaceTagByValue(DocUtils.utf8ToWord(newValue));
    return this.content;
  };

  XmlTemplater.prototype.replaceSimpleTagRawXml = function() {
    var newText, subContent;
    subContent = new SubContent(this.content).getInnerTag(this.templaterState).getOuterXml('w:p');
    newText = this.scopeManager.getValueFromScope(this.templaterState.tag);
    this.templaterState.moveCharacters(this.templaterState.tagStart.numXmlTag, newText, subContent.text);
    return this.content = subContent.replace(newText).fullText;
  };

  XmlTemplater.prototype.deleteOuterTags = function(outerXmlText, sharp) {
    var xmlText;
    this.templaterState.tagEnd = {
      "numXmlTag": this.templaterState.loopOpen.end.numXmlTag,
      "numCharacter": this.templaterState.loopOpen.end.numCharacter
    };
    this.templaterState.tagStart = {
      "numXmlTag": this.templaterState.loopOpen.start.numXmlTag,
      "numCharacter": this.templaterState.loopOpen.start.numCharacter
    };
    if (sharp === false) {
      this.templaterState.textInsideTag = "-" + this.templaterState.loopOpen.element + " " + this.templaterState.loopOpen.tag;
    }
    if (sharp === true) {
      this.templaterState.textInsideTag = "#" + this.templaterState.loopOpen.tag;
    }
    xmlText = this.replaceTagByValue("", outerXmlText);
    this.templaterState.tagEnd = {
      "numXmlTag": this.templaterState.loopClose.end.numXmlTag,
      "numCharacter": this.templaterState.loopClose.end.numCharacter
    };
    this.templaterState.tagStart = {
      "numXmlTag": this.templaterState.loopClose.start.numXmlTag,
      "numCharacter": this.templaterState.loopClose.start.numCharacter
    };
    this.templaterState.textInsideTag = "/" + this.templaterState.loopOpen.tag;
    return this.replaceTagByValue("", xmlText);
  };

  XmlTemplater.prototype.dashLoop = function(elementDashLoop, sharp) {
    var end, innerXmlText, outerXml, outerXmlText, start, _, _ref;
    if (sharp == null) {
      sharp = false;
    }
    _ref = this.templaterState.findOuterTagsContent(this.content), _ = _ref._, start = _ref.start, end = _ref.end;
    outerXml = this.getOuterXml(this.content, start, end, elementDashLoop);
    this.templaterState.moveCharacters(0, "", outerXml.startTag);
    outerXmlText = outerXml.text;
    innerXmlText = this.deleteOuterTags(outerXmlText, sharp);
    return this.forLoop(innerXmlText, outerXmlText);
  };

  XmlTemplater.prototype.xmlToBeReplaced = function(noStartTag, spacePreserve, insideValue, xmlTagNumber, noEndTag) {
    var str;
    if (noStartTag === true) {
      return insideValue;
    } else {
      if (spacePreserve === true) {
        str = "<" + this.tagXml + " xml:space=\"preserve\">" + insideValue;
      } else {
        str = this.templaterState.matches[xmlTagNumber][1] + insideValue;
      }
      if (noEndTag === true) {
        return str;
      } else {
        return str + ("</" + this.tagXml + ">");
      }
    }
  };

  XmlTemplater.prototype.replaceXmlTag = function(content, options) {
    var insideValue, noEndTag, noStartTag, replacer, spacePreserve, startTag, xmlTagNumber;
    xmlTagNumber = options.xmlTagNumber;
    insideValue = options.insideValue;
    spacePreserve = options.spacePreserve != null ? options.spacePreserve : true;
    noStartTag = options.noStartTag != null ? options.noStartTag : false;
    noEndTag = options.noEndTag != null ? options.noEndTag : false;
    replacer = this.xmlToBeReplaced(noStartTag, spacePreserve, insideValue, xmlTagNumber, noEndTag);
    this.templaterState.matches[xmlTagNumber][2] = insideValue;
    startTag = this.templaterState.calcXmlTagPosition(xmlTagNumber);
    this.templaterState.moveCharacters(xmlTagNumber + 1, replacer, this.templaterState.matches[xmlTagNumber][0]);
    if (content.indexOf(this.templaterState.matches[xmlTagNumber][0]) === -1) {
      throw new Error("content " + this.templaterState.matches[xmlTagNumber][0] + " not found in content");
    }
    content = DocUtils.replaceFirstFrom(content, this.templaterState.matches[xmlTagNumber][0], replacer, startTag);
    this.templaterState.matches[xmlTagNumber][0] = replacer;
    return content;
  };

  XmlTemplater.prototype.replaceTagByValue = function(newValue, content) {
    var eTag, k, options, regexLeft, regexRight, sTag, subMatches, _i, _ref, _ref1;
    if (content == null) {
      content = this.content;
    }
    if ((this.templaterState.matches[this.templaterState.tagEnd.numXmlTag][2].indexOf(DocUtils.tags.end)) === -1) {
      throw new Error("no closing tag at @templaterState.tagEnd.numXmlTag " + this.templaterState.matches[this.templaterState.tagEnd.numXmlTag][2]);
    }
    if ((this.templaterState.matches[this.templaterState.tagStart.numXmlTag][2].indexOf(DocUtils.tags.start)) === -1) {
      throw new Error("no opening tag at @templaterState.tagStart.numXmlTag " + this.templaterState.matches[this.templaterState.tagStart.numXmlTag][2]);
    }
    sTag = DocUtils.tags.start;
    eTag = DocUtils.tags.end;
    if (this.templaterState.tagEnd.numXmlTag === this.templaterState.tagStart.numXmlTag) {
      options = {
        xmlTagNumber: this.templaterState.tagStart.numXmlTag,
        insideValue: this.templaterState.matches[this.templaterState.tagStart.numXmlTag][2].replace("" + sTag + this.templaterState.textInsideTag + eTag, newValue),
        noStartTag: (this.templaterState.matches[this.templaterState.tagStart.numXmlTag].first != null) || (this.templaterState.matches[this.templaterState.tagStart.numXmlTag].last != null)
      };
      content = this.replaceXmlTag(content, options);
    } else if (this.templaterState.tagEnd.numXmlTag > this.templaterState.tagStart.numXmlTag) {
      regexRight = new RegExp("^([^" + sTag + "]*)" + sTag + ".*$");
      subMatches = this.templaterState.matches[this.templaterState.tagStart.numXmlTag][2].match(regexRight);
      options = {
        xmlTagNumber: this.templaterState.tagStart.numXmlTag
      };
      if ((this.templaterState.matches[this.templaterState.tagStart.numXmlTag].first == null) && (this.templaterState.matches[this.templaterState.tagStart.numXmlTag].last == null)) {
        options.insideValue = subMatches[1] + newValue;
      } else {
        options.insideValue = newValue;
        options.noStartTag = this.templaterState.matches[this.templaterState.tagStart.numXmlTag].first != null;
      }
      content = this.replaceXmlTag(content, options);
      options = {
        insideValue: "",
        spacePreserve: false
      };
      for (k = _i = _ref = this.templaterState.tagStart.numXmlTag + 1, _ref1 = this.templaterState.tagEnd.numXmlTag; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; k = _ref <= _ref1 ? ++_i : --_i) {
        options.xmlTagNumber = k;
        content = this.replaceXmlTag(content, options);
      }
      regexLeft = new RegExp("^[^" + eTag + "]*" + eTag + "(.*)$");
      options = {
        insideValue: this.templaterState.matches[this.templaterState.tagEnd.numXmlTag][2].replace(regexLeft, '$1'),
        spacePreserve: true,
        xmlTagNumber: k,
        noEndTag: (this.templaterState.matches[this.templaterState.tagStart.numXmlTag].last != null) || (this.templaterState.matches[this.templaterState.tagStart.numXmlTag].first != null)
      };
      content = this.replaceXmlTag(content, options);
    }
    return content;
  };

  XmlTemplater.prototype.replaceLoopTag = function() {
    var dashElement;
    if (this.templaterState.loopType() === 'dash') {
      return this.dashLoop(this.templaterState.loopOpen.element);
    }
    if (this.intelligentTagging === true) {
      dashElement = this.calcIntellegentlyDashElement();
      if (dashElement !== false) {
        return this.dashLoop(dashElement, true);
      }
    }
    return this.forLoop();
  };

  XmlTemplater.prototype.calcSubXmlTemplater = function(innerTagsContent, argOptions) {
    var options, subfile, subsubfile;
    options = this.toJson();
    if (argOptions != null) {
      if (argOptions.Tags != null) {
        options.Tags = argOptions.Tags;
        options.scopePath = options.scopePath.concat(this.templaterState.loopOpen.tag);
      }
    }
    subfile = new this.currentClass(innerTagsContent, options);
    subsubfile = subfile.applyTags();
    this.imageId = subfile.imageId;
    return subsubfile;
  };

  XmlTemplater.prototype.getOuterXml = function(text, start, end, xmlTag) {
    var endTag, startTag;
    endTag = text.indexOf('</' + xmlTag + '>', end);
    if (endTag === -1) {
      throw new Error("can't find endTag " + endTag);
    }
    endTag += ('</' + xmlTag + '>').length;
    startTag = Math.max(text.lastIndexOf('<' + xmlTag + '>', start), text.lastIndexOf('<' + xmlTag + ' ', start));
    if (startTag === -1) {
      throw new Error("can't find startTag");
    }
    return {
      "text": text.substr(startTag, endTag - startTag),
      startTag: startTag,
      endTag: endTag
    };
  };

  XmlTemplater.prototype.forLoop = function(innerTagsContent, outerTagsContent) {
    var newContent, tag;
    if (innerTagsContent == null) {
      innerTagsContent = this.templaterState.findInnerTagsContent(this.content).content;
    }
    if (outerTagsContent == null) {
      outerTagsContent = this.templaterState.findOuterTagsContent(this.content).content;
    }

    /*
    			<w:t>{#forTag} blabla</w:t>
    			Blabla1
    			Blabla2
    			<w:t>{/forTag}</w:t>
    
    			Let innerTagsContent be what is in between the first closing tag and the second opening tag | blabla....Blabla2<w:t>|
    			Let outerTagsContent what is in between the first opening tag  and the last closing tag     |{#forTag} blabla....Blabla2<w:t>{/forTag}|
    			We replace outerTagsContent by n*innerTagsContent, n is equal to the length of the array in scope forTag
    			<w:t>subContent subContent subContent</w:t>
     */
    tag = this.templaterState.loopOpen.tag;
    newContent = "";
    this.scopeManager.loopOver(tag, (function(_this) {
      return function(subTags) {
        var subfile;
        subfile = _this.calcSubXmlTemplater(innerTagsContent, {
          Tags: subTags
        });
        return newContent += subfile.content;
      };
    })(this), this.templaterState.loopIsInverted);
    if (this.scopeManager.getValue(tag) == null) {
      this.calcSubXmlTemplater(innerTagsContent, {
        Tags: {}
      });
    }
    this.content = this.content.replace(outerTagsContent, newContent);
    return this.calcSubXmlTemplater(this.content);
  };

  return XmlTemplater;

})();
