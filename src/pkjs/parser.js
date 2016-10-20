var sax = require('sax');

var AtomParserState = {
    START : 1,
    DONE : 2,
    FAILED : -1,
};

function AtomParser() {
    this._parser = sax.parser(true);
    this._state = AtomParserState.START;
    this.callback = null;

    this._currentTag = null;
    this.entry = null;
    this.entries = [];

    this._parser.onerror = function(e) {
        this._state = AtomParserState.FAILED;
        this._finish(e);
    }.bind(this);

    this._parser.onopentag = function(node) {
        if (node.name !== "entry" && !this.entry) return
        if (node.name === "entry") {
            this.entry = node;
        }

        node.parent = this._currentTag;
        node.children = [];
        node.text = ""
        node.parent && node.parent.children.push(node);
        this._currentTag = node;
    }.bind(this);

    this._parser.onclosetag = function(name) {
        if (name === "entry") {
            this.entries.push(this.entry);
            this._currentTag = this.entry = null;
            return;
        }

        if (this._currentTag && this._currentTag.parent) {
            var p = this._currentTag.parent;
            delete this._currentTag.parent;
            this._currentTag = p;
        }
    }.bind(this);

    this._parser.ontext = function(text) {
        if (this._currentTag) {
            this._currentTag.text = text;
        }
    }.bind(this);

    this._parser.onend = function() {
        this._state = AtomParserState.DONE;
        this._finish(null);
    }.bind(this);

    this._finish = function(err) {
        if (err) {
            if (this.callback != null) {
                this.callback(err, null);
            } else {
                throw err;
            }
        } else {
            this.callback && this.callback(null, this.entries);
        }
    }.bind(this);
};

AtomParser.prototype.parse = function(text, callback) {
    this.callback = callback;
    if (this._state != AtomParserState.START) {
        this._finish(new Error("Parser already run."));
        return;
    }
    this._parser.write(text).close();
};

module.exports.AtomParser = AtomParser;
