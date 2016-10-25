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
            this._currentTag.text += text;
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

function parse_entry(entry) {
    var dateExp = /^.*\/(\d{2}-\d{2}-\d{2})/;
    var itemExp = /^([^()]+\S)\s+((?:\(.*\)\s+){0,2})([\d,]+)\s*EUR\s*-\s*([\d,]+)\s*EUR$/;

    var menu = {
        'date': "",
        'menues': [],
    };

    for (var i = 0; i < entry.children.length; ++i) {
        if (entry.children[i].name === "id") { // get date of this entry
            var id = entry.children[i];
            menu.date = id.text.replace(dateExp, '$1');
        } else if (entry.children[i].name === "content") { // get content of this entry
            var content = entry.children[i].children[0];
            for (var j = 0; j < content.children.length; ++j) {
                if (content.children[j].name === "p") { // section header
                    var p = content.children[j];
                    menu.menues.push({
                        'title': p.children[0].text,
                        'items': [],
                    });
                } else if (content.children[j].name === "ul") { // section body
                    var ul = content.children[j];
                    for (var k = 0; k < ul.children.length; ++k) {
                        var li = ul.children[k];
                        var text = li.text.replace(/\s+/g, ' ').trim();
                        var match = itemExp.exec(text);

                        if (match === null) {
                            console.error("Cannot parse menu entry: " + text);
                        } else {
                            menu.menues[menu.menues.length - 1].items.push({
                                'description': match[1].trim(),
                                'attrs': match[2].trim(),
                                'price': match[3] + "€ / " + match[4] + "€",
                            });
                        }
                    } // ul.children
                } // endif
            } // content.children
        } // endif
    } // entry.children

    return menu;
}

module.exports.AtomParser = AtomParser;
module.exports.parse_entry = parse_entry;
