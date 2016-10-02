/**
 * Created by Alex on 10/1/2016.
 */

function RoomCtrl($scope, appService, $http){

    var socket;

    $scope.roomname = appService.roomname;
    $scope.username = appService.username;
    $scope.message = '';
    $scope.messages = [];

    $scope.addMessage = function(){
        user = appService.username;
        msg = $scope.message;
        socket.emit('chat message', $scope.message, appService.roomname, appService.username);
        $scope.message = '';
    };

    $scope.initialize = function(){

        canvas = document.getElementById('canvas');
        ctx = canvas.getContext("2d");
        fitCanvas();

        color = randomColor();

        canvas.addEventListener("mousemove", findPath);
        canvas.addEventListener("mousedown", findPath);
        canvas.addEventListener("mouseup", findPath);

        console.log($scope.roomname);
        socket = io('/'+$scope.roomname);
        // socket = io();
        console.log(socket);
        socket.on('chat message', function(msg, user){
            console.log(msg);
            // $scope.messages.push(msg);
            $scope.messages.push({Name: user, Message: msg});
            console.log($scope.messages);
            $scope.$apply();
        });
        socket.on('path', function(msg){
            recieveDraw(msg);
        });
        // $http.get('/api/canvas/'+appService.roomname)
        //     .then(
        //         function(res){
        //             console.log(res);
        //         },
        //         function(err){
        //             console.log(err);
        //         }
        //     );
    };

    $scope.sendMessage = function(){
        console.log('send message');
        socket.emit('chat message', $scope.message, appService.roomname, appService.username);
        $scope.message = '';
    };

    /*
    CANVAS
     */

    var canvas, ctx = null;
    var prevX, prevY, currX, currY = 0;
    var lineWidth = 2;
    var color = null;

    var drawPath = false;

    function fitCanvas() {
        // var oldWidth    = canvas.width;
        // var oldHeight   = canvas.height;
        // canvas.setAttribute("width", window.innerWidth);
        // canvas.setAttribute("height", window.innerHeight);

        // var ratio1 =  oldWidth/window.innerWidth;
        // var ratio2 =  oldHeight/window.innerHeight;
        // ctx.setScale(ratio1, ratio2);

        canvas.width = window.innerWidth*.8;
        canvas.height = window.innerHeight*.8;
    }

    function draw() {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.closePath();
        socket.emit("path", {px: prevX, py: prevY, cx: currX, cy: currY, color: color}, appService.roomname);
    }

    function recieveDraw(path) {
        ctx.beginPath();
        ctx.moveTo(path.px, path.py);
        ctx.lineTo(path.cx, path.cy);
        ctx.strokeStyle = path.color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.closePath();
    }

    function findPath() {
        if(event.type === "mousedown") {
            drawPath = true;
            prevX = event.clientX;
            prevY = event.clientY-60;
            currX = event.clientX;
            currY = event.clientY-60;
        }
        else if(event.type === "mousemove") {
            if(drawPath) {
                prevX = currX;
                prevY = currY;
                currX = event.clientX;
                currY = event.clientY-60;
                draw();
            }
        }
        else if(event.type === "mouseup") {
            drawPath = false;
        }
    }

    function randomColor() {
        return '#'+Math.floor(Math.random()*16777215).toString(16);
    }
}