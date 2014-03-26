// run all our queries here
// and display them in a nice format


// we can either create a whole separate app for google chrome extension
// or somehow find a way to link things together

console.log('hello')
alert("hello")
alert(document.URL)
var currentUrl = document.URL;
var currentUrl = currentUrl.replace(['https://github.com/'], "");
var currentUrl = currentUrl.replace(/[\/?].*/, "");


var http = new XMLHttpRequest();

http.open("GET", "http://localhost:3000/user/"+currentUrl, true);
http.send();

http.onreadystatechange = function(){
  console.log("hello")
  if(http.readyState == 4 && http.status == 200){
    alert(typeof JSON.parse(http.responseText));
    alert(http.responseText)
    chrome.runtime.sendMessage({message: http.responseText}, function(response){
      console.log(response);
    });

    // chrome.extension.sendMessage({message: JSON.parse(http.responseText)}, function(response){
    //   console.log(response)
    // })
    // chrome.storage.local.set({message: JSON.parse(http.responseText)});
  }
}