'use strict';


var PostsModel = require('../../models/posts');


module.exports = function (router) {

    var model = new PostsModel();


    router.get('/', function (req, res) {
        
        res.send('<code><pre>' + JSON.stringify(model, null, 2) + '</pre></code>');
        
    });

};
