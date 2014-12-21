'use strict';


var IndexModel = require('../models/index');


module.exports = function (router) {

    var model = new IndexModel();


    router.get('/',
        function (req, res, next) {
            next();
        },
        function (req, res) {
            res.render('index', model);
        }
    );

    router.get('/csrf',
        function (req, res) {
            res.send({ _csrf: res.locals._csrf });
        }
    );

};
