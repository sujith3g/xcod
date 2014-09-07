var DocUtils, DocXTemplater, DocxQrCode, JSZip, QrCode, vm;

DocUtils = require('./docUtils');

DocXTemplater = require('./docxTemplater');

vm = require('vm');

JSZip = require('jszip');

QrCode = require('qrcode-reader');

module.exports = DocxQrCode = (function() {
  function DocxQrCode(imageData, xmlTemplater, imgName, num, callback) {
    this.xmlTemplater = xmlTemplater;
    this.imgName = imgName != null ? imgName : "";
    this.num = num;
    this.callback = callback;
    this.callbacked = false;
    this.data = imageData;
    if (this.data === void 0) {
      throw new Error("data of qrcode can't be undefined");
    }
    if (DocUtils.env === 'browser') {
      this.base64Data = JSZip.base64.encode(this.data);
    }
    this.ready = false;
    this.result = null;
  }

  DocxQrCode.prototype.decode = function(callback) {
    var _this;
    this.callback = callback;
    _this = this;
    this.qr = new QrCode();
    this.qr.callback = function() {
      var testdoc;
      _this.ready = true;
      _this.result = this.result;
      testdoc = new _this.xmlTemplater.currentClass(this.result, _this.xmlTemplater.toJson());
      testdoc.applyTags();
      _this.result = testdoc.content;
      return _this.searchImage();
    };
    if (DocUtils.env === 'browser') {
      return this.qr.decode("data:image/png;base64," + this.base64Data);
    } else {
      return this.qr.decode(this.data, this.data.decoded);
    }
  };

  DocxQrCode.prototype.searchImage = function() {
    var cb;
    cb = (function(_this) {
      return function(err, data) {
        _this.data = data;
        return _this.callback(_this, _this.imgName, _this.num);
      };
    })(this);
    return this.xmlTemplater.DocxGen.qrCode(this.result, cb);
  };

  return DocxQrCode;

})();
