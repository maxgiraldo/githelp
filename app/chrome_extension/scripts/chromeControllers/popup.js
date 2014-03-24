chrome.controller('PopupController', function ($scope) {

    $scope.form = true;
    $scope.showForm = function(){
      $scope.form = !$scope.form;
    }
    $scope.hello = "hello"

    var http = new XMLHttpRequest();

    $scope.submitForm = function(){
      console.log("hello")
      var params = "duration="+$scope.duration+"&topic="+$scope.topic+"&message="+$scope.message;
      console.log(params);
      http.open("POST", "http://192.168.1.178:3000/sessions", true);
      // make request like this to appointment with all the
      // relevant details
      // then when the server gets the message, save
      http.setRequestHeader('Access-Control-Allow-Origin', '*');
      http.setRequestHeader('Access-Control-Allow-Methods', 'POST');
      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      // http.setRequestHeader("Content-length", params.length);
      // http.setRequestHeader("Connection", "close");

      http.send(params);
    };

    http.onreadystatechange = function(){
      if(http.readyState == 4 && http.status == 200){
        alert(http.responseText);
        alert("hello");
      }
    };

    $scope.searchUser = function(){
      console.log("hello")
      var params = "queryInput="+$scope.queryInput;
      console.log(params);
      http.open("POST", "http://192.168.1.178:3000/query", true);
      // make request like this to appointment with all the
      // relevant details
      // then when the server gets the message, save
      http.setRequestHeader('Access-Control-Allow-Origin', '*');
      http.setRequestHeader('Access-Control-Allow-Methods', 'POST');
      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      // http.setRequestHeader("Content-length", params.length);
      // http.setRequestHeader("Connection", "close");

      http.send(params);
    }

  }
);
