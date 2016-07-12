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

app.get('/pulls', function (req, res) {
    console.log(req.query.token);
    app.locals.slackUri = req.query.response_url;

    config.repos.map(callApi);
});

function callApi(repo) {
    var auth = "Basic " + new Buffer(config.username + ":" + config.password).toString("base64");
    var uri = 'https://api.github.com/repos/' + config.repoOwner + '/' + repo + '/pulls';
    console.log("Calling URI: " + uri);
    return superagent
        .get(uri)
        .set('Authorization', auth)
        .set('Content-type', 'application/json')
        // .end(dealWithResponse);
        .end(function (err, response) {
            console.log(response);
        });
}

function dealWithResponse(err, apiResponse) {
    console.log("Response status: " + apiResponse.status);
    if (apiResponse.status == 200) {
        apiResponse.text.map(formatMessage);
    }
}

function formatMessage(pull) {
    var reply = pull.head.repo.name + ': ' + pull.number + ' - ' + pull.title + '\n' + pull.url;
    console.log(reply);
    superagent.post(app.locals.slackUri)
        .send({ response_type: 'in_channel', text: reply });
}
