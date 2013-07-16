Service Replicator
==================

Small local node.js server which can be used to replicate remote web server endpoints for fast development purposes.

  - Run locally on where you develop your whatever client application
  - Create a server to be replicated
  - Enter service paths
  - Enter endpoint responses
  - Change your .hosts file or put dev args on your code to force app to use this server rather than the remote.
  - Tweak responses on the fly. (not yet implemented)
  - Tears of joy.

![SCREENSHOT](https://raw.github.com/eralpkaraduman/ServiceReplicator/master/screenshot.jpg)


#Prerequisites

 - Administrator rights (to run on 80 port, if you don't need 80 you don't need admin rights)
 - Have node.js installed. (v0.8.14)
 - Have NPM installed.

#Installation

 - Download or clone this repository
 - Open terminal and cd into downloaded directory
 - $ npm install

#To Start & Configure

 - $ sudo node app.js port=80 (default port is 3000)
 - On your browser, go to "hocalhost" (if you are not using on 80 port go to localhost:3000 or localhost:THE_PORT)
 - add a server (more options will be added later)
 - add endpoints for the server
 - enter a static response for the endpoint

#Usage

 - Edit your hosts file or put development arguments on your client code to force it to call localhost rather than remote address

```objc
#if TARGET_IPHONE_SIMULATOR // simulator?
#define apiBase @"http://localhost/api"
#else
#define apiBase @"http://myRemoteServer/api"
#endif
```

 - http://localhost/theEndPointYouHaveJustEntered.php will answer as you have configured
 - have fun.

#To Stop

 ctrl+c on terminal


To Do
=====

 - Toggle servers on/off
 - Parametric responses
 - Capturing requests



