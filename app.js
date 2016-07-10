var express = require('express');
var superagent = require('superagent');
var waterfall = require('async-waterfall');
var config = require('./config.json');

var app = express();
app.set('port', 22003);
app.listen();

app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});

var responses = [];

function makeCall(res) {
    var resp = [];

    waterfall([
        config.repos.map(callApi)
    ]);
}

function callApi(repo) {
    var auth = "Basic " + new Buffer(config.username + ":" + config.password).toString("base64");
    var uri = 'https://api.github.com/repos/' + config.repoOwner + '/' + repo + '/pulls';
    console.log("Calling URI: " + uri);
    return superagent
        .get(uri)
        .set('Authorization', auth)
        .end(dealWithResponse);
}

function dealWithResponse(err, apiResponse) {
    console.log("Response status: " + apiResponse.status);
    if (apiResponse.status == 200) {
        return apiResponse.body.map(formatMessage);
    }
}

function formatMessage(pull) {
    var str_format = pull.head.repo.name + ': ' + pull.number + ' - ' + pull.title + '\n' + pull.url;
    console.log(str_format);
    responses.push(str_format);
    return str_format;
}

app.get('/pulls', function (req, res) {
    console.log(req.params.token);

    var r = makeCall(res);
        // .then(function() {
        // res.send(responses.join("\n"));
    // });
    console.log(r);
});
