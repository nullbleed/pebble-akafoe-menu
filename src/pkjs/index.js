var datefmt = require('dateformat');
var ap = require('./parser');

var FEED_URL_MENSA = "http://www.akafoe.de/gastronomie/speisepläne-der-mensen/ruhr-universitaet-bochum/?mid=1?tx_akafoespeiseplan_mensadetails%5Baction%5D=feed&tx_akafoespeiseplan_mensadetails%5Bcontroller%5D=AtomFeed";
var FEED_URL_BISTRO = "http://www.akafoe.de/gastronomie/speisepläne-der-mensen/bistro-der-ruhr-universitaet-bochum/?mid=37?tx_akafoespeiseplan_mensadetails%5Baction%5D=feed&tx_akafoespeiseplan_mensadetails%5Bcontroller%5D=AtomFeed";
var FEED_URL_QWEST = "http://www.akafoe.de/gastronomie/gastronomien/q-west/?mid=38?tx_akafoespeiseplan_mensadetails%5Baction%5D=feed&tx_akafoespeiseplan_mensadetails%5Bcontroller%5D=AtomFeed";

var Locations = {
    MENSA : "menu_mensa",
    BISTRO : "menu_bistro",
    QWEST : "menu_qwest",
};

function parse_atom_feed(url, callback) {
    var request = new XMLHttpRequest();
    var days = [];

    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            if (request.status != 200) {
                console.error("Cannot connect to " + url + ": " + request.statusText);
                return;
            } else {
                var parser = new ap.AtomParser();
                parser.parse(this.responseText, function(err, result) {
                    if (err) {
                        console.error("Parsing failed: " + err);
                        return;
                    } else {
                        for (var r = 0; r < result.length; ++r) {
                            var menu = ap.parse_entry(result[r]);
                            if (!menu.date) {
                                console.warn("Menu has empty .date field. Skip...");
                                continue;
                            }
                            days.push(menu);
                        }

                        if (callback) {
                            callback(days);
                        }
                    }
                });
            } // endif status
        }
    };

    request.open('GET', url, true);
    request.send();
}

function get_menues_for_day(loc, date) {
    var stored = localStorage.getItem(loc);
    if (!stored) {
        console.error("Cannot find today's menu for " + loc);
        return null;
    }

    var today = datefmt(date, "yy-mm-dd");
    var menues = JSON.parse(stored);
    for (var i = 0; i < menues.length; ++i) {
        if (menues[i].date === today) {
            return menues[i].menues;
        }
    }

    console.error("Cannot find today's menu for " + loc);
    return null;
}

// wait for PebbleKit JS
Pebble.addEventListener('ready', function() {
    console.log('PebbleKit JS ready!');

    // DEBUG: send custom message
    //Pebble.sendAppMessage({'TestKey': [8, "test"]}, function() {
    //    console.log("Message sent successfully.");
    //}, function(e) {
    //    console.error("Message failed: " + JSON.stringify(e));
    //});

    // get AppMessage events
    Pebble.addEventListener('appmessage', function(e) {
        var dict = e.payload;
        console.log('Got message: ' + JSON.stringify(dict));

        if ('GetMenu' in dict) {
            var loc = dict['GetMenu'];
            if (loc === 1) {
                console.log("Load menu for 'RUB Mensa'...");
                console.log(JSON.stringify(get_menues_for_day(Locations.MENSA, new Date())));
            } else if (loc === 2) {
                console.log("Load menu for 'RUB Bistro'...");
                console.log(JSON.stringify(get_menues_for_day(Locations. BISTRO, new Date())));
            } else if (loc === 3) {
                console.log("Load menu for 'Q-West'...");
                console.log(JSON.stringify(get_menues_for_day(Locations.QWEST, new Date())));
            } else {
                console.warn("Unkown location code for message 'GetMenu': " + loc);
            }
        }
    });

    // forward ready-state to watch
    Pebble.sendAppMessage({'JSReady': 1});

    // refresh menuDB
    parse_atom_feed(FEED_URL_MENSA, function(days) {
        console.log("Updated menuDB for 'RUB Mensa'.");
        localStorage.setItem(Locations.MENSA, JSON.stringify(days));
    });
    parse_atom_feed(FEED_URL_BISTRO, function(days) {
        console.log("Updated menuDB for 'RUB Bistro'.");
        localStorage.setItem(Locations.BISTRO, JSON.stringify(days));
    });
    parse_atom_feed(FEED_URL_QWEST, function(days) {
        console.log("Updated menuDB for 'Q-West'.");
        localStorage.setItem(Locations.QWEST, JSON.stringify(days));
    });

});
