var ap = require('./parser');

var FEED_URL_MENSA = "http://www.akafoe.de/gastronomie/speisepläne-der-mensen/ruhr-universitaet-bochum/?mid=1?tx_akafoespeiseplan_mensadetails%5Baction%5D=feed&tx_akafoespeiseplan_mensadetails%5Bcontroller%5D=AtomFeed";
var FEED_URL_BISTRO = "http://www.akafoe.de/gastronomie/speisepläne-der-mensen/bistro-der-ruhr-universitaet-bochum/?mid=37?tx_akafoespeiseplan_mensadetails%5Baction%5D=feed&tx_akafoespeiseplan_mensadetails%5Bcontroller%5D=AtomFeed";
var FEED_URL_QWEST = "http://www.akafoe.de/gastronomie/gastronomien/q-west/?mid=38?tx_akafoespeiseplan_mensadetails%5Baction%5D=feed&tx_akafoespeiseplan_mensadetails%5Bcontroller%5D=AtomFeed";

function parse_atom_feed(url) {
    var request = new XMLHttpRequest();

    var days = [];

    request.onload = function() {
        console.log("Received Atom Feed");
        var parser = new ap.AtomParser();
        parser.parse(this.responseText, function(err, result) {
            if (err) {
                console.error("Parsing failed: " + err);
            } else {
                for (var r = 0; r < result.length; ++r) {
                    var e = result[r];
                    var date;
                    var menues = [];
                    for (var i = 0; i < e.children.length; ++i) {
                        if (e.children[i].name == "id") {
                            date = e.children[i].text.replace(/^.*\/(\d\d-\d\d-\d\d)/g, '$1');
                        } else if (e.children[i].name == "content") {
                            c = e.children[i];
                            for (var j = 0; j < c.children.lenght; ++j) {
                                if (c.children.name == "p") {
                                    menues.push({'section': c.children[j].children[0].text});
                                } else if (c.children.name == "ul") {
                                }
                            }
                        }
                    }

                    console.log("Got entry [" + date + "] " + menues);
                }
            }
        });
    }

    request.open('GET', url, true);
    request.send();
}

// wait for PebbleKit JS
Pebble.addEventListener('ready', function() {
    console.log('PebbleKit JS ready!');

    Pebble.sendAppMessage({'TestKey': [8, "test"]}, function() {
        console.log("Message sent successfully.");
    }, function(e) {
        console.error("Message failed: " + JSON.stringify(e));
    });

    parse_atom_feed(FEED_URL_MENSA);
});
