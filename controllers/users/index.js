'use strict';


var UserModel = require('../../models/users');
var utils = require('../../lib/utils');

module.exports = function (router) {

    router.get('/', function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                utils.respondJSON(res, utils.json.ServerError('err occurred in mongodb: '+err));
            } else {
                utils.respondJSON(res, utils.json.Ok({ users: users }));
            }
        });

    });

    router.post('/', function (req, res) {
        var user_datas = null;

        if (req.body.data && req.body.data.user) {
            user_datas = req.body.data.user;
        } else {
            return utils.respondJSON(res,  utils.json.BadRequest('field user is required'));
        }

        var user = new UserModel();

        user.email = user_datas.email;
        user.username = user_datas.username;
        user.password = user_datas.password;

        user.customCreate(function (err) {
            if (err) {
                utils.respondJSON(res, utils.json.ServerError('error occured in mongodb: '+err));
            } else {
                utils.respondJSON(res, utils.json.Ok({user: user}));
            }
        });
    });

    router.post('/login', function (req, res) {

    });

    router.post('/logout', function (req, res) {

    });
};
