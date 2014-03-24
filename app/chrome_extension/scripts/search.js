// run all our queries here
// and display them in a nice format


// we can either create a whole separate app for google chrome extension
// or somehow find a way to link things together

console.log('hello')

window.onload = function() {
    document.getElementById("button").onclick = function() {
        chrome.extension.sendMessage({
            type: "color-divs"
        });
    }
}