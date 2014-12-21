'use strict';

var request = require('request');
var url = require('url');

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

module.exports = {

    isUrl: function (str) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

        if (pattern.test(str)) {
            return true;
        } else {
            return false;
        }
    },

    fileType: function (str) {

        var youtube_url = 'https://www.youtube.com/watch';
        //check if youtube link
        if (str.substring(0, youtube_url.length) === youtube_url) {
            return 'video';
        }
        //check if one of those image extensions
        var image_extensions = ['.jpg', '.jpeg', '.gif', '.bmp', '.png'];
        for (var i = 0; i < image_extensions.length; ++i) {
            if (endsWith(str, image_extensions[i])) {
                return 'image';
            }
        }
        return null;
    },

    canBeReach: function (str, callback) {

        if (this.fileType(str) === 'video') {
            var url_obj = url.parse(str, true);
            var video_url = url.parse(str, true).query.v;
            if (!video_url) {
                return 'invalid youtube url';
            }
            request.get('http://gdata.youtube.com/feeds/api/videos/'+video_url, function (err, response, body) {
                //console.log('canBeReach', err);
                //console.log('canBeReach', Object.keys[response]);
                //if (body.length < 5000) {
                //    console.log('canBeReach', body);
                //}
                if (err) {
                    callback(err);
                } else if (response.statusCode !== 200) {
                    callback('statusCode is '+response.statusCode);
                } else {
                    callback(null);
                }
            });
        } else {
            request.get(str, function (err, response, body) {
                //console.log('canBeReach', err);
                //console.log('canBeReach', Object.keys[response]);
                //if (body.length < 5000) {
                //    console.log('canBeReach', body);
                //}
                if (err) {
                    callback(err);
                } else if (response.statusCode !== 200) {
                    callback('statusCode is '+response.statusCode);
                } else {
                    callback(null);
                }
            });
        }

    }

};
