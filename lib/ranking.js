'use strict';

function log(b, n) {
    return Math.log(n) / Math.log(b);
}

module.exports = {

    hotness: function (post) {
        //s = score(ups, downs)
        //order = log(max(abs(s), 1), 10)
        //sign = 1 if s > 0 else -1 if s < 0 else 0
        //seconds = epoch_seconds(date) - 1134028003
        //return round(order + sign * seconds / 45000, 7);

        //downvotes + upvotes
        var score = post.votes.score.up - post.votes.score.down;

        var order = log(10, Math.max(Math.abs(score), 1));

        var sign = 0;
        if (score > 0) {
            sign = 1;
        } else if (score < 0) {
            sign = -1;
        }

        var seconds = post.created_at.getTime() - 1134028003;
        console.log('post hotness: seconds: ', seconds );
        console.log('post hotness: date: ', post.created_at );

        var hotness = Math.round(order * sign + seconds / 45000);

        console.log('post hotness: hotness', hotness);

        return hotness;
    }

};
