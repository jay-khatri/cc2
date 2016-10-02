/**
 * Created by Alex on 10/1/2016.
 */

function LoginCtrl($scope, appService, $location) {
    $scope.username = '';
    $scope.roomname = '';

    $scope.joinRoom = function(){
        appService.username = $scope.username;
        appService.roomname = $scope.roomname;
        $location.path("/room");
    };

    $scope.createRoom = function(){
        appService.roomname = makeid();
        appService.username = $scope.username;
        $location.path("/room");
    };

    function makeid()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
}