var DocUtils, ScopeManager;

DocUtils = require('./docUtils');

module.exports = ScopeManager = (function() {
  function ScopeManager(tags, scopePath, usedTags, scopeList, parser) {
    this.tags = tags;
    this.scopePath = scopePath;
    this.usedTags = usedTags;
    this.scopeList = scopeList;
    this.parser = parser;
  }

  ScopeManager.prototype.loopOver = function(tag, callback, inverted) {
    var i, scope, type, value, _i, _len;
    if (inverted == null) {
      inverted = false;
    }
    value = this.getValue(tag);
    type = typeof value;
    if (inverted) {
      if (!value) {
        return callback(this.scopeList[this.num]);
      }
      if (type === 'string') {
        return;
      }
      if (type === 'object' && value.length < 1) {
        callback(this.scopeList[this.num]);
      }
      return;
    }
    if (value == null) {
      return;
    }
    if (type === 'object') {
      for (i = _i = 0, _len = value.length; _i < _len; i = ++_i) {
        scope = value[i];
        callback(scope);
      }
    }
    if (value === true) {
      return callback(this.scopeList[this.num]);
    }
  };

  ScopeManager.prototype.getValue = function(tag, num) {
    var parser, result, scope;
    this.num = num != null ? num : this.scopeList.length - 1;
    scope = this.scopeList[this.num];
    parser = this.parser(DocUtils.wordToUtf8(tag));
    result = parser.get(scope);
    if (result === void 0 && this.num > 0) {
      return this.getValue(tag, this.num - 1);
    }
    return result;
  };

  ScopeManager.prototype.getValueFromScope = function(tag) {
    var result, value;
    result = this.getValue(tag);
    if (result != null) {
      if (typeof result === 'string') {
        this.useTag(tag);
        value = result;
        if (value.indexOf(DocUtils.tags.start) !== -1 || value.indexOf(DocUtils.tags.end) !== -1) {
          throw new Error("You can't enter " + DocUtils.tags.start + " or	" + DocUtils.tags.end + " inside the content of the variable. Tag: " + tag + ", Value: " + result);
        }
      } else if (typeof result === "number") {
        value = String(result);
      } else {
        value = result;
      }
    } else {
      this.useTag(tag);
      value = "undefined";
    }
    return value;
  };

  ScopeManager.prototype.useTag = function(tag) {
    var i, s, u, _i, _len, _ref;
    u = this.usedTags;
    _ref = this.scopePath;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      s = _ref[i];
      if (u[s] == null) {
        u[s] = {};
      }
      u = u[s];
    }
    if (tag !== "") {
      return u[tag] = true;
    }
  };

  return ScopeManager;

})();
