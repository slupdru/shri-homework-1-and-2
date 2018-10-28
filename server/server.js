"use strict";
exports.__esModule = true;
var express_1 = require("express");
var body_parser_1 = require("body-parser");
var cors_1 = require("cors");
var fs_1 = require("fs");
var startTime = new Date();
var port = 8000;
var app = express_1["default"]();
app.use(cors_1["default"]());
app.use(body_parser_1["default"].json());
app.use(body_parser_1["default"].urlencoded({ extended: true }));
function addZero(number) {
    if (number < 10)
        return "0" + number;
    else
        return number + '';
}
app.post('/status', function (req, res) {
    var allSeconds = Math.round((Date.now() - startTime.getTime()) / 1000);
    var hours = Math.floor(allSeconds / (60 * 60));
    var minutes = Math.floor((allSeconds - hours * 60 * 60) / 60);
    var seconds = Math.round(allSeconds - hours * 60 * 60 - minutes * 60);
    res.send(addZero(hours) + ":" + addZero(minutes) + ":" + addZero(seconds));
});
app.post('/api/events', function (req, res) {
    var body = req.body;
    var types = body.types;
    if (!types.includes('critical') && !types.includes('info')) {
        res.status(400).send('incorrect type');
    }
    else {
        fs_1["default"].readFile('events.json', 'utf8', function (err, data) {
            if (err)
                throw err;
            var startPosition = (body.page - 1) * body.itemsPerPage;
            var endPosition = startPosition + body.itemsPerPage;
            var dataFromFile = JSON.parse(data);
            var result = dataFromFile.events.filter(function (el) { return types.indexOf(el.type) !== -1; }).slice(startPosition, endPosition);
            res.json({ events: result });
        });
    }
});
app.all('*', function (req, res) {
    res.status(404).send('<h1>Page not found</h1>');
});
app.listen(port, function () {
    console.log("Listening at http://localhost:" + port + "/");
});
