var express = require('express');
var superagent = require('superagent');
var app = express();

app.get('/pulls', function (req, res) {
    superagent
        .get('https://api.github.com/v3/repos/Lululemon/hubq-backend/pulls')
        // .send({ name: 'Manny', species: 'cat' })
        // .set('X-API-Key', 'foobar')
        // .set('Accept', 'application/json')
        .end(function(err, res){
            console.log("Response status: " + res.status);
        });
    res.send('yobo');

});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
