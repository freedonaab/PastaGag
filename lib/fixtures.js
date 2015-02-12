'use strict';

module.exports = {

    config: function (db, fixtures_path) {
        if (db.type && db.type === 'mongodb') {
            db = db[db.type];
        }

        var fixtures = require('pow-mongodb-fixtures').connect(db.database, {
            host: db.host,
            port: db.port
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
