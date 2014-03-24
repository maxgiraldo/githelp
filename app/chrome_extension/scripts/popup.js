var http = new XMLHttpRequest();

document.getElementById("button").onclick = function() {
  console.log("hello")
  http.open("POST", "http://192.168.1.46:3000/sessions", true);
  // make request like this to appointment with all the
  // relevant details
  // then when the server gets the message, save
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.setRequestHeader("Content-length", params.length);
  http.setRequestHeader("Connection", "close");

  http.send("duration=wassup");
  // 192.168.1.253:3000
  return false;
}

http.onreadystatechange = function(){
  if(http.readyState == 4 && http.status == 200){
    alert(http.responseText);
    alert("hello");
  }
}