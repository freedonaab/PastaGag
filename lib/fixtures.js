'use strict';

var mongodbUri = require('mongodb-uri');

module.exports = {

    config: function (db, fixtures_path) {
        if (db.type && db.type === 'mongodb') {
            db = db[db.type];
        }
        var host, port, database, user, pass;
        if (db.url) {
            var obj = mongodbUri.parse(db.url);
            host = obj.hosts[0].host;
            port = obj.hosts[0].port;
            database = obj.database;
            user = obj.username;
            pass = obj.password;
        } else {
            host = db.host;
            port = db.port;
            database = db.database;
        }
        var fixtures = require('pow-mongodb-fixtures').connect(database, {
            host: host,
            port: port,
            user: user,
            pass: pass
        });

        fixtures.clear(['users', 'posts'], function(err) {
            console.log('User and Post collection cleared !');
            fixtures.load(fixtures_path + '/users.js', function(err) {
                if (err) {
                    console.log('Collection could not be loaded : ' + err);
                } else {
                    console.log('>> User Collection loaded');
                }
            });
            fixtures.load(fixtures_path + '/posts.js', function(err) {
                if (err) {
                    console.log('Collection could not be loaded : ' + err);
                } else {
                    console.log('>> Post Collection loaded');
                }
            });
        });
    }
};
