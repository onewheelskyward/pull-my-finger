var express = require('express');
var superagent = require('superagent');
var app = express();
var config = require('./config.json');

var responses = [];

app.get('/pulls', function (req, res) {
    console.log(req.params.token);

    var r = makeCall(config.repos, function(res) {
        console.log(responses.join("\n"));
    });

    // console.log(r.join("\n"));
    res.send(responses.join("\n"));
});

function makeCall(repos, callback) {
    var auth = "Basic " + new Buffer(config.username + ":" + config.password).toString("base64");

    repos.forEach(function(repo) {
        var uri = 'https://api.github.com/repos/' + config.repoOwner + '/' + repo + '/pulls';
        console.log("Calling URI: " + uri);
        superagent
            .get(uri)
            .set('Authorization', auth)
            .end(function(err, apiResponse) {
                console.log("Response status: " + apiResponse.status);
                if(apiResponse.status == 200) {
                    apiResponse.body.forEach(function(pull) {
                        var str_format = pull.head.repo.name + ': ' + pull.number + ' - ' + pull.title + '\n' + pull.url;
                        console.log(str_format);
                        responses.push(str_format);
                    });
                }
            });
    });
    return responses;
}

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
