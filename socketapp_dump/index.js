const express = require('express');
const app = express();
const http = require('http').Server(app);
const socketio = require('socket.io');
const io = socketio(http, {
    transports: ['websocket']
});
const port = process.env.PORT || 8080;
const messageHistory = 'message history key';
const drawingHistory = 'drawing history key';
const chatChannel = 'chat message';
const drawingChannel = 'drawing';
const nameChannel = 'name message';
const uuid = require('uuid');
let moment = require('moment');
moment().format();
let redis = require("redis"),
    client = redis.createClient(6379,'redis');
client.on("error", function (err) {
    console.log("Error: " + err);
});
app.use(express.static(__dirname + '/'));
//prepare redis
client.flushall();
start_time = moment().millisecond();
// client.hset(messageHistory, start_time, "Start", redis.print);


function sendHistory(channel, hkey, socketId) {
    client.hkeys(hkey, function (error, keys) {
        keys.forEach(function (key, i) {
            client.hget(hkey, key, function (err, message) {
                let messageObj = Message.fromString(message);
                messageObj.sendTo(socketId);
            })
        })
    })
}
class Message {
    constructor(channel, from, content, time = false) {
        this.channel = channel;
        this.from = from;
        this.content = content;
        this.createdAt = time ? time : moment().millisecond();
        this.id = uuid.v1();
    }
    toString(){
        return JSON.stringify(this);
    }
    static fromString(str){
        let data = JSON.parse(str);
        return new Message(data.channel, data.from, data.content, data.createdAt);
    }
    broadcast(socket){
        socket.broadcast.emit(this.channel, this.toString());
    }
    sendTo(socketId, channel = false){
        io.to(socketId).emit( channel? channel: this.channel, this.toString());
    }
}

function onConnection(socket){
    socket.on(nameChannel, function(msg){
        // Set name
        client.set(socket.id, msg, redis.print);
        let replay = new Message(chatChannel, msg, msg + " enter this chat");
        replay.broadcast(socket);
        client.hset(messageHistory, replay.id, replay.toString(), redis.print);
        sendHistory(chatChannel, messageHistory, socket.id);
        sendHistory(drawingChannel, drawingHistory, socket.id);
    });

    // socket.on(drawingChannel, (data) => socket.broadcast.emit(drawingChannel, data));
    socket.on(drawingChannel, function(data) {
        client.get(socket.id, function (error, name) {
            let message = new Message(drawingChannel,name, data);
            client.hset(drawingHistory, message.id, message.toString(), redis.print);
            message.broadcast(socket);
        });
    });
    socket.on(chatChannel, function(msg){
        client.get(socket.id, function (error, name) {
            let message = new Message(chatChannel,name, msg);
            client.hset(messageHistory, message.id, message.toString(), redis.print);
            message.broadcast(socket);
        });
    });
    socket.on('disconnect', function () {
        client.get(socket.id, function (error, name) {
            let message = new Message(chatChannel, name, 'user disconnected');
            client.hset(messageHistory, message.id, message.toString(), redis.print);
            message.broadcast(socket);
        });
    });
}

io.on('connection', onConnection);
http.listen(port, () => console.log('listening on port ' + port));
