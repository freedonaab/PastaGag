'use strict';

module.exports = function (router) {

    router.get('/fake/images/fails/*', function (req, res) {
        res.status(404).send('Error Image Not Found!!');

    });

    router.get('/fake/images/success/*', function (req, res) {
        res.status(200).send('Take your cool image dude!!');
    });


    router.get('/fake/videos/fails/*', function (req, res) {
        res.status(404).send('Error Video Not Found!!');

    });

    router.get('/fake/videos/success/*', function (req, res) {
        res.status(200).send('Take your cool video dude!!');
    });

};
