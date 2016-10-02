/**
 * Created by Alex on 10/1/2016.
 */

var express = require('express');
var AWS = require('aws-sdk');
AWS.config.update({region: "us-west-2", endpoint: "https://dynamodb.us-west-2.amazonaws.com",
    accessKeyId:'AKIAJBCJOYOOUWLYAKZQ',
    secretAccessKey:'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'});
var fs = require('fs');

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 16; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var table = "messages";

// var table = "messages";
// var params = {
//     TableName: "messages",
//     KeySchema: [
//         // { AttributeName: "user", KeyType: "HASH"},
//         { AttributeName: "msg", KeyType: "HASH"},  //Partition key
//         { AttributeName: "room", KeyType: "RANGE" }  //Sort key
//     ],
//     AttributeDefinitions: [
//         // { AttributeName: "user", AttributeType: "S" },
//         { AttributeName: "msg", AttributeType: "S" },
//         { AttributeName: "room", AttributeType: "N"}
//     ],
//     ProvisionedThroughput: {
//         ReadCapacityUnits: 10,
//         WriteCapacityUnits: 10
//     }
// };

// dynamodb.createTable(params, function(err, data) {
//     if (err) {
//         console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
//     }
// });

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);
for(var i = 0; i < 10; i++){
    (function(){
        paths = [];
        var nsp = io.of('/'+i);
        nsp.on('connection', function(socket){
            socket.on('chat message', function(msg, room, user){
                console.log(msg);
                var params = {
                    TableName:table,
                    Item:{
                        "msg": msg,
                        "room": parseInt(room),
                        "user": user,
                        "id": makeid()
                    }
                };

                console.log("Adding a new item...");
                docClient.put(params, function(err, data) {
                    if (err) {
                        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("Added item:", JSON.stringify(data, null, 2));
                    }
                });
                nsp.emit('chat message',msg);
            });

            socket.on('path', function(msg, room){
                paths.push(msg);
                var params = {
                    TableName:"canvases",
                    Item:{
                        "path": msg,
                        "room": parseInt(room),
                        "id": makeid()
                    }
                };

                console.log("Adding a new item...");
                docClient.put(params, function(err, data) {
                    if (err) {
                        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("Added item:", JSON.stringify(data, null, 2));
                    }
                });
                socket.broadcast.emit('path', msg);
            });
        });
    })()
}

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

app.get('/api/canvas/:room', function(req, res){

    var params = {
        TableName : "canvases",
        KeyConditionExpression: "#room = :n",
        ExpressionAttributeNames:{
            "#room": "room"
        },
        ExpressionAttributeValues: {
            ":n":parseInt(req.params.room)
        }
    };

    docClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            data.Items.forEach(function(item) {
                paths.push(item.path);
                socket.broadcast.emit('path', item.path);
            });
        }
    });
});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
server.listen(appEnv.port, '0.0.0.0', function() {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});
