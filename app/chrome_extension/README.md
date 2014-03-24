Things to think about:


Extensions can interact with web pages or servers using content scripts or cross-origin XMLHttpRequests. Extensions can also interact programmatically with browser features such as bookmarks and tabs.


Many extensions add UI to Google Chrome in the form of browser actions or page actions. Each extension can have at most one browser action or page action. Choose a browser action when the extension is relevant to most pages. Choose a page action when the extension's icon should appear or diappear, depending on the page.
Browser - http://developer.chrome.com/extensions/browserAction
Page - http://developer.chrome.com/extensions/pageAction


Each extension needs the following files.
- A manifest file (manifest.json)
- One or more HTML files
- Optional: One or more javascript files
- Any other files your extension needs - for example, image files
- All these files need to go into a single folder
- When distributing extension, the content of the folder need to packaged in a .crx file


Every file in an extension is also accessible by an absolute URL like this:
chrome-extension://<extensionID>/<pathToFile>
*** You can see the ID's for all your loaded extensions by going to the URL chrome://extensions
*** pathToFile is the location of the file you are looking from


Example manifest.js :

{
    "name": "BrowserExtension",
    "version": "0.0.1",
    "manifest_version": 2,
    "description" : "Description ...",
    "icons": { "16": "icons/16x16.png", "48": "icons/48x48.png", "128": "icons/128x128.png" },
    "omnibox": { "keyword" : "yeah" },
    "browser_action": {
        "default_icon": { "19": "icons/19x19.png", "38": "icons/38x38.png" },
        "default_title": "That's the tool tip",
        "default_popup": "browseraction/popup.html"
    },
    "background": {
        "scripts": ["background.js"],
        "persistent": false
    },
    "chrome_url_overrides" : {
        "newtab": "newtab/newtab.html"
    },
    "content_scripts": [{
        "matches": ["http://*/*", "https://*/*"],
        "js": ["content.js"]
    }],
    "devtools_page": "devtools/devtools.html"
}

The popup itself has a html file. At the same time this html file can have scripts, which can listen for events on the popup window and perhaps the DOM itself.



EXTENSION COMMUNICATING WITH SERVERS

Chrome Extensions can communicate with different servers using sendMessage onConnectExternal
onMessage and onConnectExternal

sendMessage:

http://developer.chrome.com/extensions/runtime#method-sendMessage

chrome.runtime.sendMessage(string extensionId, any message, objectoptions, fucntion responseCallback){

}

-string (optional): extensionId - The Id of the extension/app to send the message to. If ommitted, the message willb e sento tyour own extension/app. Required if sending messages from a web page for web messaging.

-message: any message (object, string, whatever)

-object (optional):

-function: the callback function, takes the response, has one parameter error in case of any errors


connect:

chrome.runtime.connect(string extensionId, object connectInfo){

}

onMessageExternal:

This is fired when a mesage is sent from another extension/app. Cannot be used in a content script.

chrome.runtime.onMessageExternal.addListener(function callback){

}

-callback: the callback parameter should be a function that looks like this:

function(some_message, MessageSender sender, function sendResponse){};

onConnectExternal: fired when a connection is made from another extension.

chrome.runtime.onConnectExternal.addListener(function callback){

}



MAIN
1. Content Scripts (Run JavaScript code in the context of web pages) - http://developer.chrome.com/extensions/content_scripts
2. Cross-Origin XHR (Use XMLHttpRequest to send and receive data from remote servers) - http://developer.chrome.com/extensions/xhr
3. Message Passing (Communicate from a content script to its parent extension and vice versa) - http://developer.chrome.com/extensions/messaging



DISTRIBUTION

1. Autoupdating - http://developer.chrome.com/extensions/autoupdate
2. Hosting - http://developer.chrome.com/extensions/hosting
3. Packaging (Create a .crx file to distribute extension) - http://developer.chrome.com/extensions/packaging


QUICK OVERVIEW
http://code.tutsplus.com/tutorials/developing-google-chrome-extensions--net-33076


DEVELOPER's GUIDE
http://developer.chrome.com/extensions/devguide