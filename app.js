var express = require('express');
var superagent = require('superagent');
var Promise = require("bluebird");
var config = require('./config.json');

var app = express();
app.set('port', 22003);
app.listen();

app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});

var responses = [];

function makeCall(repos) {
    var resp = [];

    repos.forEach(iterateApiCalls);
    return resp;
}

function iterateApiCalls(repo) {
    var auth = "Basic " + new Buffer(config.username + ":" + config.password).toString("base64");
    var uri = 'https://api.github.com/repos/' + config.repoOwner + '/' + repo + '/pulls';
    console.log("Calling URI: " + uri);
    superagent
        .get(uri)
        .set('Authorization', auth)
        .end(dealWithResponse);
}

function dealWithResponse(err, apiResponse) {
    console.log("Response status: " + apiResponse.status);
    if (apiResponse.status == 200) {
        apiResponse.body.forEach(formatMessage);
    }
}

function formatMessage(pull) {
    var str_format = pull.head.repo.name + ': ' + pull.number + ' - ' + pull.title + '\n' + pull.url;
    console.log(str_format);
    return str_format;
}

app.get('/pulls', function (req, res) {
    console.log(req.params.token);

    var r = makeCall(config.repos);
        // .then(function() {
        // res.send(responses.join("\n"));
    // });
});
