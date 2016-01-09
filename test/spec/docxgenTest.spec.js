(function() {
  var DocUtils, DocXTemplater, DocxGen, DocxQrCode, JSZip, PNG, SubContent, angularParser, docX, docXData, expressions, fileNames, name, xmlUtil, _i, _len;

  docX = {};

  docXData = {};

  expressions = require('angular-expressions');

  angularParser = function(tag) {
    var e, expr;
    try {
      expr = expressions.compile(tag);
    } catch (_error) {
      e = _error;
      console.log("parsing didn't work with " + tag);
    }
    return {
      get: function(scope) {
        if (scope == null) {
          console.log('warning: scope undefined');
        }
        try {
          return expr(scope);
        } catch (_error) {
          e = _error;
          console.log("parsing didn't work with " + tag);
          return "undefined";
        }
      }
    };
  };

  DocxGen = require('../../js/docxgen.js');

  DocUtils = require('../../js/docUtils.js');

  docX = DocUtils.docX;

  docXData = DocUtils.docXData;

  SubContent = require('../../js/subContent.js');

  DocXTemplater = require('../../js/docxTemplater.js');

  LinkReplacer = require('../../js/linkReplacer.js');

  LinkManager = require('../../js/linkManager.js');

  xmlUtil = require('../../js/xmlUtil.js');

  JSZip = require('jszip');

  PNG = require('png-js');

  DocxQrCode = require('../../js/docxQrCode.js');

  DocUtils.pathConfig = {
    "browser": '../examples/',
    "node": __dirname + '/../../examples/'
  };

  fileNames = ["graph.docx", "qrCodeAndNonQrCodeExample.docx", "imageExample.docx","linkExample.docx", "tagExample.docx", "tagExampleExpected.docx", "tagLoopExample.docx", "tagInvertedLoopExample.docx", "tagExampleExpected.docx", "tagLoopExampleImageExpected.docx", "tagProduitLoop.docx", "tagDashLoop.docx", "tagDashLoopList.docx", "tagDashLoopTable.docx", 'tagDashLoop.docx', 'qrCodeExample.docx', 'qrCodeExampleExpected.docx', 'qrCodeTaggingExample.docx', 'qrCodeTaggingExampleExpected.docx', 'qrCodeTaggingLoopExample.docx', 'qrCodeTaggingLoopExampleExpected.docx', 'tagIntelligentLoopTableExpected.docx', 'cyrillic.docx', 'tableComplex2Example.docx', 'tableComplexExample.docx', 'tableComplex3Example.docx', 'xmlInsertionExpected.docx', 'xmlInsertionExample.docx', "angularExample.docx", "xmlInsertionComplexExpected.docx", "xmlInsertionComplexExample.docx", "qrCodeCustomGen.docx", "qrCodeFooter.docx", "qrCodeRealFooter.docx"];

  for (_i = 0, _len = fileNames.length; _i < _len; _i++) {
    name = fileNames[_i];
    docX[name] = new DocxGen().loadFromFile(name);
  }

  docX["tagExampleWithParser"] = new DocxGen().loadFromFile("tagExample.docx");

  docX['tagIntelligentLoopTable.docx'] = new DocxGen().loadFromFile('tagIntelligentLoopTable.docx', {
    intelligentTagging: true
  });

  docXData['image.png'] = DocUtils.loadDoc('image.png', {
    docx: false
  });

  docXData['bootstrap_logo.png'] = DocUtils.loadDoc('bootstrap_logo.png', {
    docx: false
  });

  docXData['BMW_logo.png'] = DocUtils.loadDoc('BMW_logo.png', {
    docx: false
  });

  docXData['Firefox_logo.png'] = DocUtils.loadDoc('Firefox_logo.png', {
    docx: false
  });

  docXData['Volkswagen_logo.png'] = DocUtils.loadDoc('Volkswagen_logo.png', {
    docx: false
  });

  docXData['qrcodeTest.zip'] = DocUtils.loadDoc('qrcodeTest.zip', {
    docx: false
  });

  describe("DocxGenBasis", function() {
    it("should be defined", function() {
      return expect(DocxGen).not.toBe(void 0);
    });
    return it("should construct", function() {
      var a;
      a = new DocxGen();
      return expect(a).not.toBe(void 0);
    });
  });

  describe("DocxGenLoading", function() {
    describe("ajax done correctly", function() {
      it("doc and img Data should have the expected length", function() {
        expect(docX['imageExample.docx'].loadedContent.length).toEqual(729580);
        return expect(docXData['image.png'].length).toEqual(18062);
      });
      return it("should have the right number of files (the docx unzipped)", function() {
        docX['imageExample.docx'] = new DocxGen(docX['imageExample.docx'].loadedContent);
        return expect(DocUtils.sizeOfObject(docX['imageExample.docx'].zip.files)).toEqual(16);
      });
    });
    describe("basic loading", function() {
      return it("should load file imageExample.docx", function() {
        return expect(typeof docX['imageExample.docx']).toBe('object');
      });
    });
    describe("content_loading", function() {
      it("should load the right content for the footer", function() {
        var fullText;
        fullText = docX['imageExample.docx'].getFullText("word/footer1.xml");
        expect(fullText.length).not.toBe(0);
        return expect(fullText).toBe('{last_name}{first_name}{phone}');
      });
      return it("should load the right content for the document", function() {
        var fullText;
        fullText = docX['imageExample.docx'].getFullText();
        return expect(fullText).toBe("");
      });
    });
    return describe("output and input", function() {
      return it("should be the same", function() {
        var doc, output;
        doc = new DocxGen(docX['tagExample.docx'].loadedContent);
        output = doc.output(false);
        expect(output.length).toEqual(90732);
        return expect(output.substr(0, 50)).toEqual('UEsDBAoAAAAAAAAAIQAMTxYSlgcAAJYHAAATAAAAW0NvbnRlbn');
      });
    });
  });

  describe("DocxGenTemplating", function() {
    return describe("text templating", function() {
      it("should change values with template vars", function() {
        var Tags;
        Tags = {
          "first_name": "Hipp",
          "last_name": "Edgar",
          "phone": "0652455478",
          "description": "New Website"
        };
        docX['tagExample.docx'].setTags(Tags);
        docX['tagExample.docx'].applyTags();
        expect(docX['tagExample.docx'].getFullText()).toEqual('Edgar Hipp');
        expect(docX['tagExample.docx'].getFullText("word/header1.xml")).toEqual('Edgar Hipp0652455478New Website');
        return expect(docX['tagExample.docx'].getFullText("word/footer1.xml")).toEqual('EdgarHipp0652455478');
      });
      return it("should export the good file", function() {
        var i, _results;
        _results = [];
        for (i in docX['tagExample.docx'].zip.files) {
          expect(docX['tagExample.docx'].zip.files[i].options.date).not.toBe(docX['tagExampleExpected.docx'].zip.files[i].options.date);
          expect(docX['tagExample.docx'].zip.files[i].name).toBe(docX['tagExampleExpected.docx'].zip.files[i].name);
          expect(docX['tagExample.docx'].zip.files[i].options.dir).toBe(docX['tagExampleExpected.docx'].zip.files[i].options.dir);
          _results.push(expect(docX['tagExample.docx'].zip.files[i].asText()).toBe(docX['tagExampleExpected.docx'].zip.files[i].asText()));
        }
        return _results;
      });
    });
  });

  describe("DocxGenTemplatingForLoop", function() {
    return describe("textLoop templating", function() {
      it("should replace all the tags", function() {
        var Tags;
        Tags = {
          "nom": "Hipp",
          "prenom": "Edgar",
          "telephone": "0652455478",
          "description": "New Website",
          "offre": [
            {
              "titre": "titre1",
              "prix": "1250"
            }, {
              "titre": "titre2",
              "prix": "2000"
            }, {
              "titre": "titre3",
              "prix": "1400",
              "nom": "Offre"
            }
          ]
        };
        docX['tagLoopExample.docx'].setTags(Tags);
        docX['tagLoopExample.docx'].applyTags();
        return expect(docX['tagLoopExample.docx'].getFullText()).toEqual('Votre proposition commercialeHippPrix: 1250Titre titre1HippPrix: 2000Titre titre2OffrePrix: 1400Titre titre3HippEdgar');
      });
      it("should work with loops inside loops", function() {
        var Tags, expectedText, text;
        Tags = {
          "products": [
            {
              "title": "Microsoft",
              "name": "DOS",
              "reference": "Win7",
              "avantages": [
                {
                  "title": "Everyone uses it",
                  "proof": [
                    {
                      "reason": "it is quite cheap"
                    }, {
                      "reason": "it is quit simple"
                    }, {
                      "reason": "it works on a lot of different Hardware"
                    }
                  ]
                }
              ]
            }, {
              "title": "Linux",
              "name": "Ubuntu",
              "reference": "Ubuntu10",
              "avantages": [
                {
                  "title": "It's very powerful",
                  "proof": [
                    {
                      "reason": "the terminal is your friend"
                    }, {
                      "reason": "Hello world"
                    }, {
                      "reason": "it's free"
                    }
                  ]
                }
              ]
            }, {
              "title": "Apple",
              "name": "Mac",
              "reference": "OSX",
              "avantages": [
                {
                  "title": "It's very easy",
                  "proof": [
                    {
                      "reason": "you can do a lot just with the mouse"
                    }, {
                      "reason": "It's nicely designed"
                    }
                  ]
                }
              ]
            }
          ]
        };
        docX['tagProduitLoop.docx'].setTags(Tags);
        docX['tagProduitLoop.docx'].applyTags();
        text = docX['tagProduitLoop.docx'].getFullText();
        expectedText = "MicrosoftProduct name : DOSProduct reference : Win7Everyone uses itProof that it works nicely : It works because it is quite cheap It works because it is quit simple It works because it works on a lot of different HardwareLinuxProduct name : UbuntuProduct reference : Ubuntu10It's very powerfulProof that it works nicely : It works because the terminal is your friend It works because Hello world It works because it's freeAppleProduct name : MacProduct reference : OSXIt's very easyProof that it works nicely : It works because you can do a lot just with the mouse It works because It's nicely designed";
        expect(text.length).toEqual(expectedText.length);
        return expect(text).toEqual(expectedText);
      });
      return it("should provide inverted loops", function() {
        docX['tagInvertedLoopExample.docx'].setTags({
          products: []
        });
        docX['tagInvertedLoopExample.docx'].applyTags();
        expect(docX['tagInvertedLoopExample.docx'].getFullText()).toEqual('No products found');
        docX['tagInvertedLoopExample.docx'] = new DocxGen(docX['tagInvertedLoopExample.docx'].loadedContent);
        docX['tagInvertedLoopExample.docx'].setTags({
          products: false
        });
        docX['tagInvertedLoopExample.docx'].applyTags();
        expect(docX['tagInvertedLoopExample.docx'].getFullText()).toEqual('No products found');
        docX['tagInvertedLoopExample.docx'] = new DocxGen(docX['tagInvertedLoopExample.docx'].loadedContent);
        docX['tagInvertedLoopExample.docx'].setTags({});
        docX['tagInvertedLoopExample.docx'].applyTags();
        expect(docX['tagInvertedLoopExample.docx'].getFullText()).toEqual('No products found');
        docX['tagInvertedLoopExample.docx'] = new DocxGen(docX['tagInvertedLoopExample.docx'].loadedContent);
        docX['tagInvertedLoopExample.docx'].setTags({
          products: [
            {
              name: "Bread"
            }
          ]
        });
        docX['tagInvertedLoopExample.docx'].applyTags();
        expect(docX['tagInvertedLoopExample.docx'].getFullText()).toEqual('');
        docX['tagInvertedLoopExample.docx'] = new DocxGen(docX['tagInvertedLoopExample.docx'].loadedContent);
        docX['tagInvertedLoopExample.docx'].setTags({
          products: true
        });
        docX['tagInvertedLoopExample.docx'].applyTags();
        expect(docX['tagInvertedLoopExample.docx'].getFullText()).toEqual('');
        docX['tagInvertedLoopExample.docx'] = new DocxGen(docX['tagInvertedLoopExample.docx'].loadedContent);
        docX['tagInvertedLoopExample.docx'].setTags({
          products: "Bread"
        });
        docX['tagInvertedLoopExample.docx'].applyTags();
        expect(docX['tagInvertedLoopExample.docx'].getFullText()).toEqual('');
        docX['tagInvertedLoopExample.docx'] = new DocxGen(docX['tagInvertedLoopExample.docx'].loadedContent);
        docX['tagInvertedLoopExample.docx'].setTags({
          products: {
            name: "Bread"
          }
        });
        docX['tagInvertedLoopExample.docx'].applyTags();
        return expect(docX['tagInvertedLoopExample.docx'].getFullText()).toEqual('');
      });
    });
  });

  describe("Xml Util", function() {
    it("should compute the scope between 2 <w:t>", function() {
      var scope;
      scope = xmlUtil.getListXmlElements("undefined</w:t></w:r></w:p><w:p w:rsidP=\"008A4B3C\" w:rsidR=\"007929C1\" w:rsidRDefault=\"007929C1\" w:rsidRPr=\"008A4B3C\"><w:pPr><w:pStyle w:val=\"Sous-titre\"/></w:pPr><w:r w:rsidRPr=\"008A4B3C\"><w:t xml:space=\"preserve\">Audit réalisé le ");
      return expect(scope).toEqual([
        {
          tag: '</w:t>',
          offset: 9
        }, {
          tag: '</w:r>',
          offset: 15
        }, {
          tag: '</w:p>',
          offset: 21
        }, {
          tag: '<w:p>',
          offset: 27
        }, {
          tag: '<w:r>',
          offset: 162
        }, {
          tag: '<w:t>',
          offset: 188
        }
      ]);
    });
    it("should compute the scope between 2 <w:t> in an Array", function() {
      var scope;
      scope = xmlUtil.getListXmlElements("urs</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:type=\"dxa\" w:w=\"4140\"/></w:tcPr><w:p w:rsidP=\"00CE524B\" w:rsidR=\"00CE524B\" w:rsidRDefault=\"00CE524B\"><w:pPr><w:rPr><w:rFonts w:ascii=\"Times New Roman\" w:hAnsi=\"Times New Roman\"/><w:color w:val=\"auto\"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii=\"Times New Roman\" w:hAnsi=\"Times New Roman\"/><w:color w:val=\"auto\"/></w:rPr><w:t>Sur exté");
      return expect(scope).toEqual([
        {
          tag: '</w:t>',
          offset: 3
        }, {
          tag: '</w:r>',
          offset: 9
        }, {
          tag: '</w:p>',
          offset: 15
        }, {
          tag: '</w:tc>',
          offset: 21
        }, {
          tag: '<w:tc>',
          offset: 28
        }, {
          tag: '<w:p>',
          offset: 83
        }, {
          tag: '<w:r>',
          offset: 268
        }, {
          tag: '<w:t>',
          offset: 374
        }
      ]);
    });
    return it('should compute the scope between a w:t in an array and the other outside', function() {
      var scope;
      scope = xmlUtil.getListXmlElements("defined </w:t></w:r></w:p></w:tc></w:tr></w:tbl><w:p w:rsidP=\"00CA7135\" w:rsidR=\"00BE3585\" w:rsidRDefault=\"00BE3585\"/><w:p w:rsidP=\"00CA7135\" w:rsidR=\"00BE3585\" w:rsidRDefault=\"00BE3585\"/><w:p w:rsidP=\"00CA7135\" w:rsidR=\"00137C91\" w:rsidRDefault=\"00137C91\"><w:r w:rsidRPr=\"00B12C70\"><w:rPr><w:bCs/></w:rPr><w:t>Coût ressources ");
      return expect(scope).toEqual([
        {
          tag: '</w:t>',
          offset: 8
        }, {
          tag: '</w:r>',
          offset: 14
        }, {
          tag: '</w:p>',
          offset: 20
        }, {
          tag: '</w:tc>',
          offset: 26
        }, {
          tag: '</w:tr>',
          offset: 33
        }, {
          tag: '</w:tbl>',
          offset: 40
        }, {
          tag: '<w:p>',
          offset: 188
        }, {
          tag: '<w:r>',
          offset: 257
        }, {
          tag: '<w:t>',
          offset: 306
        }
      ]);
    });
  });

  describe("scope diff calculation", function() {
    it("should compute the scopeDiff between 2 <w:t>", function() {
      var scope;
      scope = xmlUtil.getListDifferenceXmlElements("undefined</w:t></w:r></w:p><w:p w:rsidP=\"008A4B3C\" w:rsidR=\"007929C1\" w:rsidRDefault=\"007929C1\" w:rsidRPr=\"008A4B3C\"><w:pPr><w:pStyle w:val=\"Sous-titre\"/></w:pPr><w:r w:rsidRPr=\"008A4B3C\"><w:t xml:space=\"preserve\">Audit réalisé le ");
      return expect(scope).toEqual([]);
    });
    it("should compute the scopeDiff between 2 <w:t> in an Array", function() {
      var scope;
      scope = xmlUtil.getListDifferenceXmlElements("urs</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:type=\"dxa\" w:w=\"4140\"/></w:tcPr><w:p w:rsidP=\"00CE524B\" w:rsidR=\"00CE524B\" w:rsidRDefault=\"00CE524B\"><w:pPr><w:rPr><w:rFonts w:ascii=\"Times New Roman\" w:hAnsi=\"Times New Roman\"/><w:color w:val=\"auto\"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii=\"Times New Roman\" w:hAnsi=\"Times New Roman\"/><w:color w:val=\"auto\"/></w:rPr><w:t>Sur exté");
      return expect(scope).toEqual([]);
    });
    return it('should compute the scopeDiff between a w:t in an array and the other outside', function() {
      var scope;
      scope = xmlUtil.getListDifferenceXmlElements("defined </w:t></w:r></w:p></w:tc></w:tr></w:tbl><w:p w:rsidP=\"00CA7135\" w:rsidR=\"00BE3585\" w:rsidRDefault=\"00BE3585\"/><w:p w:rsidP=\"00CA7135\" w:rsidR=\"00BE3585\" w:rsidRDefault=\"00BE3585\"/><w:p w:rsidP=\"00CA7135\" w:rsidR=\"00137C91\" w:rsidRDefault=\"00137C91\"><w:r w:rsidRPr=\"00B12C70\"><w:rPr><w:bCs/></w:rPr><w:t>Coût ressources ");
      return expect(scope).toEqual([
        {
          tag: '</w:tc>',
          offset: 26
        }, {
          tag: '</w:tr>',
          offset: 33
        }, {
          tag: '</w:tbl>',
          offset: 40
        }
      ]);
    });
  });

  describe("scope inner text", function() {
    return it("should find the scope", function() {
      var obj, scope, xmlTemplater;
      xmlTemplater = new DocXTemplater();
      docX['tagProduitLoop.docx'].load(docX['tagProduitLoop.docx'].loadedContent);
      scope = DocUtils.getOuterXml(docX['tagProduitLoop.docx'].zip.files["word/document.xml"].asText(), 1195, 1245, 'w:p');
      obj = {
        text: "<w:p w:rsidR=\"00923B77\" w:rsidRDefault=\"00923B77\"><w:r><w:t>{#</w:t></w:r><w:r w:rsidR=\"00713414\"><w:t>products</w:t></w:r><w:r><w:t>}</w:t></w:r></w:p>",
        startTag: 1134,
        endTag: 1286
      };
      expect(scope.endTag).toEqual(obj.endTag);
      expect(scope.startTag).toEqual(obj.startTag);
      expect(scope.text.length).toEqual(obj.text.length);
      return expect(scope.text).toEqual(obj.text);
    });
  });

  describe("Dash Loop Testing", function() {
    it("dash loop ok on simple table -> w:tr", function() {
      var Tags, expectedText, text;
      Tags = {
        "os": [
          {
            "type": "linux",
            "price": "0",
            "reference": "Ubuntu10"
          }, {
            "type": "DOS",
            "price": "500",
            "reference": "Win7"
          }, {
            "type": "apple",
            "price": "1200",
            "reference": "MACOSX"
          }
        ]
      };
      docX['tagDashLoop.docx'].setTags(Tags);
      docX['tagDashLoop.docx'].applyTags();
      expectedText = "linux0Ubuntu10DOS500Win7apple1200MACOSX";
      text = docX['tagDashLoop.docx'].getFullText();
      return expect(text).toBe(expectedText);
    });
    it("dash loop ok on simple table -> w:table", function() {
      var Tags, expectedText, text;
      Tags = {
        "os": [
          {
            "type": "linux",
            "price": "0",
            "reference": "Ubuntu10"
          }, {
            "type": "DOS",
            "price": "500",
            "reference": "Win7"
          }, {
            "type": "apple",
            "price": "1200",
            "reference": "MACOSX"
          }
        ]
      };
      docX['tagDashLoopTable.docx'].setTags(Tags);
      docX['tagDashLoopTable.docx'].applyTags();
      expectedText = "linux0Ubuntu10DOS500Win7apple1200MACOSX";
      text = docX['tagDashLoopTable.docx'].getFullText();
      return expect(text).toBe(expectedText);
    });
    return it("dash loop ok on simple list -> w:p", function() {
      var Tags, expectedText, text;
      Tags = {
        "os": [
          {
            "type": "linux",
            "price": "0",
            "reference": "Ubuntu10"
          }, {
            "type": "DOS",
            "price": "500",
            "reference": "Win7"
          }, {
            "type": "apple",
            "price": "1200",
            "reference": "MACOSX"
          }
        ]
      };
      docX['tagDashLoopList.docx'].setTags(Tags);
      docX['tagDashLoopList.docx'].applyTags();
      expectedText = 'linux 0 Ubuntu10 DOS 500 Win7 apple 1200 MACOSX ';
      text = docX['tagDashLoopList.docx'].getFullText();
      return expect(text).toBe(expectedText);
    });
  });

  describe("Intelligent Loop Tagging", function() {
    return it("should work with tables", function() {
      var Tags, expectedText, i, text, _results;
      Tags = {
        clients: [
          {
            first_name: "John",
            last_name: "Doe",
            phone: "+33647874513"
          }, {
            first_name: "Jane",
            last_name: "Doe",
            phone: "+33454540124"
          }, {
            first_name: "Phil",
            last_name: "Kiel",
            phone: "+44578451245"
          }, {
            first_name: "Dave",
            last_name: "Sto",
            phone: "+44548787984"
          }
        ]
      };
      docX['tagIntelligentLoopTable.docx'].setTags(Tags);
      docX['tagIntelligentLoopTable.docx'].applyTags();
      expectedText = 'JohnDoe+33647874513JaneDoe+33454540124PhilKiel+44578451245DaveSto+44548787984';
      text = docX['tagIntelligentLoopTableExpected.docx'].getFullText();
      expect(text).toBe(expectedText);
      _results = [];
      for (i in docX['tagIntelligentLoopTable.docx'].zip.files) {
        expect(docX['tagIntelligentLoopTable.docx'].zip.files[i].asText()).toBe(docX['tagIntelligentLoopTableExpected.docx'].zip.files[i].asText());
        expect(docX['tagIntelligentLoopTable.docx'].zip.files[i].name).toBe(docX['tagIntelligentLoopTableExpected.docx'].zip.files[i].name);
        expect(docX['tagIntelligentLoopTable.docx'].zip.files[i].options.dir).toBe(docX['tagIntelligentLoopTableExpected.docx'].zip.files[i].options.dir);
        _results.push(expect(docX['tagIntelligentLoopTable.docx'].zip.files[i].options.date).not.toBe(docX['tagIntelligentLoopTableExpected.docx'].zip.files[i].options.date));
      }
      return _results;
    });
  });

  describe("getTags", function() {
    it("should work with simple document", function() {
      var tempVars;
      docX['tagExample.docx'] = new DocxGen(docX['tagExample.docx'].loadedContent, {}, {
        intelligentTagging: false
      });
      tempVars = docX['tagExample.docx'].getTags();
      return expect(tempVars).toEqual([
        {
          fileName: 'word/document.xml',
          vars: {
            last_name: true,
            first_name: true
          }
        }, {
          fileName: 'word/footer1.xml',
          vars: {
            last_name: true,
            first_name: true,
            phone: true
          }
        }, {
          fileName: 'word/header1.xml',
          vars: {
            last_name: true,
            first_name: true,
            phone: true,
            description: true
          }
        }
      ]);
    });
    it("should work with loop document", function() {
      var tempVars;
      docX['tagLoopExample.docx'] = new DocxGen(docX['tagLoopExample.docx'].loadedContent, {}, {
        intelligentTagging: false
      });
      tempVars = docX['tagLoopExample.docx'].getTags();
      return expect(tempVars).toEqual([
        {
          fileName: 'word/document.xml',
          vars: {
            offre: {
              nom: true,
              prix: true,
              titre: true
            },
            nom: true,
            prenom: true
          }
        }, {
          fileName: 'word/footer1.xml',
          vars: {
            nom: true,
            prenom: true,
            telephone: true
          }
        }, {
          fileName: 'word/header1.xml',
          vars: {
            nom: true,
            prenom: true
          }
        }
      ]);
    });
    return it('should work if there are no Tags', function() {
      var tempVars;
      docX['qrCodeExample.docx'] = new DocxGen(docX['qrCodeExample.docx'].loadedContent, {}, {
        intelligentTagging: false
      });
      tempVars = docX['qrCodeExample.docx'].getTags();
      return expect(tempVars).toEqual([]);
    });
  });

  describe("xmlTemplater", function() {
    it("should work with simpleContent", function() {
      var content, scope, xmlTemplater;
      content = "<w:t>Hello {name}</w:t>";
      scope = {
        "name": "Edgar"
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.getFullText()).toBe('Hello Edgar');
    });
    it("should work with {.} for this", function() {
      var content, scope, xmlTemplater;
      content = "<w:t>Hello {.}</w:t>";
      scope = 'Edgar';
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.getFullText()).toBe('Hello Edgar');
    });
    it("should work with non w:t content", function() {
      var content, scope, xmlTemplater;
      content = "{image}.png";
      scope = {
        "image": "edgar"
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.content).toBe('edgar.png');
    });
    it("should work with tag in two elements", function() {
      var content, scope, xmlTemplater;
      content = "<w:t>Hello {</w:t><w:t>name}</w:t>";
      scope = {
        "name": "Edgar"
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.getFullText()).toBe('Hello Edgar');
    });
    it("should work with simple Loop", function() {
      var content, scope, xmlTemplater;
      content = "<w:t>Hello {#names}{name},{/names}</w:t>";
      scope = {
        "names": [
          {
            "name": "Edgar"
          }, {
            "name": "Mary"
          }, {
            "name": "John"
          }
        ]
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.getFullText()).toBe('Hello Edgar,Mary,John,');
    });
    it("should work with simple Loop with boolean value", function() {
      var content, scope, xmlTemplater;
      content = "<w:t>Hello {#showName}{name},{/showName}</w:t>";
      scope = {
        "showName": true,
        "name": "Edgar"
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      expect(xmlTemplater.getFullText()).toBe('Hello Edgar,');
      scope = {
        "showName": false,
        "name": "Edgar"
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.getFullText()).toBe('Hello ');
    });
    it("should work with dash Loop", function() {
      var content, scope, xmlTemplater;
      content = "<w:p><w:t>Hello {-w:p names}{name},{/names}</w:t></w:p>";
      scope = {
        "names": [
          {
            "name": "Edgar"
          }, {
            "name": "Mary"
          }, {
            "name": "John"
          }
        ]
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.getFullText()).toBe('Hello Edgar,Hello Mary,Hello John,');
    });
    it("should work with loop and innerContent", function() {
      var content, scope, xmlTemplater;
      content = "</w:t></w:r></w:p><w:p w:rsidR=\"00923B77\" w:rsidRDefault=\"00713414\" w:rsidP=\"00923B77\"><w:pPr><w:pStyle w:val=\"Titre1\"/></w:pPr><w:r><w:t>{title</w:t></w:r><w:r w:rsidR=\"00923B77\"><w:t>}</w:t></w:r></w:p><w:p w:rsidR=\"00923B77\" w:rsidRPr=\"00923B77\" w:rsidRDefault=\"00713414\" w:rsidP=\"00923B77\"><w:r><w:t>Proof that it works nicely :</w:t></w:r></w:p><w:p w:rsidR=\"00923B77\" w:rsidRDefault=\"00923B77\" w:rsidP=\"00923B77\"><w:pPr><w:numPr><w:ilvl w:val=\"0\"/><w:numId w:val=\"1\"/></w:numPr></w:pPr><w:r><w:t>{#pr</w:t></w:r><w:r w:rsidR=\"00713414\"><w:t>oof</w:t></w:r><w:r><w:t xml:space=\"preserve\">} </w:t></w:r><w:r w:rsidR=\"00713414\"><w:t>It works because</w:t></w:r><w:r><w:t xml:space=\"preserve\"> {</w:t></w:r><w:r w:rsidR=\"006F26AC\"><w:t>reason</w:t></w:r><w:r><w:t>}</w:t></w:r></w:p><w:p w:rsidR=\"00923B77\" w:rsidRDefault=\"00713414\" w:rsidP=\"00923B77\"><w:pPr><w:numPr><w:ilvl w:val=\"0\"/><w:numId w:val=\"1\"/></w:numPr></w:pPr><w:r><w:t>{/proof</w:t></w:r><w:r w:rsidR=\"00923B77\"><w:t>}</w:t></w:r></w:p><w:p w:rsidR=\"00FD04E9\" w:rsidRDefault=\"00923B77\"><w:r><w:t>";
      scope = {
        "title": "Everyone uses it",
        "proof": [
          {
            "reason": "it is quite cheap"
          }, {
            "reason": "it is quit simple"
          }, {
            "reason": "it works on a lot of different Hardware"
          }
        ]
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.getFullText()).toBe('Everyone uses itProof that it works nicely : It works because it is quite cheap It works because it is quit simple It works because it works on a lot of different Hardware');
    });
    it("should work with loop and innerContent (with last)", function() {
      var content, scope, xmlTemplater;
      content = "Start </w:t></w:r></w:p><w:p w:rsidR=\"00923B77\" w:rsidRDefault=\"00713414\" w:rsidP=\"00923B77\"><w:pPr><w:pStyle w:val=\"Titre1\"/></w:pPr><w:r><w:t>{title</w:t></w:r><w:r w:rsidR=\"00923B77\"><w:t>}</w:t></w:r></w:p><w:p w:rsidR=\"00923B77\" w:rsidRPr=\"00923B77\" w:rsidRDefault=\"00713414\" w:rsidP=\"00923B77\"><w:r><w:t>Proof that it works nicely :</w:t></w:r></w:p><w:p w:rsidR=\"00923B77\" w:rsidRDefault=\"00923B77\" w:rsidP=\"00923B77\"><w:pPr><w:numPr><w:ilvl w:val=\"0\"/><w:numId w:val=\"1\"/></w:numPr></w:pPr><w:r><w:t>{#pr</w:t></w:r><w:r w:rsidR=\"00713414\"><w:t>oof</w:t></w:r><w:r><w:t xml:space=\"preserve\">} </w:t></w:r><w:r w:rsidR=\"00713414\"><w:t>It works because</w:t></w:r><w:r><w:t xml:space=\"preserve\"> {</w:t></w:r><w:r w:rsidR=\"006F26AC\"><w:t>reason</w:t></w:r><w:r><w:t>}</w:t></w:r></w:p><w:p w:rsidR=\"00923B77\" w:rsidRDefault=\"00713414\" w:rsidP=\"00923B77\"><w:pPr><w:numPr><w:ilvl w:val=\"0\"/><w:numId w:val=\"1\"/></w:numPr></w:pPr><w:r><w:t>{/proof</w:t></w:r><w:r w:rsidR=\"00923B77\"><w:t>}</w:t></w:r></w:p><w:p w:rsidR=\"00FD04E9\" w:rsidRDefault=\"00923B77\"><w:r><w:t> End";
      scope = {
        "title": "Everyone uses it",
        "proof": [
          {
            "reason": "it is quite cheap"
          }, {
            "reason": "it is quit simple"
          }, {
            "reason": "it works on a lot of different Hardware"
          }
        ]
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.getFullText()).toBe('Start Everyone uses itProof that it works nicely : It works because it is quite cheap It works because it is quit simple It works because it works on a lot of different Hardware End');
    });
    return it('should work with not w:t tag (if the for loop is like {#forloop} text {/forloop}) ', function() {
      var content, scope, xmlTemplater;
      content = "Hello {#names}{name},{/names}";
      scope = {
        "names": [
          {
            "name": "Edgar"
          }, {
            "name": "Mary"
          }, {
            "name": "John"
          }
        ]
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.content).toBe('Hello Edgar,Mary,John,');
    });
  });

  describe('DocxQrCode module', function() {
    return describe("Calculate simple Docx", function() {
      var f, fCalled, obj, qrcodezip;
      f = null;
      fCalled = null;
      qrcodezip = null;
      obj = null;
      beforeEach(function() {
        var docx;
        qrcodezip = new JSZip(docXData['qrcodeTest.zip']);
        docx = new DocxGen().setOptions({
          qrCode: true
        });
        return obj = new DocXTemplater("", {
          DocxGen: docx,
          Tags: {
            Tag: "tagValue"
          }
        });
      });
      it("should do it's thing with JSZip.base64", function() {
        var base64data, data;
        data = qrcodezip.files['blabla.png'].asBinary();
        expect(data.length).toBe(1305);
        base64data = JSZip.base64.encode(data);
        expect(base64data.length).toBe(1740);
        expect(base64data.substr(0, 50)).toBe("iVBORw0KGgoAAAANSUhEUgAAAPgAAAD4CAIAAABOs7xcAAAABn");
        return expect(base64data).toBe("iVBORw0KGgoAAAANSUhEUgAAAPgAAAD4CAIAAABOs7xcAAAABnRSTlMA/gABAP1bbA07AAAEzklEQVR4nO3dQY5bKRRA0Xar97/l6g0UAyII4HvONNaPY10xeH7Bn5+fn3/g2/17+g3A3yB0EoROgtBJEDoJQidB6CT8N/qDz+fzN9/HHxt9DzB6/6u+N1j1/FWf8+7vQ17vwYlOgtBJEDoJQidB6CQInQShkzCco4+c2l+fneOummfvnou//j3AKz040UkQOglCJ0HoJAidBKGTIHQSpufoI7ftVc/OiVf9vbNz8dnP7bbPeeS29+lEJ0HoJAidBKGTIHQShE6C0ElYNke/zak98lmvvM/XOdFJEDoJQidB6CQInQShkyB0Er52jj5r9x787OvNv9dyopMgdBKEToLQSRA6CUInQegkLJuj3zb3PXWvyLf+zuis296PE50EoZMgdBKEToLQSRA6CUInYXqOvmrue8rs/eUjs3vkr79+5JUenOgkCJ0EoZMgdBKEToLQSRA6CZ/b9oZ32z0/XjWnH9n9Pr+VE50EoZMgdBKEToLQSRA6CUInYbiPfmq/efb9jOyeE6+al5+aZ5/6PmHVc2Zf70QnQegkCJ0EoZMgdBKEToLQSRjO0U/dBzJ6zm374rftc+++X2X383d/nk50EoROgtBJEDoJQidB6CQInYTpffTZ15+ai696zu75+iv3ruy+N90cHRYQOglCJ0HoJAidBKGTIHQSpu9HP3V/y233n8y67f3v/t5g93NmP08nOglCJ0HoJAidBKGTIHQShE7CcI7+yv3Zr7jtPpnb5uu7/14nOglCJ0HoJAidBKGTIHQShE7C8F6XkVP74qvmrKv+3t3PH/27ds+hT9n973KikyB0EoROgtBJEDoJQidB6CRMz9Fn58q37U+vmluvcurzvO3+9d2c6CQInQShkyB0EoROgtBJEDoJ03P03Vbtu5+aE5+a06/6XdiRU3v5q17vRCdB6CQInQShkyB0EoROgtBJGM7Rb7sn5NTvfe6+x/3Ufvmpe8pPcaKTIHQShE6C0EkQOglCJ0HoJCy71+XUnHvVHvZtc9+R1+9HP3XPjxOdBKGTIHQShE6C0EkQOglCJ2E4Rz+1f/zK3vOqefzsc3bvi+9+zqrXz3KikyB0EoROgtBJEDoJQidB6CR8ds+hd8/FT819Z9/Pt+67n3q+fXT4hdBJEDoJQidB6CQInQShk7BsH31k9+9urnr+qT3pV/b+X78X34lOgtBJEDoJQidB6CQInQShk7B9H/2U2+45mXVqj//U+x9xrwtMEDoJQidB6CQInQShkyB0Erbvo+926nuAV+burzx/lntd4BdCJ0HoJAidBKGTIHQShE7CcB/99bnpbc85dU/OqufPuu33Yp3oJAidBKGTIHQShE6C0EkQOgnDffRZt81xdz//1D767v8n8Mr/Q5jlRCdB6CQInQShkyB0EoROgtBJWDZH/1aze+e798VHds/jX9n7H3GikyB0EoROgtBJEDoJQidB6CR87Rx91fz11P767Jx+5JX98tn36X50+IXQSRA6CUInQegkCJ0EoZPgfvQ/fM4pt93v/srn70QnQegkCJ0EoZMgdBKEToLQSZjeR399v3n3vPbU74+u8sr3DPbR4RdCJ0HoJAidBKGTIHQShE7CcB8dvokTnQShkyB0EoROgtBJEDoJQifhf99MLPyIbss5AAAAAElFTkSuQmCC");
      });
      it("should work with Blablalalabioeajbiojbepbroji", function() {
        runs(function() {
          var base64, binaryData, dat, finished, png, qr;
          fCalled = false;
          f = {
            test: function() {
              return fCalled = true;
            }
          };
          spyOn(f, 'test').andCallThrough();
          if (DocUtils.env === 'browser') {
            qr = new DocxQrCode(qrcodezip.files['blabla.png'].asBinary(), obj, "custom.png", 6);
            return qr.decode(f.test);
          } else {
            base64 = JSZip.base64.encode(qrcodezip.files['blabla.png'].asBinary());
            binaryData = new Buffer(base64, 'base64');
            png = new PNG(binaryData);
            finished = function(a) {
              png.decoded = a;
              qr = new DocxQrCode(png, obj, "custom.png", 6);
              return qr.decode(f.test);
            };
            return dat = png.decode(finished);
          }
        });
        waitsFor(function() {
          return fCalled;
        });
        return runs(function() {
          expect(f.test).toHaveBeenCalled();
          expect(f.test.calls.length).toEqual(1);
          expect(f.test.mostRecentCall.args[0].result).toEqual("Blablalalabioeajbiojbepbroji");
          expect(f.test.mostRecentCall.args[1]).toEqual("custom.png");
          return expect(f.test.mostRecentCall.args[2]).toEqual(6);
        });
      });
      it("should work with long texts", function() {
        runs(function() {
          var base64, binaryData, dat, finished, png, qr;
          fCalled = false;
          f = {
            test: function() {
              return fCalled = true;
            }
          };
          spyOn(f, 'test').andCallThrough();
          if (DocUtils.env === 'browser') {
            qr = new DocxQrCode(qrcodezip.files['custom.png'].asBinary(), obj, "custom.png", 6);
            return qr.decode(f.test);
          } else {
            base64 = JSZip.base64.encode(qrcodezip.files['custom.png'].asBinary());
            binaryData = new Buffer(base64, 'base64');
            png = new PNG(binaryData);
            finished = function(a) {
              png.decoded = a;
              qr = new DocxQrCode(png, obj, "custom.png", 6);
              return qr.decode(f.test);
            };
            return dat = png.decode(finished);
          }
        });
        waitsFor(function() {
          return fCalled;
        });
        return runs(function() {
          expect(f.test).toHaveBeenCalled();
          expect(f.test.calls.length).toEqual(1);
          expect(f.test.mostRecentCall.args[0].result).toEqual("Some custom text");
          expect(f.test.mostRecentCall.args[1]).toEqual("custom.png");
          return expect(f.test.mostRecentCall.args[2]).toEqual(6);
        });
      });
      it("should work with basic image", function() {
        runs(function() {
          var base64, binaryData, dat, finished, png, qr;
          fCalled = false;
          f = {
            test: function() {
              return fCalled = true;
            }
          };
          spyOn(f, 'test').andCallThrough();
          if (DocUtils.env === 'browser') {
            qr = new DocxQrCode(qrcodezip.files['qrcodeTest.png'].asBinary(), obj, "qrcodeTest.png", 4);
            return qr.decode(f.test);
          } else {
            base64 = JSZip.base64.encode(qrcodezip.files['qrcodeTest.png'].asBinary());
            binaryData = new Buffer(base64, 'base64');
            png = new PNG(binaryData);
            finished = function(a) {
              png.decoded = a;
              qr = new DocxQrCode(png, obj, "qrcodeTest.png", 4);
              return qr.decode(f.test);
            };
            return dat = png.decode(finished);
          }
        });
        waitsFor(function() {
          return fCalled;
        });
        return runs(function() {
          expect(f.test).toHaveBeenCalled();
          expect(f.test.calls.length).toEqual(1);
          expect(f.test.mostRecentCall.args[0].result).toEqual("test");
          expect(f.test.mostRecentCall.args[1]).toEqual("qrcodeTest.png");
          return expect(f.test.mostRecentCall.args[2]).toEqual(4);
        });
      });
      return it("should work with image with {tags}", function() {
        runs(function() {
          var base64, binaryData, dat, finished, png, qr;
          fCalled = false;
          f = {
            test: function() {
              return fCalled = true;
            }
          };
          spyOn(f, 'test').andCallThrough();
          if (DocUtils.env === 'browser') {
            qr = new DocxQrCode(qrcodezip.files['qrcodetag.png'].asBinary(), obj, "tag.png", 2);
            return qr.decode(f.test);
          } else {
            base64 = JSZip.base64.encode(qrcodezip.files['qrcodetag.png'].asBinary());
            binaryData = new Buffer(base64, 'base64');
            png = new PNG(binaryData);
            finished = function(a) {
              png.decoded = a;
              qr = new DocxQrCode(png, obj, "tag.png", 2);
              return qr.decode(f.test);
            };
            return dat = png.decode(finished);
          }
        });
        waitsFor(function() {
          return fCalled;
        });
        return runs(function() {
          expect(f.test).toHaveBeenCalled();
          expect(f.test.calls.length).toEqual(1);
          expect(f.test.mostRecentCall.args[0].result).toEqual("tagValue");
          expect(f.test.mostRecentCall.args[1]).toEqual("tag.png");
          return expect(f.test.mostRecentCall.args[2]).toEqual(2);
        });
      });
    });
  });

  describe('qr code testing', function() {
    it('should work with local QRCODE without tags', function() {
      var doc;
      doc = new DocxGen(docX['qrCodeExample.docx'].loadedContent, {}, {
        intelligentTagging: false,
        qrCode: true
      });
      doc.applyTags();
      waitsFor(function() {
        return doc.ready != null;
      });
      return runs(function() {
        var i, _results;
        expect(doc.zip.files['word/media/Copie_0.png'] != null).toBeTruthy();
        _results = [];
        for (i in doc.zip.files) {
          expect(doc.zip.files[i].options.date).not.toBe(docX['qrCodeExampleExpected.docx'].zip.files[i].options.date);
          expect(doc.zip.files[i].name).toBe(docX['qrCodeExampleExpected.docx'].zip.files[i].name);
          _results.push(expect(doc.zip.files[i].options.dir).toBe(docX['qrCodeExampleExpected.docx'].zip.files[i].options.dir));
        }
        return _results;
      });
    });
    it('should work with local QRCODE with {tags}', function() {
      var doc;
      doc = new DocxGen(docX['qrCodeTaggingExample.docx'].loadedContent, {
        'image': 'Firefox_logo'
      }, {
        intelligentTagging: false,
        qrCode: true
      });
      doc.applyTags({
        'image': 'Firefox_logo_small'
      });
      waitsFor(function() {
        return doc.ready != null;
      });
      return runs(function() {
        var b, c, createdText, expectedText, i;
        expect(doc.zip.files['word/media/Copie_0.png'] != null).toBeTruthy();
        for (i in doc.zip.files) {
          expect(doc.zip.files[i].options.date).not.toBe(docX['qrCodeTaggingExampleExpected.docx'].zip.files[i].options.date);
          expect(doc.zip.files[i].name).toBe(docX['qrCodeTaggingExampleExpected.docx'].zip.files[i].name);
          expect(doc.zip.files[i].options.dir).toBe(docX['qrCodeTaggingExampleExpected.docx'].zip.files[i].options.dir);
          b = doc.zip.files[i].asText();
          if (b !== null && i !== "word/document.xml" && i !== "word/_rels/document.xml.rels") {
            c = docX['qrCodeTaggingExampleExpected.docx'].zip.files[i].asText();
            expect(b.length).toBe(c.length);
          }
        }
        createdText = doc.zip.files['word/_rels/document.xml.rels'].asText().replace(/\x20/g, "").replace(/\x0a/g, "");
        expectedText = doc.zip.files['word/_rels/document.xml.rels'].asText().replace(/\x20/g, "").replace(/\x0a/g, "");
        return expect(createdText).toEqual(expectedText);
      });
    });
    return it('should work with loop QRCODE with {tags}', function() {
      var doc;
      doc = new DocxGen(docX['qrCodeTaggingLoopExample.docx'].loadedContent, {}, {
        intelligentTagging: false,
        qrCode: true
      });
      doc.applyTags({
        'images': [
          {
            image: 'Firefox_logo'
          }, {
            image: 'image'
          }
        ]
      });
      waitsFor(function() {
        return doc.ready != null;
      });
      return runs(function() {
        var i, _results;
        expect(doc.zip.files['word/media/Copie_0.png'] != null).toBeTruthy();
        expect(doc.zip.files['word/media/Copie_1.png'] != null).toBeTruthy();
        expect(doc.zip.files['word/media/Copie_2.png'] != null).toBeFalsy();
        _results = [];
        for (i in doc.zip.files) {
          expect(doc.zip.files[i].options.date).not.toBe(docX['qrCodeTaggingLoopExampleExpected.docx'].zip.files[i].options.date);
          expect(doc.zip.files[i].name).toBe(docX['qrCodeTaggingLoopExampleExpected.docx'].zip.files[i].name);
          _results.push(expect(doc.zip.files[i].options.dir).toBe(docX['qrCodeTaggingLoopExampleExpected.docx'].zip.files[i].options.dir));
        }
        return _results;
      });
    });
  });

  describe('Changing the parser', function() {
    it('should work with uppercassing', function() {
      var content, parser, scope, xmlTemplater;
      content = "<w:t>Hello {name}</w:t>";
      scope = {
        "name": "Edgar"
      };
      parser = function(tag) {
        return {
          'get': function(scope) {
            return scope[tag].toUpperCase();
          }
        };
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope,
        parser: parser
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.getFullText()).toBe('Hello EDGAR');
    });
    it('should work when setting from the DocXGen interface', function() {
      var Tags;
      Tags = {
        "first_name": "Hipp",
        "last_name": "Edgar",
        "phone": "0652455478",
        "description": "New Website"
      };
      docX["tagExampleWithParser"].setTags(Tags);
      docX["tagExampleWithParser"].parser = function(tag) {
        return {
          'get': function(scope) {
            return scope[tag].toUpperCase();
          }
        };
      };
      docX['tagExampleWithParser'].applyTags();
      expect(docX['tagExampleWithParser'].getFullText()).toEqual('EDGAR HIPP');
      expect(docX['tagExampleWithParser'].getFullText("word/header1.xml")).toEqual('EDGAR HIPP0652455478NEW WEBSITE');
      return expect(docX['tagExampleWithParser'].getFullText("word/footer1.xml")).toEqual('EDGARHIPP0652455478');
    });
    it('should work with angular parser', function() {
      var Tags;
      Tags = {
        person: {
          first_name: "Hipp",
          last_name: "Edgar",
          birth_year: 1955,
          age: 59
        }
      };
      docX["angularExample.docx"].setTags(Tags);
      docX["angularExample.docx"].parser = angularParser;
      docX["angularExample.docx"].applyTags();
      return expect(docX["angularExample.docx"].getFullText()).toEqual('Hipp Edgar 2014');
    });
    return it('should work with loops', function() {
      var content, scope, xmlTemplater;
      content = "<w:t>Hello {#person.adult}you{/person.adult}</w:t>";
      scope = {
        "person": {
          "name": "Edgar",
          "adult": true
        }
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope,
        parser: angularParser
      });
      xmlTemplater.applyTags();
      return expect(xmlTemplater.getFullText()).toBe('Hello you');
    });
  });

  describe('Non Utf-8 characters', function() {
    it('should read full text correctly', function() {
      var fullText;
      fullText = docX["cyrillic.docx"].getFullText();
      expect(fullText.charCodeAt(0)).toBe(1024);
      expect(fullText.charCodeAt(1)).toBe(1050);
      expect(fullText.charCodeAt(2)).toBe(1048);
      expect(fullText.charCodeAt(3)).toBe(1046);
      expect(fullText.charCodeAt(4)).toBe(1044);
      expect(fullText.charCodeAt(5)).toBe(1045);
      expect(fullText.charCodeAt(6)).toBe(1039);
      return expect(fullText.charCodeAt(7)).toBe(1040);
    });
    it('should still read full text after applying tags', function() {
      var fullText;
      docX["cyrillic.docx"].applyTags({
        name: "Edgar"
      });
      fullText = docX["cyrillic.docx"].getFullText();
      expect(fullText.charCodeAt(0)).toBe(1024);
      expect(fullText.charCodeAt(1)).toBe(1050);
      expect(fullText.charCodeAt(2)).toBe(1048);
      expect(fullText.charCodeAt(3)).toBe(1046);
      expect(fullText.charCodeAt(4)).toBe(1044);
      expect(fullText.charCodeAt(5)).toBe(1045);
      expect(fullText.charCodeAt(6)).toBe(1039);
      expect(fullText.charCodeAt(7)).toBe(1040);
      return expect(fullText.indexOf('Edgar')).toBe(9);
    });
    return it('should insert russian characters', function() {
      var char, outputText, russian, russianText;
      russianText = [1055, 1091, 1087, 1082, 1080, 1085, 1072];
      russian = (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = russianText.length; _j < _len1; _j++) {
          char = russianText[_j];
          _results.push(String.fromCharCode(char));
        }
        return _results;
      })();
      russian = russian.join('');
      docX["tagExample.docx"].applyTags({
        last_name: russian
      });
      outputText = docX["tagExample.docx"].getFullText();
      return expect(outputText.substr(0, 7)).toBe(russian);
    });
  });

  describe('Complex table example', function() {
    it('should work with simple table', function() {
      var fullText;
      docX["tableComplex2Example.docx"].setTags({
        "table1": [
          {
            "t1data1": "t1-1row-data1",
            "t1data2": "t1-1row-data2",
            "t1data3": "t1-1row-data3",
            "t1data4": "t1-1row-data4"
          }, {
            "t1data1": "t1-2row-data1",
            "t1data2": "t1-2row-data2",
            "t1data3": "t1-2row-data3",
            "t1data4": "t1-2row-data4"
          }, {
            "t1data1": "t1-3row-data1",
            "t1data2": "t1-3row-data2",
            "t1data3": "t1-3row-data3",
            "t1data4": "t1-3row-data4"
          }
        ],
        "t1total1": "t1total1-data",
        "t1total2": "t1total2-data",
        "t1total3": "t1total3-data"
      });
      docX["tableComplex2Example.docx"].applyTags();
      fullText = docX["tableComplex2Example.docx"].getFullText();
      return expect(fullText).toBe("TABLE1COLUMN1COLUMN2COLUMN3COLUMN4t1-1row-data1t1-1row-data2t1-1row-data3t1-1row-data4t1-2row-data1t1-2row-data2t1-2row-data3t1-2row-data4t1-3row-data1t1-3row-data2t1-3row-data3t1-3row-data4TOTALt1total1-datat1total2-datat1total3-data");
    });
    it('should work with more complex table', function() {
      var fullText;
      docX["tableComplexExample.docx"].setTags({
        "table2": [
          {
            "t2data1": "t2-1row-data1",
            "t2data2": "t2-1row-data2",
            "t2data3": "t2-1row-data3",
            "t2data4": "t2-1row-data4"
          }, {
            "t2data1": "t2-2row-data1",
            "t2data2": "t2-2row-data2",
            "t2data3": "t2-2row-data3",
            "t2data4": "t2-2row-data4"
          }
        ],
        "t1total1": "t1total1-data",
        "t1total2": "t1total2-data",
        "t1total3": "t1total3-data",
        "t2total1": "t2total1-data",
        "t2total2": "t2total2-data",
        "t2total3": "t2total3-data"
      });
      docX["tableComplexExample.docx"].applyTags();
      fullText = docX["tableComplexExample.docx"].getFullText();
      return expect(fullText).toBe("TABLE1COLUMN1COLUMN2COLUMN3COLUMN4TOTALt1total1-datat1total2-datat1total3-dataTABLE2COLUMN1COLUMN2COLUMN3COLUMN4t2-1row-data1t2-1row-data2t2-1row-data3t2-1row-data4t2-2row-data1t2-2row-data2t2-2row-data3t2-2row-data4TOTALt2total1-datat2total2-datat2total3-data");
    });
    return it('should work with two tables', function() {
      var fullText;
      docX["tableComplex3Example.docx"].setTags({
        "table1": [
          {
            "t1data1": "t1-1row-data1",
            "t1data2": "t1-1row-data2",
            "t1data3": "t1-1row-data3",
            "t1data4": "t1-1row-data4"
          }, {
            "t1data1": "t1-2row-data1",
            "t1data2": "t1-2row-data2",
            "t1data3": "t1-2row-data3",
            "t1data4": "t1-2row-data4"
          }, {
            "t1data1": "t1-3row-data1",
            "t1data2": "t1-3row-data2",
            "t1data3": "t1-3row-data3",
            "t1data4": "t1-3row-data4"
          }
        ],
        "table2": [
          {
            "t2data1": "t2-1row-data1",
            "t2data2": "t2-1row-data2",
            "t2data3": "t2-1row-data3",
            "t2data4": "t2-1row-data4"
          }, {
            "t2data1": "t2-2row-data1",
            "t2data2": "t2-2row-data2",
            "t2data3": "t2-2row-data3",
            "t2data4": "t2-2row-data4"
          }
        ],
        "t1total1": "t1total1-data",
        "t1total2": "t1total2-data",
        "t1total3": "t1total3-data",
        "t2total1": "t2total1-data",
        "t2total2": "t2total2-data",
        "t2total3": "t2total3-data"
      });
      docX["tableComplex3Example.docx"].applyTags();
      fullText = docX["tableComplex3Example.docx"].getFullText();
      return expect(fullText).toBe("TABLE1COLUMN1COLUMN2COLUMN3COLUMN4t1-1row-data1t1-1row-data2t1-1row-data3t1-1row-data4t1-2row-data1t1-2row-data2t1-2row-data3t1-2row-data4t1-3row-data1t1-3row-data2t1-3row-data3t1-3row-data4TOTALt1total1-datat1total2-datat1total3-dataTABLE2COLUMN1COLUMN2COLUMN3COLUMN4t2-1row-data1t2-1row-data2t2-1row-data3t2-1row-data4t2-2row-data1t2-2row-data2t2-2row-data3t2-2row-data4TOTALt2total1-datat2total2-datat2total3-data");
    });
  });

  describe('Raw Xml Insertion', function() {
    docX["xmlInsertionExample.docx"].setTags({
      "complexXml": "<w:p w:rsidR=\"00612058\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr><w:r><w:rPr><w:color w:val=\"FF0000\"/></w:rPr><w:t>My custom XML</w:t></w:r></w:p><w:tbl><w:tblPr><w:tblStyle w:val=\"Grilledutableau\"/><w:tblW w:w=\"0\" w:type=\"auto\"/><w:tblLook w:val=\"04A0\" w:firstRow=\"1\" w:lastRow=\"0\" w:firstColumn=\"1\" w:lastColumn=\"0\" w:noHBand=\"0\" w:noVBand=\"1\"/></w:tblPr><w:tblGrid><w:gridCol w:w=\"2952\"/><w:gridCol w:w=\"2952\"/><w:gridCol w:w=\"2952\"/></w:tblGrid><w:tr w:rsidR=\"00EA4B08\" w:rsidTr=\"00EA4B08\"><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"DDD9C3\" w:themeFill=\"background2\" w:themeFillShade=\"E6\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRPr=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:b/><w:color w:val=\"000000\" w:themeColor=\"text1\"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:color w:val=\"000000\" w:themeColor=\"text1\"/></w:rPr><w:t>Test</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"DDD9C3\" w:themeFill=\"background2\" w:themeFillShade=\"E6\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRPr=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:b/><w:color w:val=\"FF0000\"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:color w:val=\"FF0000\"/></w:rPr><w:t>Xml</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"DDD9C3\" w:themeFill=\"background2\" w:themeFillShade=\"E6\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr><w:r><w:rPr><w:color w:val=\"FF0000\"/></w:rPr><w:t>Generated</w:t></w:r></w:p></w:tc></w:tr><w:tr w:rsidR=\"00EA4B08\" w:rsidTr=\"00EA4B08\"><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"C6D9F1\" w:themeFill=\"text2\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRPr=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"000000\" w:themeColor=\"text1\"/><w:u w:val=\"single\"/></w:rPr></w:pPr><w:r w:rsidRPr=\"00EA4B08\"><w:rPr><w:color w:val=\"000000\" w:themeColor=\"text1\"/><w:u w:val=\"single\"/></w:rPr><w:t>Underline</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"C6D9F1\" w:themeFill=\"text2\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr><w:r w:rsidRPr=\"00EA4B08\"><w:rPr><w:color w:val=\"FF0000\"/><w:highlight w:val=\"yellow\"/></w:rPr><w:t>Highlighting</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"C6D9F1\" w:themeFill=\"text2\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRPr=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:rFonts w:ascii=\"Bauhaus 93\" w:hAnsi=\"Bauhaus 93\"/><w:color w:val=\"FF0000\"/></w:rPr></w:pPr><w:r w:rsidRPr=\"00EA4B08\"><w:rPr><w:rFonts w:ascii=\"Bauhaus 93\" w:hAnsi=\"Bauhaus 93\"/><w:color w:val=\"FF0000\"/></w:rPr><w:t>Font</w:t></w:r></w:p></w:tc></w:tr><w:tr w:rsidR=\"00EA4B08\" w:rsidTr=\"00EA4B08\"><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"F2DBDB\" w:themeFill=\"accent2\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00EA4B08\"><w:pPr><w:jc w:val=\"center\"/><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr><w:r><w:rPr><w:color w:val=\"FF0000\"/></w:rPr><w:t>Centering</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"F2DBDB\" w:themeFill=\"accent2\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRPr=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:i/><w:color w:val=\"FF0000\"/></w:rPr></w:pPr><w:r w:rsidRPr=\"00EA4B08\"><w:rPr><w:i/><w:color w:val=\"FF0000\"/></w:rPr><w:t>Italic</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"F2DBDB\" w:themeFill=\"accent2\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr></w:p></w:tc></w:tr><w:tr w:rsidR=\"00EA4B08\" w:rsidTr=\"00EA4B08\"><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"E5DFEC\" w:themeFill=\"accent4\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"E5DFEC\" w:themeFill=\"accent4\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"E5DFEC\" w:themeFill=\"accent4\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr></w:p></w:tc></w:tr><w:tr w:rsidR=\"00EA4B08\" w:rsidTr=\"00EA4B08\"><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"FDE9D9\" w:themeFill=\"accent6\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"FDE9D9\" w:themeFill=\"accent6\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w=\"2952\" w:type=\"dxa\"/><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"FDE9D9\" w:themeFill=\"accent6\" w:themeFillTint=\"33\"/></w:tcPr><w:p w:rsidR=\"00EA4B08\" w:rsidRDefault=\"00EA4B08\" w:rsidP=\"00612058\"><w:pPr><w:rPr><w:color w:val=\"FF0000\"/></w:rPr></w:pPr></w:p></w:tc></w:tr></w:tbl>"
    });
    docX["xmlInsertionExample.docx"].applyTags();
    it("should work with simple example", function() {
      var i, _results;
      _results = [];
      for (i in docX['xmlInsertionExample.docx'].zip.files) {
        expect(docX['xmlInsertionExample.docx'].zip.files[i].options.date).not.toBe(docX['xmlInsertionExpected.docx'].zip.files[i].options.date);
        expect(docX['xmlInsertionExample.docx'].zip.files[i].name).toBe(docX['xmlInsertionExpected.docx'].zip.files[i].name);
        expect(docX['xmlInsertionExample.docx'].zip.files[i].options.dir).toBe(docX['xmlInsertionExpected.docx'].zip.files[i].options.dir);
        expect(docX['xmlInsertionExample.docx'].zip.files[i].asText().length).toBe(docX['xmlInsertionExpected.docx'].zip.files[i].asText().length);
        _results.push(expect(docX['xmlInsertionExample.docx'].zip.files[i].asText()).toBe(docX['xmlInsertionExpected.docx'].zip.files[i].asText()));
      }
      return _results;
    });
    return it('should work even when tags are after the xml', function() {
      var i, _results;
      docX["xmlInsertionComplexExample.docx"].setTags({
        "complexXml": "<w:p><w:r><w:t>Hello</w:t></w:r></w:p>",
        "name": "Hipp",
        "first_name": "Edgar",
        "products": [
          {
            "year": 1550,
            "name": "Moto",
            "company": "Fein"
          }, {
            "year": 1987,
            "name": "Water",
            "company": "Test"
          }, {
            "year": 2010,
            "name": "Bread",
            "company": "Yu"
          }
        ]
      });
      docX["xmlInsertionComplexExample.docx"].applyTags();
      _results = [];
      for (i in docX['xmlInsertionComplexExample.docx'].zip.files) {
        expect(docX['xmlInsertionComplexExample.docx'].zip.files[i].options.date).not.toBe(docX['xmlInsertionComplexExpected.docx'].zip.files[i].options.date);
        expect(docX['xmlInsertionComplexExample.docx'].zip.files[i].name).toBe(docX['xmlInsertionComplexExpected.docx'].zip.files[i].name);
        expect(docX['xmlInsertionComplexExample.docx'].zip.files[i].options.dir).toBe(docX['xmlInsertionComplexExpected.docx'].zip.files[i].options.dir);
        expect(docX['xmlInsertionComplexExample.docx'].zip.files[i].asText().length).toBe(docX['xmlInsertionComplexExpected.docx'].zip.files[i].asText().length);
        _results.push(expect(docX['xmlInsertionComplexExample.docx'].zip.files[i].asText()).toBe(docX['xmlInsertionComplexExpected.docx'].zip.files[i].asText()));
      }
      return _results;
    });
  });

  describe('SubContent', function() {
    var sub;
    sub = new SubContent("start<w:t>text</w:t>end");
    sub.start = 10;
    sub.end = 14;
    sub.refreshText();
    it("should get the text inside the tags correctly", function() {
      return expect(sub.text).toBe('text');
    });
    it('should get the text expanded to the outer xml', function() {
      sub.getOuterXml('w:t');
      return expect(sub.text).toBe('<w:t>text</w:t>');
    });
    it('should replace the inner text', function() {
      sub.replace('<w:table>Sample Table</w:table>');
      expect(sub.fullText).toBe('start<w:table>Sample Table</w:table>end');
      return expect(sub.text).toBe('<w:table>Sample Table</w:table>');
    });
    it("shouldn't bug if some images don't contain a qrcode", function() {
      var doc;
      doc = new DocxGen(docX['imageExample.docx'].loadedContent, {}, {
        intelligentTagging: false,
        qrCode: true
      });
      expect(doc.zip.files['word/media/image1.jpeg'].asBinary().length).toBe(713625);
      doc.applyTags();
      waitsFor(function() {
        return doc.ready != null;
      });
      return runs(function() {
        return expect(doc.zip.files['word/media/Copie_0.png'].asBinary().length).toBe(713625);
      });
    });
    it('should work with some images containing a qrcode, some not', function() {
      var testDocx;
      testDocx = new DocxGen(docX["qrCodeAndNonQrCodeExample.docx"].loadedContent, {}, {
        intelligentTagging: false,
        qrCode: true
      });
      testDocx.applyTags({
        "image": "image"
      });
      waitsFor(function() {
        return testDocx.ready != null;
      });
      return runs(function() {
        expect(testDocx.zip.files["word/media/Copie_1.png"].asBinary().length).toBe(561513);
        return expect(testDocx.zip.files["word/media/Copie_0.png"].asBinary().length).toBe(18062);
      });
    });
    it('should work with custom generation', function() {
      var testDocx;
      testDocx = new DocxGen(docX["qrCodeCustomGen.docx"].loadedContent, {}, {
        intelligentTagging: false,
        qrCode: true
      });
      testDocx.applyTags();
      waitsFor(function() {
        return testDocx.ready != null;
      });
      return runs(function() {
        return expect(testDocx.zip.files["word/media/Copie_0.png"].asBinary().length).toBe(258);
      });
    });
    it('should work with custom tags', function() {
      var content, scope, xmlTemplater;
      content = "<w:t>Hello {name}</w:t>";
      scope = {
        "name": "Edgar"
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      expect(xmlTemplater.getFullText()).toBe('Hello Edgar');
      DocUtils.tags = {
        start: '[',
        end: ']'
      };
      content = "<w:t>Hello [name]</w:t>";
      scope = {
        "name": "Edgar"
      };
      xmlTemplater = new DocXTemplater(content, {
        Tags: scope
      });
      xmlTemplater.applyTags();
      expect(xmlTemplater.getFullText()).toBe('Hello Edgar');
      return DocUtils.tags = {
        start: '{',
        end: '}'
      };
    });
    it('should work with image in footer when qrcode option is set on', function() {
      var testDocx;
      testDocx = new DocxGen(docX["qrCodeFooter.docx"].loadedContent, {}, {
        intelligentTagging: false,
        qrCode: true
      });
      testDocx.applyTags();
      waitsFor(function() {
        return testDocx.ready != null;
      });
      return runs(function() {
        var i;
        i = "word/media/image1.png";
        return expect(docX['qrCodeFooter.docx'].zip.files[i].asBinary().length).toBe(testDocx.zip.files[i].asBinary().length);
      });
    });
    it('should work with qrcode in footer', function() {
      var testDocx;
      testDocx = new DocxGen(docX["qrCodeRealFooter.docx"].loadedContent, {
        'image': 'Firefox_logo'
      }, {
        intelligentTagging: false,
        qrCode: true
      });
      testDocx.applyTags();
      waitsFor(function() {
        return testDocx.ready != null;
      });
      return runs(function() {
        var i;
        i = "word/media/image1.png";
        expect(docX['qrCodeRealFooter.docx'].zip.files[i].asBinary().length).toBe(testDocx.zip.files[i].asBinary().length);
        i = "word/media/Copie_0.png";
        expect(testDocx.zip.files[i].asBinary().length).not.toBe(0);
        return expect(testDocx.zip.files[i].asBinary().length).toBe(561513);
      });
    });
    it('should work with graphs with qrcode', function() {
      var doc, text;
      doc = new DocxGen(docX["graph.docx"].loadedContent, {}, {
        qrCode: true
      });
      doc.applyTags();
      text = doc.getFullText();
      return expect(text).toBe('');
    });
    it('should work with loops', function() {
      var content, xmlt;
      content = "{innertag</w:t><w:t>}";
      xmlt = new DocXTemplater(content, {
        Tags: {
          innertag: 5
        }
      }).applyTags();
      return expect(xmlt.content).toBe('5</w:t><w:t xml:space="preserve">');
    });
    it('should work with complex loops (1)', function() {
      var content, xmlt;
      content = "<w:t>{#looptag}{innertag</w:t><w:t>}{/looptag}</w:t>";
      xmlt = new DocXTemplater(content, {
        Tags: {
          looptag: true
        }
      }).applyTags();
      return expect(xmlt.content).not.toContain('</w:t></w:t>');
    });
    it('should work with complex loops (2)', function() {
      var content, xmlt;
      content = "<w:t>{#person}</w:t><w:t>{name}{/person}</w:t>";
      xmlt = new DocXTemplater(content, {
        Tags: {
          person: [
            {
              name: "Henry"
            }
          ]
        }
      }).applyTags();
      return expect(xmlt.content).not.toContain('</w:t>Henry</w:t>');
    });
    it('should work with start and end (1)', function() {
      var content, xmlt;
      content = "a</w:t><w:t>{name}";
      xmlt = new DocXTemplater(content, {
        Tags: {
          name: "Henry"
        }
      }).applyTags();
      return expect(xmlt.content).toContain('a</w:t><w:t');
    });
    return it('should work with start and end (2)', function() {
      var content, xmlt;
      content = "{name}</w:t><w:t>a";
      xmlt = new DocXTemplater(content, {
        Tags: {
          name: "Henry"
        }
      }).applyTags();
      return expect(xmlt.content).toContain('Henry</w:t><w:t');
    });
  });

  describe('getting parents context', function() {
    it('should work with simple loops', function() {
      var content, xmlt;
      content = "{#loop}{name}{/loop}";
      xmlt = new DocXTemplater(content, {
        Tags: {
          loop: [1],
          name: "Henry"
        }
      }).applyTags();
      return expect(xmlt.content).toBe("Henry");
    });
    return it('should work with double loops', function() {
      var content, xmlt;
      content = "{#loop_first}{#loop_second}{name_inner} {name_outer}{/loop_second}{/loop_first}";
      xmlt = new DocXTemplater(content, {
        Tags: {
          loop_first: [1],
          loop_second: [
            {
              name_inner: "John"
            }
          ],
          name_outer: "Henry"
        }
      }).applyTags();
      return expect(xmlt.content).toBe("John Henry");
    });
  });

  describe('error messages', function() {
    it('should work with unclosed', function() {
      var content, f;
      content = "<w:t>{tag {age}</w:t>";
      f = function() {
        return new DocXTemplater(content).applyTags();
      };
      return expect(f).toThrow("Unclosed tag : 'tag '");
    });
    return it('should work with unopened', function() {
      var content, f;
      content = "<w:t>tag }age</w:t>";
      f = function() {
        return new DocXTemplater(content).applyTags();
      };
      return expect(f).toThrow("Unopened tag near : 'tag }'");
    });
  });
  describe('LinkManager', function(){
    fileName="word/document.xml";
    lm = new LinkManager(docX['linkExample.docx'].zip, fileName);
    it('should find rels, maxrId', function(){
       lm.loadRels();
       expect(lm.maxRid).toBe(9);
    });
    it('should create link-rels', function(){
      lm.addLinkRels("http://sujithg.com",1);
      expect(lm.maxRid).toBe(10);
    });
  });
  describe('linkReplacer',function(){          
      fileName="word/document.xml";
      lm = new LinkManager(docX['linkExample.docx'].zip, fileName);
      lm.loadRels();
      currentFile = new DocXTemplater(docX['linkExample.docx'].zip.files[fileName].asText(), {
        DocxGen: docX['linkExample.docx'],
        Tags: docX['linkExample.docx'].Tags,
        intelligentTagging: docX['linkExample.docx'].intelligentTagging,
        parser: docX['linkExample.docx'].parser,
        linkManager : lm,
        replaceLinks : {"Null Hello world" : "http://itworks.com"},
        fileName: fileName
      });
      lr = new LinkReplacer(currentFile);
    it('should find hyperlinks',function(){
      lr.findLinks();
      expect(lr.linkMatches[0][0]).toBe('<w:hyperlink r:id="rId6" w:history="1"><w:r w:rsidR="007911CF" w:rsidRPr="007911CF"><w:rPr><w:rStyle w:val="Hyperlink"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr><w:t>Nulla</w:t></w:r><w:proofErr w:type="spellEnd"/><w:r w:rsidR="007911CF" w:rsidRPr="007911CF"><w:rPr><w:rStyle w:val="Hyperlink"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr><w:t xml:space="preserve"> Hello world</w:t></w:r></w:hyperlink>');
      lr.replaceLink(lr.linkMatches[0],lr.linkMatches["offset"]);
      lr.findLinks();
      expect(lr.linkMatches[0][0]).toBe('<w:hyperlink r:id="rId6" w:history="1"><w:r w:rsidR="007911CF" w:rsidRPr="007911CF"><w:rPr><w:rStyle w:val="Hyperlink"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr><w:t>Nulla</w:t></w:r><w:proofErr w:type="spellEnd"/><w:r w:rsidR="007911CF" w:rsidRPr="007911CF"><w:rPr><w:rStyle w:val="Hyperlink"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr><w:t xml:space="preserve"> Hello world</w:t></w:r></w:hyperlink>');
      // expect(lr.replaceLink(lr.findLinks().LinkMatches[1],null)).toBe("something");
      //return expect(lr.LinkMatches.length).toBe(2);
    });
  });

}).call(this);
