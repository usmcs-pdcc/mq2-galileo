/* mq2-galileo
 * author: hadrihl */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var socket = require('socket.io')(http);

// serves static file
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

http.listen(55555, function() {
    console.log("mq2-galileo is listening at *:55555");
});

var mraa = require('mraa'); // include Libmraa
console.log("Libmraa version: " + mraa.getVersion()); // checkout Libmraa version

var pin = new mraa.Aio(0); // bind mq-2 gas sensor to analog pin A0

function measureGasLevel(socket) {
    var data = pin.read(); // read input from A0
    
    socket.emit('stream', data); // stream-out data to socket:client
    console.log("gas level: " + data); // print out gas level
}

socket.on('connect', function(socket) { // receives client connection
    console.log("User connected.");
    
    var intervalID = setInterval(function() {
        measureGasLevel(socket);
    }, 1500); // measure gas level with interval 1.5 seconds
    
    socket.on('disconnect', function() {
        clearInterval(intervalID); // clear client connection
        console.log("user disconnected.");
    });
});

