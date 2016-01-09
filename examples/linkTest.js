DocxGen=require('../js/docxgen.js')
var fs = require('fs');
var docx = new DocxGen().loadFromFile('linkExample1.docx',{
  "intelligentTagging":true,
  "replaceLinks": {
    "Nulla":"http://nulla.com",
    "Nunc":"http://nunc.com"
  }
});
docx.setTags({
  "links":[
  {"link":"Nulla"},
  {"link":"Nunc"}
  ]
});
    docx.finishedCallback = function() {
      out = docx.output({
        download: false,
        type: "string"
      });
      fs.writeFile("./linkResult" + ".docx", new Buffer(out, "binary"));
    }
docx.applyTags();


